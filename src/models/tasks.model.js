import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
import {TaskStatusEnum , AvailableTaskStatusEnum} from "../utils/constant.js"
const TaskSchema = new Schema({
    title:{
        type : String,
        required:true,
        trim : true,
    },
    discription:{type : String},
    project:{

        type : Schema.Types.ObjectId,
        ref : "Project",
    },
    assignedBy:{
        type : Schema.Types.ObjectId,
        ref : "User",
        
    },
    assignedTo:{
        type : Schema.Types.ObjectId,
        ref : "User",
        
    },

    status:{
        type: String,
        enum :AvailableTaskStatusEnum,
        default:TaskStatusEnum.TODO

    },
    attachments:{
        type:[{
            url : String,
            mimtype :String,
            size:Number
        }],default:[]
    }
},{timestamps:true})

export const Task = new mongoose.model("Task" , TaskSchema)