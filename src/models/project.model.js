import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
const ProjectSchema = new Schema({
    name:{
        type : String,
        required:true,
        trim : true,
    },
    description:{
        type : String,
        required:true,
        trim : true,
    },
    createdBy:{
        type : Schema.Types.ObjectId,
        ref : "User",
        required:true
    }
},{timestamps:true})

export const Project = new mongoose.model("Project" , ProjectSchema)