import Course from "../models/Course.js";

//  Get all courses `
export const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({isPublished: true})
        .select(['-courseContent', '-enrolledStudents'])
        .populate({path: 'educator'})
        res.json({
            success: true,
            courses
        })
    } catch (error) {
        next(error);
    }
}

// Get course by id
export const getCourseById = async (req, res, next) => {
    const {id} = req.params
    try {
        const courseData = await Course.findById(id).populate({path: 'educator'})

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";

                }
            })
        })
        res.json({
            success: true,
            courseData
        })
    } catch (error) {
        next(error);
    }
}