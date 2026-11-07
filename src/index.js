import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/connection.js";
import mongoose from "mongoose";
import {app} from "./app.js";

dotenv.config({
    path: "./.env"
});



connectDB().then(()=>{
    app.listen(process.env.PORT || 4000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    })
}).catch((err)=>{
    console.log(`MongoDb connection failed at : \n error: ${err.message}`);
})