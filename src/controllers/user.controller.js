import { asyncHandler } from "../utlisnew/asynchandler.js";
import { apiError } from "../utlisnew/apierror.js";
import {User} from "../models/user.model.js";
import {uploadCloudinary, deleteImageFromCloudinary}  from "../utlisnew/cloudinary.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  jwt  from "jsonwebtoken";
let var1 = null
let var2 = null
let var3 = null
const geneAcessAndRefereshTok = async(userId)=>{
    try {
       const user = await User.findById(userId)
       const accessToken = await user.genAcessToken()
       const refreshToken =await user.genRefreshToken()
       user.refreshToken = refreshToken
       user.save({validateBeforeSave: false})
       return {accessToken, refreshToken}
        
    } catch (error) {
        throw new apiError(500,"Error while genreathing access and refresh refreshToken")
        
    }

}
const regUser = asyncHandler(
    async(req,res)=>{
        //get user details from frontend
        

        const{email,fullName,password, userName}=req.body;//json form
        //console.log(req.files);
        //file handling route
        if(
            [fullName,email,userName,password].some((field)=>field?.trim==="")
        ){
            throw new apiError(400,"All fileds are composition")
        }
        //user already exist or not
        const existedUser = await User.findOne({
            $or: [{userName},{email}]
        })
        if(existedUser) {
            throw new apiError(409,"User already exist")
        }
        //handling images
        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocal = req.files?.coverImage[0]?.path;
        var1 = avatarLocalPath;
        console.log(avatarLocalPath);
    
        // if(!avatarLocalPath) throw new apiError(400,"Avatar is required");
        // //uploading them to cloudinary
        const avatar = await uploadCloudinary(avatarLocalPath)
        const coverImage = await uploadCloudinary(coverImageLocal)
        var2 = avatar
        if(!avatar) throw new apiError(400,"Avatar is required");
        //databse enrty
        const user = await User.create({
            fullName,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            userName: userName.toLowerCase()
        })
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );//verifying if user is in database or not
        //.select helps in not selecting the files
        if(!createdUser) throw new apiError(500, "Something went wrong while registering a user");

        return res.status(201).json(
            new apiResponse(200, createdUser, "User registered successfully")
        )
        

         
    
    }
) 


const loginUser = asyncHandler(async(req,res)=>{
    const {email,userName,password} = req.body
    if(!(userName || password)){
        throw new apiError(400, "Username or password is reqired")
    }
    const user = await User.findOne({
        $or: [{userName},{email}]
    })
    if(!user) throw new apiError(404,"User not found")

    
    const passValid= await user.isPassCorrect(password)
    if(!passValid) throw new apiError(401,"Password incorrect")
    const{refreshToken,accessToken}=await geneAcessAndRefereshTok(user._id)
    
    const loggedUser = await User.findById(user.id).select("-password -refreshToken")
    const options={
        httpOnly : true,
        secure: true
    }
    var3 = refreshToken
    //options make cookies modifieble only from the server 
    console.log(accessToken);
    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedUser, accessToken,refreshToken // for use in mobile where no cookies is used
            },
            "Succefully"
        )
    )

}
)

const logOut = asyncHandler(async(req,res)=>{
    //clear cookies
    //refresh token reset
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true //return ot ji values pam tatey new updated values bur pam but if not use this old values will be returned
        }
    )
    //clearing the cookies
    const options={
        httpOnly : true,
        secure: true,
        //expires: new Date(0)
    }
    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(
        200,
        {},
        "User loggged out"

    ))



})

const refreshAcessToken = asyncHandler(async(req,res)=>{
    try {
        const incomingRefresh = req.cookies?.refreshToken || req.body.refreshToken;
        if(!incomingRefresh){
            throw new apiError(400,"Incoming refresh token error")
        }
const decodeToken = jwt.verify(incomingRefresh,process.env.REFRESH_TOKEN_SECRET);
        if(!decodeToken){
            throw new apiError(401,"Wrong token")
        }
        const user = await User.findById(decodeToken._id)
        if(!user){
            throw  new apiError(400,"User not found")
        }
        if(user.refreshToken !== incomingRefresh){
            throw new apiError(400,"Refresh token is invalid")
        }
        const options= {
            httpOnly: true,
            secure: true
        }
       const {accessToken , newRefreshToken} =await geneAcessAndRefereshTok(user?._id)
        res.status(200)
        .cookie("acessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed successfully"
            )
        )
        
    } catch (error) {
        throw new apiError(400, error?.message || "invalid refrsh token")
    }
    
})

const changeCurrentPassword  = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body;
    const user =  await User.findById(req.user?._id)// jodi  password change koribo parise then maney a=login hoi asey soo auth middleware run hoise 
    const isPasswordCorrect = await user.isPassCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new apiError(400,"Inavlid Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res.status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Password Changed successfully"

        )
    )

    
    
    
    
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.
    json(
        new apiResponse(200,
        req.user,
        "Current user fetched successfully")
    )
})

const updateDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body
    if(!fullName || !mail){
        throw new apiError(400, "User or mail invalid")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,
            email
        }
    },{
        new: true
    }).select("-password")
    return res.
    status(200)
    .json(
        new apiResponse(
            200,
            {user},
            "account details updated succefully"
        )
    )

}
)

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new apiError(400,"File not found")
    }
    const avatar = await uploadCloudinary(avatarLocalPath)
    if(!avatar){
        throw new apiError(400,"Could not nt upload file")
    }
    const user =  await User.findById(req?.user._id);
    if(!user){
        throw new apiError(400,"User noy found")
    }
    const oldUrl = user.avatar;
    user.avatar = avatar
    await user.save();
    if(oldUrl){
        await deleteImageFromCloudinary(oldUrl)
    }

     
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
        user,
            "Avatar updated successfully"
        )
    )
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new apiError(400,"File not found")
    }
    const coverImage = await uploadCloudinary(avatarLocalPath)
    if(!avatar){
        throw new apiError(400,"Could not nt upload file")
    }
    const user = await User.findByIdAndUpdate(req.user_id,
        {
            $set:{
                coverImage: coverImage.url

            }
        },
        {new: true}
    ).select("-password")
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            user,
            "Cover Image updated successfully"
        )
    )
})
const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {userName} = req.params;
    if(!userName?.trim()){
        throw new apiError(400,"Username is required")
    }
    const channel = await User.aggregate([
        {
            $match:{
                userName : userName?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },{  $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        } },
        {
            $addFields:{
                subscriberCount: { $size: "$subscribers"},
                subscribedToCount: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond:{
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    } 
                }
            }
        },
        {
            $project:{
                userName: 1,
                email: 1,
                isSubscribed: 1,
                subscriberCount,
                subscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                password: 0,
                refreshToken: 0
            }
        }
    ])
    if(!channel?.length){
        throw new apiError(404,"Channel not found")
    }
    return res.
    status(200)
    .json(
        new apiResponse(
            200,
            channel[0],
            "Channel profile fetched successfully"
        )
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(
        new apiResponse(
            200,
            user[0]?.watchHistory || [],
            "Watch history fetched successfully"
        )
    )

})

export{var1,var2, var3}
export  {regUser,loginUser, logOut, refreshAcessToken, updateDetails, changeCurrentPassword, getCurrentUser, updateCoverImage, getUserChannelProfile, updateAvatar, getWatchHistory}