import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(verifyJWT, getUserPlaylists)

router.route("/:playlistId")
.get(verifyJWT, getPlaylistById)
.delete(verifyJWT,deletePlaylist)
.patch(verifyJWT,updatePlaylist)


router.route("/add/:videoId/:playlistId",verifyJWT,addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId",verifyJWT,removeVideoFromPlaylist)




export default router