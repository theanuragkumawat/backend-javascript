import { Router } from "express";
import {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/").post(verifyJWT, createPlaylist)
router.route("/user/:userId").get(verifyJWT, getUserPlaylists)

router.route("/:playlistId").get(verifyJWT, getPlaylistById)







export default router