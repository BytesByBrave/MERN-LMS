import express from 'express';
import { updateRoleToEducator } from '../controllers/educatorController.js';

const educatorRouter = express.Router();

// Route to update the user's role to educator
educatorRouter.get('/update-role', updateRoleToEducator)

export default educatorRouter;