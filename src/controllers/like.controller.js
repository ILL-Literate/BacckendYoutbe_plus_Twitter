import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utilsnew/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const like = await Like.findOne({ video: videoId, user: userId });

    if (like) {
        // If like exists, remove it (unlike)
        await like.remove();
        res.status(200).json({ message: 'Video unliked successfully' });
    } else {
        // If like does not exist, create it (like)
        await Like.create({ video: videoId, user: userId });
        res.status(201).json({ message: 'Video liked successfully' });
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        res.status(400);
        throw new Error('Invalid comment ID');
    }

    const like = await Like.findOne({ comment: commentId, user: userId });

    if (like) {
        // If like exists, remove it (unlike)
        await like.remove();
        res.status(200).json({ message: 'Comment unliked successfully' });
    } else {
        // If like does not exist, create it (like)
        await Like.create({ comment: commentId, user: userId });
        res.status(201).json({ message: 'Comment liked successfully' });
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        res.status(400);
        throw new Error('Invalid tweet ID');
    }

    const like = await Like.findOne({ tweet: tweetId, user: userId });

    if (like) {
        // If like exists, remove it (unlike)
        await like.remove();
        res.status(200).json({ message: 'Tweet unliked successfully' });
    } else {
        // If like does not exist, create it (like)
        await Like.create({ tweet: tweetId, user: userId });
        res.status(201).json({ message: 'Tweet liked successfully' });
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likes = await Like.find({ user: userId, video: { $exists: true } }).populate('video');

    const likedVideos = likes.map(like => like.video);

    res.status(200).json(likedVideos);
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};