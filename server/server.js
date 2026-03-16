import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './configs/mongodb.js';

//  Initialization of express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Database connection
await connectDB(); 

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
}) 

// Start the server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})