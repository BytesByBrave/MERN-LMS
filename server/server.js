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
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { globalErrorHandler } from './middlewares/errorHandler.js';

// Initialization of express app
const app = express();

// Global Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stripe webhook MUST be registered BEFORE express.json() to preserve raw body
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

// middleware
app.use(helmet());

// CORS: allow both local dev and production client URLs
const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use('/api', apiLimiter);
app.use(express.json());
app.use(clerkMiddleware())

// Lazy database & Cloudinary connection (connect once per cold start)
let isConnected = false;
app.use(async (req, res, next) => {
    if (!isConnected) {
        await connectDB();
        await connectCloudinary();
        isConnected = true;
    }
    next();
});

// Routes
app.get('/', (req, res) => { res.send('API is running 🚀'); })
app.post('/clerk', express.json(), clerkWebhook)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', express.json(), courseRouter)
app.use('/api/user', express.json(), userRouter)

// Global Error Handler
app.use(globalErrorHandler);

// Start server only in non-Vercel environments (local dev)
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    })
}

// Export for Vercel serverless
export default app;