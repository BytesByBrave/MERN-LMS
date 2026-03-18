import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './configs/mongodb.js';
import { clerkWebhook, stripeWebhook } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoutes.js';
import userRouter from './routes/userRoutes.js';

//  Initialization of express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

// Database connection
await connectDB(); 

// Cloudinary connection
await connectCloudinary();

// Routes
app.get('/', (req, res) => {res.send('Hello World!');}) 
app.post('/clerk', express.json(), clerkWebhook)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhook)

// Start the server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})