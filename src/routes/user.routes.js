import {userRegisterationController  ,emailVerification , userLoginController , userLogoutController, getCurrentUserController,resentEmailVerification,forgetPasswordController,resetForgetPassword,changeCurrentPassword} from "../controllers/user.controller.js"
import {Router} from "express"
import { validate  } from "../validators/validate.js"
import { userRegisterValidation  ,userLoginValidation } from "../validators/user.validate.js";
import {verifyJWT} from "../middlewares/auth.middleware.js" 
const router = Router()

router.route('/register').post(userRegisterValidation() , validate, userRegisterationController)
router.route('/verify-email/:emailToken').get(emailVerification)
router.route('/login').post(userLoginValidation() , validate , userLoginController)
router.route('/logout').post(verifyJWT , userLogoutController);
router.route('/current-user').get(verifyJWT ,getCurrentUserController );
router.route('/resend-email-verification').post(resentEmailVerification  );
router.route('/forget-password').post(forgetPasswordController)
router.route('/forget-password/:resetToken').post(resetForgetPassword);
router.route('/change-password').post(verifyJWT,changeCurrentPassword)
export default router 