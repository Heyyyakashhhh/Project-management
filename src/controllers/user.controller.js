import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { emailVerficationMailgenContent , forgetPasswordMailgenContent , sendEmail } from "../utils/mail.js"
import {User} from "../models/user.model.js"
import crypto from "crypto"

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
export {userRegisterationController , emailVerification , userLoginController , userLogoutController}