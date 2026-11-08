import { body } from "express-validator";

export const userRegisterValidation = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please enter a valid email address"),
            
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long"),
            
        body("fullname")
            .trim()
            .notEmpty()
            .withMessage("Fullname is required"),
            
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .isStrongPassword({minLength:8 ,minLowercase:1,minUppercase:1 ,minNumbers:1 , minSymbols:1,returnScore:false})
            .withMessage("password must have at lease one lowercase , one uppercase, one number , one symbol")
            

        
    ];
};

export const userLoginValidation = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Please enter a valid email address"),
            
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long"),
            
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .isStrongPassword({minLength:8 ,minLowercase:1,minUppercase:1 ,minNumbers:1 , minSymbols:1,returnScore:false})
            .withMessage("password must have at lease one lowercase , one uppercase, one number , one symbol")
            

        
    ];
};