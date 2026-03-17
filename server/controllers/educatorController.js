import {clerkClient} from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'

// Update the user's role to educator 
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })
        res.json({
            success: true,
            message: 'Your role has been updated to educator',
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Add new course 
export const addCourse = async () => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if(!imageFile){
            return res.json({
                success: false,
                message: 'Course thumbnail is required'
            })
        }
        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()
        
        res.json({
            success: true,
            message: 'Course Added successfully',
            course: newCourse
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}