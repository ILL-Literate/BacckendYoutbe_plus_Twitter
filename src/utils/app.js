import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"
const app = express();
 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

//data frrom json
 app.use(express.json({
    limit: "16kb"
 }))

 //data from url 
 app.use(express.urlencoded({
    extended: true,
    limit: "16kb"

 }))
 //for storing photos or videos in local server 

 app.use(express.static("Public"))

 //cookie parser will help inacessing cokkkies of user browser as well as set the cookie and perfrom crud operations
 app.use(cookieParser())


 import userRouter from "../routes/user.routes.js";
 import healthcheckRouter from "../routes/healthcheck.routes.js";
 import tweetRouter from "../routes/tweet.routes.js";


 app.use("/users", userRouter)



export {app}