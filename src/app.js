import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended:true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//Routes import
import userRouter from "./routes/user.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import likeRouter from "./routes/like.routes.js"

//Routes declaration
app.use('/api/v1/users',userRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/likes',likeRouter)

export {app}