
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Testing route
app.get("/", (req,res)=>{
    res.send("server running")
})

//Healthcheck route
import healthcheckRoutes from "./routes/healthcheckRoutes.js"
app.use("/api/v1/healthcheck" , healthcheckRoutes)

//User route
import userRoutes from "./routes/user.routes.js"
app.use('/api/v1/users' , userRoutes)

//Project rotue
import projectRoutes from "./routes/project.routes.js"
app.use("/api/v1/projects" , projectRoutes)


export {app}