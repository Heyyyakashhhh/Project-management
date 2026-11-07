import {healthCheck} from "../controllers/healthcheck.js"
import {Router} from "express"

const router = Router()

router.route("/" ).get(healthCheck)

export default router


