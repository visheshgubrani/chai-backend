import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!videoId) {
        throw new ApiError(400, "Video Not Found")
    }

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        populate: 'owner'
    }

    const results = await Comment.aggregatePaginate(
        {video: videoId},
        options
    )

    return res.status(200).json(
        new ApiResponse(200, results, "Comments Fetched Successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video could not be found")
    }

 
    if (!content) {
        throw new ApiError(400, "Please Enter the comment")
    }
    
    const comment = Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    })

    if (!comment) {
        throw new ApiError(500, "Comment could not be created")
    }

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment Created Successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "Please Enter the comment")
    }

    const comment = await Comment.findById(commentId)
    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to modify this comment")
    }

    comment.content = content
    await comment.save()

    return res.status(200).json(new ApiResponse(
        200, comment, "Comment updated Successfully"
    ))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
