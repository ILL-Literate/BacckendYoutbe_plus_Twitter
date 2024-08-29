import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utilsnew/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const comments = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    res.status(200).json(comments);
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const comment = await Comment.create({
        video: videoId,
        user: userId,
        text
    });

    res.status(201).json(comment);
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        res.status(400);
        throw new Error('Invalid comment ID');
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, user: userId },
        { text },
        { new: true }
    );

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found or user not authorized');
    }

    res.status(200).json(comment);
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        res.status(400);
        throw new Error('Invalid comment ID');
    }

    const comment = await Comment.findOneAndDelete({ _id: commentId, user: userId });

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found or user not authorized');
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};