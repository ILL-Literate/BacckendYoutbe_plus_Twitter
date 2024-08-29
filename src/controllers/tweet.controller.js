import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import { asyncHandler } from "../utlisnew/asynchandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Content is required');
    }

    const tweet = await Tweet.create({
        content,
        user: req.user._id
    });

    res.status(201).json(tweet);
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        res.status(400);
        throw new Error('Invalid user ID');
    }

    const tweets = await Tweet.find({ user: userId });

    res.status(200).json(tweets);
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        res.status(400);
        throw new Error('Invalid tweet ID');
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        res.status(404);
        throw new Error('Tweet not found');
    }

    if (tweet.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to update this tweet');
    }

    tweet.content = content || tweet.content;

    const updatedTweet = await tweet.save();

    res.status(200).json(updatedTweet);
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        res.status(400);
        throw new Error('Invalid tweet ID');
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        res.status(404);
        throw new Error('Tweet not found');
    }

    if (tweet.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to delete this tweet');
    }

    await tweet.remove();

    res.status(200).json({ message: 'Tweet deleted successfully' });
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};