import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
const SubTaskSchema = new Schema({
    title:{
        type : String,
        required:true,
        trim : true,
    },

    task:{

        type : Schema.Types.ObjectId,
        ref : "Task",
        required:true
    },
    isCompleted:{
        type : Boolean,
        required:true
    },
    createdBy:{
        type : Schema.Types.ObjectId,
        ref : "User",
        
    },

  
},{timestamps:true})

export const Subtask = new mongoose.model("Subtask" , SubTaskSchema)