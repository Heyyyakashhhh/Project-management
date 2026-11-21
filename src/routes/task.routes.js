import {Router} from "express"
import {validate} from "../validators/validate.js"
import {tasksValidation , subtaskValidation} from "../validators/tasks.validate.js"
import {createTask,deleteTask,getTasks,getTasksById,updateTask,createSubTask,updateSubTask,getSubTasks,getSubTaskById,deleteSubTask} from '../controllers/tasks.controller.js'
import {verifyJWT } from "../middlewares/auth.middleware.js" 
import {UserRolesEnum ,AvailableUserRolesEnum} from '../utils/constant.js'
import {upload} from "../middlewares/multer.middleware.js"

const router= Router()
router.use(verifyJWT)

router.route('/create/:projectId').post(tasksValidation() , validate, upload.array("attachments" , 5) ,createTask)
router.route('/create/subtask/:taskId').post(subtaskValidation() , validate,createSubTask)
router.route('/task/update/:taskId').put(tasksValidation() , validate, upload.array("attachments" , 5) ,updateTask)
router.route('/:projectId').get(getTasks)
router.route('/gettaskid/:taskId').get(getTasksById)
router.route('/all-subtask/:taskId').get(getSubTasks)
router.route('/subtask/:subTaskId').get(getSubTaskById)
router.route('/subtask/delete/:subTaskId').delete(deleteSubTask)
router.route('/subtask/update/:subtaskId').put(subtaskValidation() , validate,updateSubTask)
router.route('/task/delete/:taskId').delete(deleteTask)

export default router