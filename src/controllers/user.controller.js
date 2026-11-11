import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { emailVerficationMailgenContent , forgetPasswordMailgenContent , sendEmail } from "../utils/mail.js"
import {User} from "../models/user.model.js"
import crypto from "crypto"
import jwt from "jsonwebtoken" 
import { isValidObjectId } from "mongoose"

const emailVerification = asyncHandler(async (req, res) => {
    // 1. Route se emailToken nikalne ke liye check karo ki route mein bhi yahi naam ho
    const { emailToken } = req.params;
    if (!emailToken) {
        throw new ApiError(400, "Email token not found");
    }

    // 2. Token ko hash karo
    const hashedToken = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    // 3. User dhoondo jiska token match kare aur expire na hua ho
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired"); // 404 ki jagah 400 zyada behtar hai
    }

    // 4. Fields update karo (Semicolon lagana zaroori hai!)
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully!"));
});

const generateAccessAndRefreshToken = async (userId) => {
   try{
      const user = await User.findById(userId)
    if(!user) throw new ApiError(400 , "Your not registered");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken()
    user.refreshToken =refreshToken

    await user.save({validateBeforeSave : false})
    return {accessToken , refreshToken}
   }catch(err){
    throw new ApiError(500 , "Error while generating tokens")
   }
    
}

const userRegisterationController = asyncHandler(async(req,res)=>{
    //take data from body and chck validation
    //cheak user exists or not via email / username and chck validation
    //
    const {username,email,password,fullname} = req.body
    if([username,email,password,fullname].some((fields)=>fields.trim()=="")) throw new ApiError(400 , "All fields are required");

    const userExist = await User.findOne({$or : [{username},{email}]})
    if(userExist) throw new ApiError(404 , "Your already registered , Please login..")
    
    const user = await User.create({
        username,email,password,fullname,isEmailVerified : false
    });

    const {unHashedToken, hashedToken, expires} =  User.generateTemporaryToken();
   
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpires = expires

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email : user?.email,
        subject : "Please verify this email",
        mailgenContent : emailVerficationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });
  

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires")
    if(!createdUser) throw new ApiError(500 , "Something went wrong while regerting user")
    
    return res.status(200).json(new ApiResponse(200 , createdUser,"Your registerd successfully and verfication mail send on your email" ))
})

const userLoginController = asyncHandler(async(req,res)=>{
    //get dta = req.body
    //validation cheak fild are not empty
    //cheak user exist or not by email or username
    //check email verifed or not and validation 
    //cheak password is correct or not
    //generate access token and refresh token
    //send cookie
    //save refresh token in db
    //return response to frontend
    const {email , username , password} = req.body
    if(email.trim()==="" || username.trim()==="") throw new ApiError(404 , "Email/Username are required");
    if(password.trim()==="") throw new ApiError(404 , "Please Enter a password");

    const user = await User.findOne({
        $or:[{email},{username}]
    });
    if(!user) throw new ApiError(404 , "Your not register please registeration first before login")

    if(!user.isEmailVerified) throw new ApiError(404 , "Your not verified please check your mail and verified first before login")
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid)throw new ApiError(404 , "invalid credentials");

    const {refreshToken , accessToken} = await generateAccessAndRefreshToken(user._id);

    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires")
    
    const options ={
        htppOnly : true,
        secure : true
    }

    return res.status(200).cookie("accessToken" , accessToken , options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200 , {user : userLoggedIn.fullname } , "you logged in successfully"))
})

const userLogoutController = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            refreshToken : ""
        },
    },
    {
        new : true
    }
   )

   const options ={
      htppOnly : true,
      secure : true
   }

   return res.status(200)
   .clearCookie("accessToken" , options)
   .clearCookie("refreshToken" , options)
   .json(new ApiResponse(200 , {} , "User logout successfully"))
})

const getCurrentUserController = asyncHandler(async(req,res)=>{
    const getUser = await User.findById(req.user._id).select("-_id -password -refreshToken -emailVerificationToken -emailVerificationTokenExpires")
     return res.status(200).json(new ApiResponse(200 , getUser , "Current user fetched successfully"))
})
const resentEmailVerification = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id);
    if(!user) throw new ApiError(401 , "User dosn't exist");

    if(user.isEmailVerified) throw new ApiError(401 , "Email already verified");
    const {unHashedToken, hashedToken, expires} =  User.generateTemporaryToken();
   
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpires = expires

    await user.save({validateBeforeSave:false})

    await sendEmail({
        email : user?.email,
        subject : "Please verify this email",
        mailgenContent : emailVerficationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });
  
    return res.status(200).json(new ApiResponse(200 , {} , "Email has been sent to your email addresss"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(400 , "Unauthrized request")
    
    try{
        const decodedToekn = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToekn?._id)
        if(!user) throw new ApiError(400 , "Invalid Refresh Token");

        if(incomingRefreshToken!==user.refreshToken) throw new ApiError(400 , "Refresh token in expired")
        
        const {accessToken , refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        user.refreshToken = newRefreshToken
        await user.save()

        const options ={
      htppOnly : true,
      secure : true
         }

         return res.status(200).cookie("accessToken" , accessToken , options )
         .cookie("refreshToken" , newRefreshToken , options)
         .json(new ApiResponse(200 , {accessToken , refreshToken: newRefreshToken} , "Access token refreshed.."))
    }catch(error){
        console.log("Error while refreshing access token at : ", error)
        throw new ApiError(400 , "Invalid Refresh Token");
        

    }
})

const forgetPasswordController = asyncHandler(async(req,res)=>{
    const {email} = req.body
    if(email.trim()==='')throw new ApiError(400 , "Please enter your email address");

    const userExist = await User.findOne({email})

    if(!userExist) throw new ApiError(400 , "Your not registerd please registration first");


    const {unHashedToken, hashedToken, expires } = User.generateTemporaryToken();
    userExist.forgetPasswordToken = hashedToken
    userExist.forgetPasswordExpires = expires
    await userExist.save({validateBeforeSave:false});

     await sendEmail({
        email : userExist?.email,
        subject : "Password reset request",
        mailgenContent : forgetPasswordMailgenContent(
            userExist.username,
            `${process.env.FORGET_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        )
    });

    return res.status(200).json(new ApiResponse(200 , {} , "Password reset mail has been sent on your email addresss"))
  


})

const resetForgetPassword = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params;
    const {newPassword , confirmPassword} = req.body;
    if(!resetToken) throw new ApiError(400 , "Reset token not found");
    if(newPassword==="" || confirmPassword==="") throw new ApiError(400 , "All fields are required");
    if(newPassword!==confirmPassword) throw new ApiError(400 , "Confrim password not matched");

   const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    const user = await User.findOne({forgetPasswordToken : hashedToken , forgetPasswordExpires : {$gt: Date.now()}});
    if(!user) throw new ApiError(489 , "Token is invalid or expired");
    user.forgetPasswordToken = undefined
    user.forgetPasswordExpires = undefined
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    
    return res.status(200).json(new ApiResponse(200 , {} , "Password is reset , now you can login"))

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword,  confirmPassword} = req.body
    if([oldPassword,newPassword,confirmPassword].some((fields)=> fields.trim()=="")) throw new ApiError(400 , "all fields are required")
    if(newPassword!==confirmPassword) throw new ApiError(400 , "Confrim password not matched");
    const user = await User.findById(req.user?._id)

    const isPassIsValid = await user.isPasswordCorrect(oldPassword)
    if(!isPassIsValid)throw new ApiError(400 , "Old password is not correct");

    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200 , `Hello mr/mrs/miss ${user.fullname}` , "Your password is chagned.."))

  

})

export {userRegisterationController , emailVerification , userLoginController , userLogoutController , getCurrentUserController , resentEmailVerification,refreshAccessToken,forgetPasswordController,resetForgetPassword,changeCurrentPassword}