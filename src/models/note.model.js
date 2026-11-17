import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";
const ProjectNoteSchema = new Schema({
   project:{
    type :Schema.Types.ObjectId,
    ref : "Project",
  
   },
   createdBy:{
     type :Schema.Types.ObjectId,
    ref : "User",
  
   },
   content:{
    type :String,
    trim:true,
   
   }

  
},{timestamps:true})

export const Projectnote = new mongoose.model("Projectnote" , ProjectNoteSchema)