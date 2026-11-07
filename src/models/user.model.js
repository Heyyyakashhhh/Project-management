import {Schema, model} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    avatar:{
        type :{
            url : String, 
            localPath : String
        },
        default :{
           url : "https://placehold.co/200x200", 
           localPath : ""
        }
    },
    username :{
        type : String,
        required : true,
        unique : true,
        trim:true,
        lowercase : true,
        index : true
    },
    emai:{
        type : String,
        required : true,
        unique : true,
        trim:true,
        lowercase : true,
        
    },
    fullname:{
        type : String,
        required : true,
    },
    password:{
        type:String,
        required : [true, "Password is required"],
    },
    refreshToken:{
        type : String,
       
    },
    isEmailVerified:{
        type : Boolean,
    },
    forgetPasswordToeken:{
        type : String,
    },
    forgetPasswordExpires:{
        type : Date,
    },
    emailVerificationToken:{
        type : String,
    },
    emailVerificationTokenExpires:{
        type : Date,
    },
},{timestamps:true});



//password hashing
userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
})

//password compare
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);
}

//Generate access token
userSchema.methods.generateAccessToken  =  function(){
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRATION
        }
    )
}

//Generate Refresh token
userSchema.methods.generateRefreshToken  =  function(){
    return jwt.sign(
        {
            _id : this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRATION
        }
    )
}

userSchema.methods.generateTemporaryToken = function(){

    const unHashedToken = crypto.randonBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const expires = Date.now() + 20 * 60 * 1000; //20 minutes

    return {unHashedToken, hashedToken, expires};

}

export const UserModel = model("User", userSchema);