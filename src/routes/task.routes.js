import {Router} from "express"
import {validate} from "../validators/validate.js"
import {createTask,deleteTask,getTasks,getTasksById,updateTask,createSubTask,updateSubTask,getSubTasks,getSubTaskById,deleteSubTask} from '../controllers/tasks.controller.js'
import {verifyJWT } from "../middlewares/auth.middleware.js" 
import {UserRolesEnum ,AvailableUserRolesEnum} from '../utils/constant.js'
import {upload} from "../middlewares/multer.middleware.js"

const router= Router()
router.use(verifyJWT)

router.route('/create/:projectId').post(upload.array("attachments" , 5) ,createTask)
router.route('/create/subtask/:taskId').post(createSubTask)
router.route('/task/update/:taskId').put(upload.array("attachments" , 5) ,updateTask)
router.route('/:projectId').get(getTasks)
router.route('/gettaskid/:taskId').get(getTasksById)
router.route('/all-subtask/:taskId').get(getSubTasks)
router.route('/subtask/:subTaskId').get(getSubTaskById)
router.route('/subtask/delete/:subTaskId').delete(deleteSubTask)
router.route('/subtask/update/:subtaskId').put(updateSubTask)
router.route('/task/delete/:taskId').delete(deleteTask)

export default router