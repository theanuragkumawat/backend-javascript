import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    let pipeline = []

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid userId format");
        }
    }

    if (userId) {
        pipeline.push(
            {
                $match: {
                    owner: mongoose.Types.ObjectId(userId)
                }
            },
        )
    }

    if (query) {
        pipeline.push(
            {
                $match: {
                    $text: {
                        $search: query
                    }
                }
            },
        )
    }

    if (sortBy && sortType) {
        pipeline.push(
            {
                $sort: {
                    [sortBy]: sortType == 'asc' ? 1 : -1
                }
            },
        )
    }

    if (page && limit) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        pipeline.push(
            {
                $skip: (pageNum - 1) * limitNum
            },
            {
                $limit: limitNum
            }
        )
    }

    const videos = await Video.aggregate(pipeline)

    if (!videos) {
        throw new ApiError(500, "Something went wrong while getting videos")
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (
        [title, description].some((field) => (field.trim() === ""))
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file not recieved")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail not recieved")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    if (!videoFile) {
        throw new ApiError(40, "Video is required")
    }

    const video = await Video.create({
        title,
        description,
        views: 0,
        isPublished: true,
        owner: req.user?._id,
        thumbnail: thumbnail?.url,
        videoFile: videoFile?.url,
        duration: videoFile?.duration
    })

    const createdVideo = await Video.findById(video._id)

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while creating video")
    }

    // console.log("This is video =>",videoFile);
    return res.status(201).json(
        new ApiResponse(201, createdVideo, "video created successfully")
    )
})

export {
    getAllVideos,
    publishAVideo
}