import {Router} from "express"
import { validate  } from "../validators/validate.js"
import {createProject, deleteProject, getAllProject, updateProject ,getProjectById, addProjectMember,getProjectMemebrs, deleteProjectMember, updateProjectMemeberRole} from '../controllers/projects.controller.js'
import {verifyJWT , validateProjectPermission} from "../middlewares/auth.middleware.js" 
import {UserRolesEnum ,AvailableUserRolesEnum} from '../utils/constant.js'
const router = Router()
router.use(verifyJWT);
router.route('/create').post(createProject)
router.route('/update/:projectId').patch(validateProjectPermission([UserRolesEnum.ADMIN]), updateProject)
router.route('/delete/:projectId').delete(validateProjectPermission([UserRolesEnum.ADMIN]) , deleteProject)
router.route('/').get(verifyJWT, getAllProject)
router.route('/:projectId').get(validateProjectPermission(AvailableUserRolesEnum), getProjectById);
router.route('/addmember/:projectId').put(validateProjectPermission, addProjectMember);
router.route('/allmembers/:projectId').get( getProjectMemebrs)
router.route('/member/delete/:projectId').delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteProjectMember)
router.route('/member/update/:userId/:projectId').patch(validateProjectPermission([UserRolesEnum.ADMIN]),updateProjectMemeberRole)


export default router