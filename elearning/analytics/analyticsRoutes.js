import express from 'express';
const router = express.Router();
import * as analyticsController from './analyticsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

// Routes that require authentication
router.use(verifyToken);

// Get student performance data
router.get('/student-performance', analyticsController.getStudentPerformance);

// Get course analytics data
router.get('/course-analytics', analyticsController.getCourseAnalytics);

export default router;
