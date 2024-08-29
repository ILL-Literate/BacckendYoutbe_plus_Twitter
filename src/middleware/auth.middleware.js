import { apiError } from "../utlisnew/apierror.js";
import { asyncHandler } from "../utlisnew/asynchandler.js";
import jwt from "jsonwebtoken"
import "dotenv/config"
import { User } from "../models/user.model.js";
import { var3 } from "../controllers/user.controller.js";
let try1 = null

 const jwtVerify = asyncHandler(async(req,res,next)=>{
    try {
        //console.log("Cookies ", req.cookies.refreshToken)
        const token = req.cookies.accessToken 
        console.log("try and try",token,)
        // console.log(token)
        if(!token) throw new apiError(402,"Toekn not found")
        // if (typeof token !== 'string') {
        //         throw new apiError(400, "JWT must be a string");
        //       }
        
        // //now decode the token usinf jwt
        const decodeToken = await jwt.verify(token, process.env.ACESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")// _id as we have set it in the user model
        if(!user) throw new apiError(401,"Invalid user")
        req.user = user; //added user to the request
        next()//middleware
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid user token")
        
    }

 
 })

 export {jwtVerify, try1}
