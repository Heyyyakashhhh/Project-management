import {userRegisterationController  ,emailVerification , userLoginController , userLogoutController} from "../controllers/user.controller.js"
import {Router} from "express"
import { validate  } from "../validators/validate.js"
import { userRegisterValidation  ,userLoginValidation } from "../validators/user.validate.js";
import {verifyJWT} from "../middlewares/auth.middleware.js" 
const router = Router()

router.route('/register').post(userRegisterValidation() , validate, userRegisterationController)
router.route('/verify-email/:emailToken').get(emailVerification)
router.route('/login').post(userLoginValidation() , validate , userLoginController)
router.route('/logout').post(verifyJWT , userLogoutController)
export default router 