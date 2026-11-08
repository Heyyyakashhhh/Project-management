import {userRegisterationController  ,emailVerification , userLoginController} from "../controllers/user.controller.js"
import {Router} from "express"
import { validate  } from "../validators/validate.js"
import { userRegisterValidation  ,userLoginValidation} from "../validators/user.validate.js"
const router = Router()

router.route('/register').post(userRegisterValidation() , validate, userRegisterationController)
router.route('/verify-email/:emailToken').get(emailVerification)
router.route('/login').post(userLoginValidation() , validate , userLoginController)
export default router