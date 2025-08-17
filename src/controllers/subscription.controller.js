import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const existingSubscription = await Subscription.findOne(
        { channel: channelId, subscriber: req.user?._id }
    );

    if (existingSubscription) {

        const subscription = await Subscription.findOneAndDelete(
            {
                subscriber: req.user?._id,
                channel: channelId
            }
        )

        if (!subscription) {
            throw new ApiError(500, "Something went wrong while unsubscribing channel")
        }

        return res.status(200).json(new ApiResponse(200, subscription, "channel unsubscribed successfully"))
    } else {
        const subscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        if (!subscription) {
            throw new ApiError(500, "Something went wrong while subscribing channel")
        }

        return res.status(200).json(new ApiResponse(200, subscription, "Channel subscribed successfully"))
    }

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscribersDocs = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
               foreignField: "_id",
               localField:"subscriber",
               as: "subscriber",
               pipeline: [
                {
                    $project: {
                        fullname:1,
                        avatar:1,
                        username:1
                    }
                }
               ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ])

    if(!subscribersDocs){
        throw new ApiError(500,"Something went wrong while getting subscribers")
    }

    const subscribers = subscribersDocs.map(data => data.subscriber)

    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async (req,res) => {
    const { subscriberId } = req.params

    const channelsDocs = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField: "_id",
                localField:"channel",
                as: "channel",
                pipeline: [{
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel"
                }
            }
        }
    ])

    if(!channelsDocs){
        throw new ApiError(500,"Something went wrong while getting channels")
    }

    const channels = channelsDocs.map(data => data.channel)

    return res.status(200).json(new ApiResponse(200,channels,"Channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}