import {DB_NAME} from "../constant.js";
import mongoose from "mongoose";
import express from "express";
const app = express();

const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n Mongo DB Connect !! DB Host: ${connectionInstance.connection.host}`)


    }catch(err){
        console.error("Mongo DB Connection Failed:", err);
        process.exit(1);
    }
}

export default connectDB;