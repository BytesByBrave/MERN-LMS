import User from '../models/User.js'
import Course from '../models/Course.js'
import Purchase from '../models/Purchase.js';
import Stripe from 'stripe';
import CourseProgress from '../models/CourseProgress.js';
import { clerkClient } from '@clerk/express';

//  User controller to manage the user data in database
export const getUserData = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        let user = await User.findById(userId)

        if (!user) {
            // Enterprise Fallback: If sandbox webhook failed, auto-sync from Clerk
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                if (clerkUser) {
                    const newUserData = {
                        _id: clerkUser.id,
                        email: clerkUser.emailAddresses[0].emailAddress,
                        name: clerkUser.firstName + ' ' + clerkUser.lastName,
                        imageUrl: clerkUser.imageUrl
                    };
                    user = await User.create(newUserData);
                }
            } catch(e) {
                return res.json({ success: false, message: 'User not found' });
            }
        }
        res.json({
            success: true,
            user
        })
    } catch (error) {
        next(error);
    }
}

//  User enrolled courses with lecture links
export const userEnrolledCourses = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate('enrolledCourses')

        if(!userData){
            return res.json({
                success: true,
                enrolledCourses: []
            })
        }
        res.json({
            success: true,
            enrolledCourses: userData.enrolledCourses
        })
    } catch (error) {
        next(error);
    }
}

//  Purchase Course controller
export const purchaseCourse = async (req, res, next) => {
    try {
        const {courseId} = req.body
        const {origin} = req.headers
        const userId = req.auth.userId
        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if(!userData || !courseData){
            return res.json({
                success: false,
                message: 'Data not found'
            })
        }
        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
        }
        const newPurchase = await Purchase.create(purchaseData)

        // Stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        // Create a Line item for the stripe
        const line_items = [{
            price_data:{
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            }, 
            quantity: 1
        }]
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })
        res.json({
            success: true,
            session_url: session.url
        })
    } catch (error) {
        next(error);
    }
}

//  Verify purchase and complete enrollment (fallback for webhook)
export const verifyPurchase = async (req, res, next) => {
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId)

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Find all pending purchases for this user
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const pendingPurchases = await Purchase.find({ userId, status: 'pending' })

        for (const purchase of pendingPurchases) {
            // Check Stripe for payment status via checkout sessions
            const sessions = await stripeInstance.checkout.sessions.list({
                limit: 5,
            })

            for (const session of sessions.data) {
                if (session.metadata.purchaseId === purchase._id.toString() && session.payment_status === 'paid') {
                    // Payment confirmed — complete the enrollment
                    const courseData = await Course.findById(purchase.courseId)
                    if (courseData) {
                        if (!courseData.enrolledStudents.includes(userId)) {
                            courseData.enrolledStudents.push(userId)
                            await courseData.save()
                        }
                        if (!userData.enrolledCourses.includes(purchase.courseId.toString())) {
                            userData.enrolledCourses.push(courseData._id)
                            await userData.save()
                        }
                    }
                    purchase.status = 'completed'
                    await purchase.save()
                    break
                }
            }
        }

        res.json({ success: true, message: 'Purchases verified' })
    } catch (error) {
        next(error);
    }
}

//  User course progress updater
export const updateUserCourseProgress = async (req, res, next) => {
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({
                    success: true,
                    message: 'Lecture already completed'
                })
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save();
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }
        res.json({
            success: true,
            message: 'Progress updated successfully'
        })
    } catch (error) {
        next(error);
    }
}

//  Get user course progress
export const getUserCourseProgress = async (req, res, next) => {
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.json({
            success: true,
            progressData
        })
    } catch (error) {
        next(error);
    }
}

//  Add user rating and review for a course
export const addUserRating = async (req, res, next) => {
        const userId = req.auth.userId
        const {courseId, rating} = req.body

        if(!userId || !courseId || !rating || rating < 1 || rating > 5){
            return res.json({
                success: false,
                message: 'Invalid details'
            })
        }
        try {
            const course = await Course.findById(courseId)
            if(!course){
                return res.json({
                    success: false,
                    message: 'Course not found'
                })
            }
            const user = await User.findById(userId)
            if(!user || !user.enrolledCourses.includes(courseId)){
                return res.json({
                    success: false,
                    message: 'User has not enrolled in this course'
                })
            }
            const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
            if(existingRatingIndex > -1){
                course.courseRatings[existingRatingIndex].rating = rating;
            } else {
                course.courseRatings.push({userId, rating})
            }
            await course.save(); 
            return res.json({
                success: true,
                message: 'Rating added successfully'
            })
        } catch (error) {
            next(error);
        }
}