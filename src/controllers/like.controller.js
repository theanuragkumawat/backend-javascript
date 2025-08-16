import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const existingLike = await Like.findOne({ video: videoId, likedBy: req.user?._id })
    if (existingLike) {
        const like = await Like.findByIdAndDelete(existingLike._id)

        if (!like) {
            throw new ApiError(500, "Something went wrong while adding like")
        }
        return res.status(200).json(new ApiResponse(200, like, "Like removed successfully"))

    } else {
        const like = await Like.create({
            likedBy: req.user?._id,
            video: videoId
        })

        if (!like) {
            throw new ApiError(500, "Something went wrong while removing the like")
        }

        return res.status(200).json(new ApiResponse(200, like, "Video liked successfully"))
    }

})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    const existingLike = await Like.findOne({ comment: commentId, likedBy: req.user?._id })
    if (existingLike) {
        const like = await Like.findByIdAndDelete(existingLike._id)

        if (!like) {
            throw new ApiError(500, "Something went wrong while adding like")
        }
        return res.status(200).json(new ApiResponse(200, like, "Like removed successfully"))

    } else {
        const like = await Like.create({
            likedBy: req.user?._id,
            comment: commentId
        })

        if (!like) {
            throw new ApiError(500, "Something went wrong while removing the like")
        }

        return res.status(200).json(new ApiResponse(200, like, "Comment liked successfully"))
    }

})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id })
    if (existingLike) {
        const like = await Like.findByIdAndDelete(existingLike._id)

        if (!like) {
            throw new ApiError(500, "Something went wrong while adding like")
        }
        return res.status(200).json(new ApiResponse(200, like, "Like removed successfully"))

    } else {
        const like = await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })

        if (!like) {
            throw new ApiError(500, "Something went wrong while removing the like")
        }

        return res.status(200).json(new ApiResponse(200, like, "tweet liked successfully"))
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const likes = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "video",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "owner",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video: {
                    $first :"$video"
                }
            }
        }
    ])

    const likedVideos = likes.map(like => like.video)

    return res.status(200).json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}