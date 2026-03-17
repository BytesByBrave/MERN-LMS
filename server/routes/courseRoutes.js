import express from 'express';
import { getAllCourses, getCourseById } from '../controllers/courseController.js';
import { get } from 'mongoose';

const courseRouter = express.Router();

courseRouter.get('/all', getAllCourses)
courseRouter.get('/:id', getCourseById)

export default courseRouter;