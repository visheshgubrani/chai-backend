import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {}
    if (query) {
        filter.$or = [
            {title: {$regex: query, $options: "i"}},
            {description: {$regex: query, $options: "i"}}
        ]
    }

    if (userId) {
        filter.owner = userId
    }

    const sort = {}
    if (sortBy) {
        sort[sortBy] = sortType === "desc" ? -1 : 1
    } else {
        // Default sorting by createdAt in desc order
        sort.createdAt = -1
    }

    try {
        const videos = await Video.aggregatePaginate([], {
            // Using aggregatePaginate for pagination
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort,
            customLabels: {docs: "videos"}
        })

        return res.status(200).json(new ApiResponse(200, videos, "Success"))
    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.video?.[0]?.path

    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url
    })

    if (!video) {
        throw new ApiError(400, "Failed to publish the video")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Published the video Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(400, "Video Does not Exist")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Failed to fetch the video ")
    }
    return res.status(200).json(
        new ApiResponse(200, video, "Successfully fetched the video")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!videoId) {
        throw new ApiError(400, "Video Does not Exist")
    }

    const {title, description} = req.body
    if (!(title || description)) {
        throw new ApiError(400, "Please update the details")
    }

    let avatar = null //in case no avatar is provided
    if (req.file) { 
        const uploadResult = await uploadOnCloudinary(req.file?.path)
        if (!uploadResult) {
            throw new ApiError(500, 'Error uploading to Cloudinary')
        }

        avatar = uploadResult.url
    }    

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                avatar
            }
        },
        {new: true}
    )

    if (!video) {
        throw new ApiError(400, "Failed to update the video")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video Updated Successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400, "Video Does not exists")
    }
    // console log this deleted video shit
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(400, "Failed to delete the video")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video does not exists")
    }

    const video = await Video.findById(videoId)

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
