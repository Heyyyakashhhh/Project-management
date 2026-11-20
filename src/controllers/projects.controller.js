import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {ProjectMember} from "../models/projectmembers.model.js"
import { isValidObjectId } from "mongoose"
import { Project } from "../models/project.model.js"
import mongoose from "mongoose"
import { AvailableUserRolesEnum , UserRolesEnum } from "../utils/constant.js"



const createProject = asyncHandler(async(req,res)=>{
    const {name , description} = req.body
    if([name,description].some((fields)=> fields.trim()==="")) throw new ApiError(400 , "All fields are required");

    const newProject = await Project.create({
        name , 
        description , 
        createdBy : new mongoose.Types.ObjectId(req.user._id)
    })

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project :  new mongoose.Types.ObjectId(newProject),
        role : UserRolesEnum.ADMIN

    })

    return res.status(200).json(new ApiResponse(200 , newProject , "Project created"))
})

const getAllProject = asyncHandler(async(req,res)=>{

 const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup :{
                from :"projects",
                localField : "project",
                foreignField :"_id",
                as : "Poroject_details",
                pipeline :[
                    {
                        $lookup:{
                            from :"users",
                            localField :"createdBy",
                            foreignField :"_id",
                            as :"User_details"
                        }
                    },
                    {
                       $unwind :{
                        path: "$User_details",
                       preserveNullAndEmptyArrays: true
                       }

                    },
                    {
                        $lookup :{
                            from :"projectmembers",
                            localField : "_id",
                            foreignField : "project",
                            as :"Project_members"
                        }
                    },
                   {
                     $addFields:{
                        memebrsCount :{
                            $size :"$Project_members"
                        }

                    }
                   }
                ]
            }
        },
        {
           $unwind :"$Poroject_details"
        },
        {
            $project :{
                role :1,
                project : {
                    _id : "$Poroject_details._id",
                    name : "$Poroject_details.name",
                    description : "$Poroject_details.description",
                    role :1,
                    memebrsCount : "$Poroject_details.memebrsCount",
                    createdBy :{
                        fullname : "$Poroject_details.User_details.fullname",
                        username :"$Poroject_details.User_details.username",
                        email : "$Poroject_details.User_details.email"
                    }
                }
            }
        }
      
    ]);
    if(!projects) throw new ApiError(400 , "Project not fetched")
    return res.status(200).json(new ApiResponse(200 , projects , "All project fetched successfully"))

})

const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    if(!isValidObjectId(projectId)) throw new ApiError(400 , "Invalid object id")
    
    const project = await Project.findById(projectId);
    if(!project) throw new ApiError(404 ,"Project not found")
    return res.status(200).json(new ApiResponse(200 , project , "Project fetched successfully"))
    
})

const updateProject = asyncHandler(async(req,res)=>{
  
    const{name , description} = req.body
    const{projectId} = req.params
    if([name,description].some((fields)=> fields.trim()==="")) throw new ApiError(400 , "All fields are required");
    if(!isValidObjectId(projectId)) throw new ApiError(400  , "Invalid project id");

    const updatedProject= await Project.findByIdAndUpdate(projectId ,
        {
            name, 
            description
        },
        {
            new : true,
            runValidators: true
        }
    )

    if(!updatedProject)throw new ApiError(404 , "Project not found, please create first")
    
    return res.status(200).json(new ApiResponse(200 , updatedProject , "Project updated") )
})

const deleteProject = asyncHandler(async(req,res)=>{
     const{projectId} = req.params
     if(!isValidObjectId(projectId)) throw new ApiError(400  , "Invalid project id");

     const project = await Project.findByIdAndDelete(projectId)
     if(!project) throw new ApiError(400 , "Project not found , please created first")
    
     return res.status(200).json(new ApiResponse(200 , {} , "Project Deleted") )
})

const getProjectMemebrs = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    if(!isValidObjectId(projectId)) throw new ApiError(400  , "Invalid project id");
    const project = await Project.findById(projectId);
     if(!project) throw new ApiError(400 , "Project not found , please created first")
    
    const projectMembers = await ProjectMember.aggregate([
        {
            $match :{
                project : new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from :"users",
                localField :"user",
                foreignField : "_id",
                as :"User_details",
                pipeline :[
                   {
                    $project:{
                        _id:1,
                        fullname :1,
                        username:1,
                        avatar:1
                    }
                   }
                ]
            }
        },
        {
            $addFields :{
                user :{
                    $arrayElemAt :["$User_details" , 0]
                }
            }
        },
        {
            $project :{
                project :1,
                user:1,
                role:1,
                createdAt:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200 , projectMembers , "Project Memebers fetched successfully"))



    
})

const addProjectMember = asyncHandler(async(req,res)=>{
    const {email , role} = req.body;
   if([email,role].some((fields)=> fields.trim()==="")) throw new ApiError(400 , "All fields are required");
    const {projectId} = req.params;
    if(!isValidObjectId(projectId)) throw new ApiError(400  , "Invalid project id");

    const findUser = await User.findOne({email})
    if(!findUser) throw new ApiError(400  , "User does not exist");

    const project = await Project.findById(projectId)
    if(!project) throw new ApiError(400 , "Project not found , please created first");

    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            user : new mongoose.Types.ObjectId(findUser._id),
            project : new mongoose.Types.ObjectId(project._id)
        },
         {
            user : new mongoose.Types.ObjectId(findUser._id),
            project : new mongoose.Types.ObjectId(project._id),
            role : role
        },
        {
            new: true,
            upsert : true,
            runValidators: true
        }
    )


    return res.status(201).json(new ApiResponse(201 , projectMember , "Project member added successfully"))


    
    
})

const updateProjectMemeberRole = asyncHandler(async(req,res)=>{

    const {userId , projectId} = req.params
    if(!isValidObjectId(projectId) || !isValidObjectId(userId)) throw new ApiError(400  , "Invalid object id");
    const {newRole} = req.body
    if(newRole==="") throw new ApiError(400 , "Please enter role field")
 
    if(!AvailableUserRolesEnum.includes(newRole))throw new ApiError(400 , "User role not available")
 
    const projectMember = await ProjectMember.findOne({project : new mongoose.Types.ObjectId(projectId) , user :  new mongoose.Types.ObjectId(userId)})
    if(!projectMember)throw new ApiError(400 , "Project member not found")
    
    const updatedMemberRole = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role : newRole
        },
        {
            new : true
        }
    ) 



 

    return res.status(200).json(new ApiResponse(200 , updatedMemberRole , "Project member role updated"))
c

    
})

const deleteProjectMember = asyncHandler(async(req,res)=>{

    const user = await ProjectMember.findOne({user : new mongoose.Types.ObjectId(req.user._id)})
    if(!user) throw new ApiError(400 , "User not found")

     const {projectId} = req.params;
     if(!isValidObjectId(projectId)) throw new ApiError(400  , "Invalid project id");

    const projectMem =  await ProjectMember.findOneAndDelete({project : new mongoose.Types.ObjectId(projectId)});
    if(!projectMem) throw new ApiError(400 , "Project member not found")
     return res.status(200).json(new ApiResponse(200 , {} , "Project member deleted"))

    
})

export {createProject,getAllProject,getProjectById,updateProject,deleteProject,getProjectMemebrs,addProjectMember,updateProjectMemeberRole,deleteProjectMember}