import mongoose, { mongo } from 'mongoose';

//  CourseProgress schema
const courseProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        courseId: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        lectureCompleted: []
    },
    {timestamps: true}
)
const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema)

export default CourseProgress