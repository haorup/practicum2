import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import assignmentRoutes from "./assignment/routes.js";
import courseRoutes from "./course/routes.js";
import quizRoutes from "./quiz/routes.js";
import userRoutes from "./user/routes.js";
import enrollmentRoutes from "./enrollment/routes.js";
import authRoutes from './auth/authRoutes.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS properly - this needs to come before other middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Parse JSON bodies
app.use(express.json());

// Connect to MongoDB Atlas with proper ServerAPI configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning';

// Configure MongoDB connection with ServerAPI options
mongoose.connect(MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use(userRoutes);
app.use(courseRoutes);
app.use(assignmentRoutes);
app.use(quizRoutes);
app.use(enrollmentRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});