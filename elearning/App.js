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

// const CONNECTION_STRING = "mongodb://127.0.0.1:27017/elearning";
// mongoose.connect(CONNECTION_STRING);
// const app = express();
// app.use(cors());
// app.use(express.json());

// // Register routes
// app.use(assignmentRoutes);
// app.use(courseRoutes);
// app.use(quizRoutes);
// app.use(userRoutes);
// app.use(enrollmentRoutes);

// app.listen(process.env.PORT || 4000, () => {
//   console.log(`Server running on port ${process.env.PORT || 4000}`);
// });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/elearning';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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