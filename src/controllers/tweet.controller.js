import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet model content owner
    const user = req.user?._id
    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "Please enter the text")
    }

    const tweet = await Tweet.create({
        content,
        owner: user
    })

    if (!tweet) {
        throw new ApiError(400, "Failed to create the tweet")
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet Created successfullt")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "Failed to get the user")
    }

    const tweets = await Tweet.find({ owner: userId })

    if (!tweets) {
        throw new ApiError(400, "Failed to get the tweets")
    }

    return res.status(200).json(
        new ApiResponse(200, tweets, "Successfully fetched the tweets")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const user = req.user?._id
    const {tweetId} = req.params
    const {content} = req.body

    const tweet = await Tweet.findById(tweetId)

    if (user.toString() !== tweet.owner._id.toString()) {
        throw new ApiError(400, "User Not Authorized to update tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        content
    )

    if (!updatedTweet) {
        throw new ApiError(400, "Failed to update the tweer")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Successfully updated the tweet")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const user = req.params._id
    const tweetId = req.params
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Failed to fetch the tweet")
    }

    if (user.toString() !== tweet.owner._id.toString()) {
        throw new ApiError(400, "User Not Authorized to update tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
