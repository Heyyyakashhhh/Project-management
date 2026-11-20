import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ProjectMember} from "../models/projectmembers.model.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
import { isValidObjectId } from "mongoose";

export const verifyJWT  = asyncHandler(async(req,res,next)=>{

    const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer" , "");

    if(!token) throw new ApiError(401 , "Unauthorized Request");

    try{
        const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
      
        const user = await User.findById(decodedToken._id);
        
        if(!user)  throw new ApiError(401 , "Invalid access token");

        req.user = user
        next()


    }catch(error){
        throw new ApiError(401 , "Invalid accesss token");
    }
})

export const validateProjectPermission = (roles = []) => {
  
   
    return asyncHandler(async (req, res, next) => {
    
        const { projectId } = req.params;
      
        if (!isValidObjectId(projectId)) {
            throw new ApiError(400, "Invalid project ID");
        }

        const projectMember = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id)
        });
        console.log(projectMember)

        if (!projectMember) {
            throw new ApiError(404, "Project not found or you are not a member");
        }

        const givenRole = projectMember.role;
        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            
            throw new ApiError(403, "You do not have permission to perform this action");
        }

        next();
    });
};