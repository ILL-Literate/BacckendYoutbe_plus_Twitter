import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utilsnew/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        res.status(400);
        throw new Error('Invalid channel ID');
    }

    const totalVideos = await Video.countDocuments({ channel: channelId });
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
    const totalLikes = await Like.countDocuments({ channel: channelId });
    const totalViews = await Video.aggregate([
        { $match: { channel: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    res.status(200).json({
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews: totalViews[0] ? totalViews[0].totalViews : 0
    });
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        res.status(400);
        throw new Error('Invalid channel ID');
    }

    const videos = await Video.find({ channel: channelId });

    res.status(200).json(videos);
});

export {
    getChannelStats,
    getChannelVideos
};