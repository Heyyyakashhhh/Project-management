import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
import {AvailableUserRolesEnum,UserRolesEnum} from "../utils/constant.js"
const ProjectMemberSchema = new Schema({
    user:{
        type : Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    project:{
        type : Schema.Types.ObjectId,
        ref:"Project",
         required:true
    },
    enum:{
        type : String,
        role : AvailableUserRolesEnum,
        default:UserRolesEnum.MEMEBER
    }
},{timestamps:true})

export const ProjectMember = new mongoose.model("ProjectMember" , ProjectMemberSchema)