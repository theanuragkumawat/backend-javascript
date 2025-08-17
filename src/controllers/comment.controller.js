import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Video id is not valid")
    }

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
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
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "comment",
                localField: "_id",
                as: "likes"
            }
        },
        {
            $addFields: {
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                },
                likesCount:{
                    $cond: {
                        if: { $isArray: "$likes" },
                        then: { $size: "$likes" },
                        else: 0
                    }
                },
                owner: {
                    $first: "$owner"
                }
            }


        },
        {
            $skip: (pageNum - 1) * limitNum
        },
        {
            $limit: limitNum
        }
    ])

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfullyS"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Something went wrong while adding comment")
    }

    return res.status(200).json(new ApiResponse(200, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req,res) => {
    const { content } = req.body
    const { commentId } = req.params

    if(content.trim() === ""){
        throw new ApiError(400,"Content is required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if(!comment){
        throw new ApiError(500,"Something went wrong while updating comment")
    }
    
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req,res) => {
    const { commentId } = req.params

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(500,"Something went wrong while deleting comment")
    }

    return res.status(200).json(new ApiResponse(200,comment,"Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}