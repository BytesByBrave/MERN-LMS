import { clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js'
import Purchase from '../models/Purchase.js'
import User from '../models/User.js'

// Update the user's role to educator 
export const updateRoleToEducator = async (req, res, next) => {
    try {
        const userId = req.auth ? req.auth.userId : null;

        if (!userId) {
            console.error("Clerk Auth Rejection Debug: req.auth is:", req.auth, " | Authorization Header:", req.headers.authorization);
            return res.json({
                success: false,
                message: 'Unauthorized - Invalid or missing Clerk Token'
            })
        }

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
        next(error);
    }
}

// Add new course 
export const addCourse = async (req, res, next) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({
                success: false,
                message: 'Course thumbnail is required'
            })
        }
        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        parsedCourseData.courseThumbnail = imageUpload.secure_url
        const newCourse = await Course.create(parsedCourseData)

        res.json({
            success: true,
            message: 'Course Added successfully',
            course: newCourse
        })
    } catch (error) {
        next(error);
    }
}

//  Get educator courses
export const getEducatorCourses = async (req, res, next) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        res.json({
            success: true,
            courses
        })
    } catch (error) {
        next(error);
    }
}

//  Educator dashboard data ( total earnings, total courses, total students enrolled)
export const educatorDashboardData = async (req, res, next) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        const totalCourses = courses.length;
        const courseIds = courses.map(course => course._id);

        // Calculate total earnings and total students enrolled using the courseIds
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        })
        const totalEarnings = purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);

        //  Get unique userIds from purchases to calculate total students enrolled
        const enrolledStudentsData = [];
        for (const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl');
            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }
        res.json({
            success: true,
            dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })
    } catch (error) {
        next(error);
    }
}

//  Get students enrolled students data with purchase date
export const getEnrolledStudentsData = async (req, res, next) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({educator})
        const courseIds = courses.map(course => course._id);

        // Get purchases for the educator's courses
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');
        
        // Format the enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));
        res.json({
            success: true,
            enrolledStudents
        })
    } catch (error) {
        next(error);
    }
}