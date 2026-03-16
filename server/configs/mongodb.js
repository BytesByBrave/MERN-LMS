import mongoose from "mongoose";

// MongoDB connection
export const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log('Database connected successfully!')
    })
    await mongoose.connect(`${process.env.MONGO_URI}/lms`)
}