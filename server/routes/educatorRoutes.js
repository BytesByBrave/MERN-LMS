import express from 'express';
import { addCourse, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEductor } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Route to update the user's role to educator
educatorRouter.get('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEductor, addCourse)

export default educatorRouter;
