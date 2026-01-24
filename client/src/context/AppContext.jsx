import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration"

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY
    const  navigate = useNavigate()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(true)

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    // Function to calculate average of ratings
    const calculateRating = (course)=> {
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return totalRating / course.courseRatings.length
    }

    //  Function to calculate course chapter time/duration
    const calculateChapterTime = (chapter)=> {
        let time = 0  
        chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, {units: ['h', 'm']})
    }

    // Function to calculate course duration
    const calculateCourseDuration = (course)=> {
        let time = 0

        course.createContext.map((chapter)=> chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration))
        return humanizeDuration(time * 60 * 1000, {units: ['h', 'm']})
    }

    // Function to calculate No lecture in a course
    const calculateNoOfLectures = () => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        })
        return totalLectures;
    }

    useEffect(()=> {
        fetchAllCourses()
    })

    const value = {
        currency, allCourses, navigate, calculateRating,
        isEducator, setIsEducator, calculateChapterTime, calculateNoOfLectures, calculateCourseDuration
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}