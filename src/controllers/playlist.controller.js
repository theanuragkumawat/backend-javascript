import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    // console.log("This is request =>",req);

    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    const createdPlaylist = await Playlist.findById(playlist._id)

    if (!createdPlaylist) {
        throw new ApiError(500, "Something went wrong while creating playlist")
    }

    return res.status(201).json(new ApiResponse(201, createdPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const allPlaylists = await Playlist.aggregate(
        [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    foreignField: "_id",
                    localField: "videos",
                    as: "videos"
                }
            },
            {
                $addFields: {
                    videosCount: {
                        $cond: {
                            if: { $isArray: "$videos" },
                            then: { $size: "$videos" },
                            else: 0
                        }
                    }
                }
            }
        ]
    )

    if (!allPlaylists) {
        throw new ApiError(400, "No playlist exist")
    }

    return res.status(200).json(new ApiResponse(200, allPlaylists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                foreignField: "_id",
                localField: "videos",
                as: "videos"
            }
        },
        {
            $addFields: {
                videosCount: {
                    $cond: {
                        if: { $isArray: "$videos" },
                        then: { $size: "$videos" },
                        else: 0
                    }
                }
            }
        }
    ])

    if(!playlist){
        throw new ApiError(500,"Something went wrong while fetching playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist[0],"Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req,res) => {
    const { playlistId, videoId } = req.params
    //Tomorrow
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById
}