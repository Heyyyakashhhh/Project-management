import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const healthCheck = asyncHandler(async(req,res)=>{
   try{
     res.status(200).json(new ApiResponse(200 , {server: "Ok"}, "Server is running fine"))
   }catch(err){
    throw new ApiError(500 , "Server is not running fine")
   }
})

export {healthCheck}