// require('dotenv').config({path: "./env"})
import 'dotenv/config' 
import connectDB from './db/index.js'

connectDB()
.then()
.catch((err) => {
    console.log("MongoDB connection failed !",err);
    
})































/*
const app = express()

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on('error',(error) => {
            console.log("ERRR: ",error)
        });

        app.listen(process.env.PORT, () => {
            console.log("app is listening on port ",process.env.PORT);
            
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()            
*/