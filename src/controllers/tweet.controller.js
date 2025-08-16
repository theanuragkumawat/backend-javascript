import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req,res) => {
    const { content } = req.body

    if(content.trim() === ""){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(500,"Something went wrong while creating tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req,res) => {
    const { userId } = req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is not valid")
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: 'users',
                foreignField: "_id",
                localField:"owner",
                as:"owner"
            }
        },
        {
            $addFields:{
                owner:{
                    $first: "$owner"
                }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req,res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if(content.trim() === ""){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        { new:true }
    )

    if(!tweet){
        throw new ApiError(500,"Something went wrong while updating tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req,res) => {
    const { tweetId } = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId is not valid")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500, "Something went wrong while deleting tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}