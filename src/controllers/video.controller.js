import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utlisnew/apierror.js";
import { asyncHandler } from "../utlisnew/asynchandler.js";
import { uploadCloudinary } from "../utlisnew/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: 'i' };
    }
    if (userId && isValidObjectId(userId)) {
        filter.user = userId;
    }

    const sort = {};
    sort[sortBy] = sortType === 'asc' ? 1 : -1;

    const videos = await Video.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.status(200).json({
        videos,
        total,
        page,
        pages: Math.ceil(total / limit)
    });
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { file } = req;

    if (!file) {
        res.status(400);
        throw new Error('No video file uploaded');
    }

    // Upload video to Cloudinary
    const result = await uploadCloudinary(file.path, {
        resource_type: 'video',
        folder: 'videos'
    });

    // Create video in the database
    const video = await Video.create({
        title,
        description,
        videoUrl: result.secure_url,
        cloudinaryId: result.public_id,
        user: req.user._id
    });

    res.status(201).json(video);
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    res.status(200).json(video);
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;

    const updatedVideo = await video.save();

    res.status(200).json(updatedVideo);
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        res.status(400);
        throw new Error('Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        res.status(404);
        throw new Error('Video not found');
    }

    // Delete video from Cloudinary
    await uploadCloudinary.uploader.destroy(video.cloudinaryId, {
        resource_type: 'video'
    });

    await video.remove();

    res.status(200).json({ message: 'Video deleted successfully' });
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
};