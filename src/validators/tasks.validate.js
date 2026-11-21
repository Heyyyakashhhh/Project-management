import { body } from "express-validator";


export const tasksValidation = ()=>{
    return [
        body('title')
        .trim()
        .notEmpty()
        .withMessage("Task tile is required"),

        body('description')
        .trim()
        .optional()
      
        
    ]
}

export const subtaskValidation = ()=>{
     return [
       body("title")
            .trim()
            .notEmpty()
            .withMessage("Subtask is required"),
      

        body('isCompleted')
        .isBoolean()
        .withMessage("isCompleted is must be a boolean")
        .toBoolean()
      
        
        
    ]
}