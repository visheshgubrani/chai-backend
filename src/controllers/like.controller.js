import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const user = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Wrong VideoId");
  }

  const like = await Like.findOne({
    video: videoId,
    likedBy: user,
  });

  if (like) {
    // Unlike
    await Like.findByIdAndDelete(like?._id);
    return res.status(200);
  }

  await Like.create({
    video: videoId,
    likedBy: user,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Liked Successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const user = req.user._id;

  const like = await Like.findOne({
    comment: commentId,
    likedBy: user,
  });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res.status(200).json(new ApiResponse(200, {}, "Unliked"));
  }

  await Like.create({
    comment: commentId,
    likedBy: user,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Unliked Successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const user = req.user._id;

  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: user,
  });

  if (like) {
    await Like.findByIdAndDelete(like._id);
    return res.status(200).json(new ApiResponse(200, {}, "Unliked"));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: user,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  //  videos liked by the particular user
  const user = req.user._id;

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoInfo",
      },
    },
    {
      $unwind: "$videoInfo",
    },
    {
      $lookup: {
        from: "users",
        localField: "videoInfo.owner",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userinfo" },
    {
      $project: {
        _id: 0,
        videoId: "$video",
        thumbnail: "$videoInfo.thumbnail",
        info: "$videoInfo.info",
        channelName: "$userInfo.name",
      },
    },
  ]);
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
