import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import assignmentRoutes from "./assignment/routes.js";
import courseRoutes from "./course/routes.js";
import quizRoutes from "./quiz/routes.js";
import userRoutes from "./user/routes.js";
import enrollmentRoutes from "./enrollment/routes.js";
import authRoutes from './auth/authRoutes.js';
import { verifyToken } from './middleware/authMiddleware.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas with proper ServerAPI configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning';
// const MONGODB_URI = 'mongodb://localhost:27017/elearning';

// Configure MongoDB connection with ServerAPI options
mongoose.connect(MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
})
.then(() => {
  console.log('Initial connection successful');
  return mongoose.connection.db.admin().command({ ping: 1 });
})
.then(() => {
  console.log('Connected to MongoDB Atlas successfully! ');
  // Log database name to confirm we're connected to the right database
  console.log(`Connected to database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('MongoDB Atlas connection error:', err);
  // More detailed error information
  if (err.name === 'MongoServerSelectionError') {
    console.error('Could not select a MongoDB server. Check your network or connection string.');
  }
  // For debugging connection issues
  console.error('Connection string used (without password):', 
    MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use(verifyToken, userRoutes);
app.use(verifyToken, courseRoutes);
app.use(verifyToken, assignmentRoutes);
app.use(verifyToken, quizRoutes);
app.use(verifyToken, enrollmentRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});