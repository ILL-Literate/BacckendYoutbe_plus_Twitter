import {Router} from "express";
import { regUser, loginUser, logOut, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1

        }
    ]),regUser)
router.route("/login").post(loginUser)


router.route("/logout").post(jwtVerify,logOut)
//login
//router.route("/login").

router.route("/refrsh-token").post(refreshAcessToken)
router.route("/change-password").post(jwtVerify, changeCurrentPassword)
router.route("/current-user").get(jwtVerify, getCurrentUser)
router.route("/update-account").patch(jwtVerify, updateDetails)

router.route("/avatar").patch(jwtVerify, upload.single("avatar"), updateAvatar)
router.route("/cover-image").patch(jwtVerify, upload.single("coverImage"), updateCoverImage)

router.route("/c/:username").get(jwtVerify, getUserChannelProfile)
router.route("/history").get(jwtVerify, getWatchHistory)
export default router


