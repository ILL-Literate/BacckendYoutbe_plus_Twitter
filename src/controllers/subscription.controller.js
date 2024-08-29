import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utilsnew/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(channelId)) {
        res.status(400);
        throw new Error('Invalid channel ID');
    }

    const subscription = await Subscription.findOne({ channel: channelId, subscriber: userId });

    if (subscription) {
        // If subscription exists, remove it (unsubscribe)
        await subscription.remove();
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
        // If subscription does not exist, create it (subscribe)
        await Subscription.create({ channel: channelId, subscriber: userId });
        res.status(201).json({ message: 'Subscribed successfully' });
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        res.status(400);
        throw new Error('Invalid channel ID');
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate('subscriber', 'name email');

    res.status(200).json(subscribers);
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        res.status(400);
        throw new Error('Invalid subscriber ID');
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate('channel', 'name description');

    res.status(200).json(subscriptions);
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};