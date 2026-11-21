import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import fs from "fs/promises"
import path from "path";
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {Task} from "../models/tasks.model.js"
import { isValidObjectId } from "mongoose"
import { Subtask } from "../models/subtask.model.js"
import {Project} from "../models/project.model.js"
import mongoose from "mongoose"
import { AvailableUserRolesEnum , UserRolesEnum ,AvailableTaskStatusEnum } from "../utils/constant.js"

const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body
    const { projectId } = req.params; 
   if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    if(!isValidObjectId(projectId)) throw new ApiError(400 , "Invalid object id")
    
    const project = await Project.findById(projectId)
    if(!project) throw new ApiError(400 , "Project not found")

    const files = req.files || []
    const attachments = files.map((file)=>({
        url:`${process.env.SERVER_URL}/images/${file.filename}`,
        mimetype : file.mimetype,
        size: file.size
    }))
   const task = await Task.create({
    title : title.trim(),
    description: description.trim()||"",
    project : new mongoose.Types.ObjectId(project._id),
    assignedTo : assignedTo || undefined,
    status ,
    assignedBy : new mongoose.Types.ObjectId(req.user._id),
    attachments 
   })

   if (!task) {
        throw new ApiError(500, "Something went wrong while creating task");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, task, "Task added successfully"));
    
   
});

const getTasks=asyncHandler(async(req,res)=>{
     const {projectId} = req.params;
    if(!isValidObjectId(projectId)) throw new ApiError(400, "Invalid Object ID")  
        
    const project = await Project.findById(projectId)
    if(!project)throw new ApiError(404, "Project not found")  

   const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
})
    .populate("assignedTo", "avatar username fullname")
    .populate("assignedBy", "avatar username fullname");
 

    return res.status(200).json(new ApiResponse(200 , tasks, 'Tasks Fetched Successfully'))
    
})
const getTasksById=asyncHandler(async(req,res)=>{
    const {taskId} = req.params;
    if(!isValidObjectId(taskId)) throw new ApiError(400 ,"Invalid Object ID");

    const task = await Task.aggregate([
        {
            $match :{
                _id : new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "assignedTo",
                foreignField : "_id",
                as : "assignedTo",
                pipeline :[
                    {
                        $project :{
                            _id:1,
                        username:1,
                        avatar:1,
                        fullname:1,
                        }

                    }
                ]
            }
        },
        {
            $lookup :{
                from : "subtasks",
                localField:"_id",
                foreignField:"task",
                as :"subtask",
                pipeline:[
                    {
                        $lookup :{
                            from :"users",
                            localField :"createdBy",
                            foreignField :"_id",
                            as : "createdBy",
                            pipeline:[
                                {
                                    $project :{
                                        _id:1,
                                        username:1,
                                        avatar:1,
                                        fullname:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                      $addFields:{
                        createdBy :{
                            $arrayElemAt :["$createdBy" , 0]
                        }
                      }
                    }
                ]
            }
        },
        {
            $addFields :{
                assignedTo:{
                    $arrayElemAt:['$assignedTo' , 0]
                }
            }
        }
    ])

    if(!task || task.length===0) throw new ApiError(400  , "Task not found")
    
    return res.status(200).json(new ApiResponse(200 , task  , "Task found successfully"))
   
})
const updateTask=asyncHandler(async(req,res)=>{
    const { title, description, assignedTo, status } = req.body
     if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
   const {taskId } = req.params;
    if(!isValidObjectId(taskId)) throw new ApiError(400 , "Invalid object id")
    const task = await Task.findById(taskId)
    if(!task) throw new ApiError(404, "task not found")

    const files = req.files || []
    const attachments = files.map((file)=>({
        url:`${process.env.SERVER_URL}/images/${file.filename}`,
        mimetype : file.mimetype,
        size: file.size
    }))
    
    const updatedTask = await Task.findByIdAndUpdate(
        task._id,
        {
            title:title.trim(),
            description:description.trim()||"",
            attachments,
            assignedTo:assignedTo||undefined,
            status

        },
        {
           returnDocument: "after", 
           runValidators: true
        }
    )

    return res.status(200).json(new ApiResponse(200 , updatedTask , "Task Updated"))
  
})

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid object id");
    }

    const task = await Task.findOne({ _id: taskId });
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    for (const att of task.attachments || []) {
        if (!att?.url) continue;

        const filename = path.basename(att.url);
        const filePath = path.join(process.cwd(), "public/temp", filename); // multer folder path match karo

        try {
            await fs.unlink(filePath);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.log(err);
            }
        }
    }

    const deletedTask = await Task.findByIdAndDelete(task._id);
    if (!deletedTask) {
        throw new ApiError(404, "Something went wrong while deleting task..");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task Deleted..."));
});
const createSubTask=asyncHandler(async(req,res)=>{
    const {title} = req.body;
    const {taskId} = req.params;
    if(!title?.trim()==="") throw new ApiError(400 , "Sbutask title is required")
    if(!isValidObjectId(taskId)) throw new ApiError(400 , "Invalid Object ID")
    const task = await Task.findById(taskId)
    if(!task) throw new ApiError(404, "Task not found")
    
    const subTask = await Subtask.create({
        title : title.trim(),
        task : new mongoose.Types.ObjectId(task._id),
        isCompleted:false,
        createdBy:new mongoose.Types.ObjectId(req.user._id),
  
    })

    if(!subTask) throw new ApiError(400 , "Something went wrong while creating subtask")
    
    return res
    .status(200)
    .json(new ApiResponse(200, subTask , "Subtask created successfully"))
    
})

const getSubTasks=asyncHandler(async(req,res)=>{

    const {taskId} = req.params;
    
    if(!isValidObjectId(taskId)) throw new ApiError(400 , "Invalid Object ID");
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Parent task not found");
    }

    const subtask = await Subtask.find({
        task : new mongoose.Types.ObjectId(task._id)
    }).populate("createdBy","avatar username fullname")

    return res
    .status(200)
    .json(new ApiResponse(200 , subtask  , "All subtask fetched"))


    
})

const getSubTaskById=asyncHandler(async(req,res)=>{
    const{subTaskId} = req.params;
    if(!isValidObjectId(subTaskId)) throw new ApiError(400 , "Invalid Object ID")

   const subTask =  await Subtask.findById(subTaskId).populate("createdBy" , "avatar username fullname")

   if(!subTask)throw new ApiError(404, "Subtask not found")

     
    return res
    .status(200)
    .json(new ApiResponse(200, subTask , "Subtask fetched successfully"))


    
})

const updateSubTask=asyncHandler(async(req,res)=>{
    const { subtaskId } = req.params;
    const { title, isCompleted } = req.body;

    if (!isValidObjectId(subtaskId)) {
        throw new ApiError(400, "Invalid subtask ID");
    }

    const updateFields = {};

    if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
            throw new ApiError(400, "Subtask title cannot be empty");
        }
        updateFields.title = title.trim();
    }

    if (isCompleted !== undefined) {
        // form-data mein kabhi "true"/"false" string aati hai, isliye safely handle kar lete hain
        if (typeof isCompleted === "boolean") {
            updateFields.isCompleted = isCompleted;
        } else if (isCompleted === "true" || isCompleted === "false") {
            updateFields.isCompleted = isCompleted === "true";
        } else {
            throw new ApiError(400, "isCompleted must be a boolean");
        }
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "Provide title or isCompleted to update");
    }

    const updatedSubtask = await Subtask.findByIdAndUpdate(
        subtaskId,
        { $set: updateFields },
        { returnDocument: "after", runValidators: true }
    ).populate("createdBy", "avatar username fullname");

    if (!updatedSubtask) {
        throw new ApiError(404, "Subtask not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSubtask, "Subtask updated successfully"));
})

const deleteSubTask=asyncHandler(async(req,res)=>{
    const{subTaskId} = req.params;
    if(!isValidObjectId(subTaskId)) throw new ApiError(400 , "Invalid Object ID")
    const deletedST = await Subtask.findByIdAndDelete(subTaskId)
    if(!deletedST)throw new ApiError(404, "Subtask not found")

     
    return res
    .status(200)
    .json(new ApiResponse(200,{} , "Subtask Deleted successfully"))


    
})

export{createTask,getTasks,getTasksById,updateTask,deleteTask,createSubTask,getSubTasks,getSubTaskById,updateSubTask,deleteSubTask}