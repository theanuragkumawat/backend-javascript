import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "video",
                localField: "_id",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ])
    if(!videoStats){
        throw new ApiError(500,"Something went wrong while getting video stats")
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: req.user?._id })
    if(!totalSubscribers){
        throw new ApiError(500,"Something went wrong while getting total subscribers")
    }

    const stats = {
        ...videoStats[0],
        totalSubscribers
    }

    return res.status(200).json(new ApiResponse(200, stats, "Video stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req,res) => {
    
    const allVideos = await Video.find({ owner: req.user?._id })

    if (!allVideos) {
        throw new ApiError(404, "No videos found for this channel");
    }

    return res.status(200).json(
        new ApiResponse(200, allVideos, "Channel videos fetched successfully")
    );
})

export {
    getChannelStats,
    getChannelVideos
}