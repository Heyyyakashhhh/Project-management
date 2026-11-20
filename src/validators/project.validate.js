import { body } from "express-validator";
import { ApiError } from "../utils/ApiError.js"
import {AvailableUserRolesEnum} from "../utils/constant.js";

export const projectValidtion = ()=>{
    return [
        body('name')
        .trim()
        .notEmpty()
        .withMessage("Project name is required"),

        body('description')
        .trim()
        .optional()
      
        
    ]
}

export const projectMemeberValidation = ()=>{
     return [
       body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please enter a valid email address"),

        body('role')
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Project memeber role is required")
        .isIn(AvailableUserRolesEnum)
        .withMessage(`Role must be one of: ${AvailableUserRolesEnum.join(", ")}`),,
        
        
    ]
}