import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const user = req.user._id;
  if (!channelId) {
    throw new ApiError(400, "Failed to fetch the channel");
  }

  const subscribe = await Subscription.findOne({
    subscriber: user,
    channel: channelId,
  });

  if (subscribe) {
    // Unsubscribe
    await Subscription.findByIdAndDelete(subscribe?._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsunscribed Successfully"));
  }

  await Subscription.create({
    subscriber: user,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subscribed Successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $project: {
        _id: "$subscribers._id",
        username: "$subscribers.username",
        avatar: "$subscibers.avatar",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!mongoose.isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber Id");
  }

  const subscribed = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        _id: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribed",
      },
    },
    {
      $unwind: "$subscribed",
    },
    {
      $project: {
        _id: "$subscribed._id",
        username: "$subscribed.username",
        avatar: "$subscribed.avatar",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribed, "Channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
