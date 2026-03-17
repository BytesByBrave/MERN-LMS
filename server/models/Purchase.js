import mongoose from "mongoose";

// Purchase Schema to store purchase details of a course by a user
const purchaseSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            require: true
        },
        userId: {
            type: String,
            ref: 'User',
            require: true
        },
        amount: {
            type: Number,
            require: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        }
    }, 
    {timestamps: true}
)
const Purchase = mongoose.model('Purchase', purchaseSchema)

export default Purchase; 