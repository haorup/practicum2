import express from "express";
import * as dao from "./dao.js";
import { verifyToken, isAdmin, isFacultyOrAdmin, filterEnrollmentsByRole } from "../middleware/authMiddleware.js";
import Enrollment from "./model.js";

const router = express.Router();

// Create a new enrollment - Admin only
router.post("/api/enrollments", verifyToken, isAdmin, async (req, res) => {
  try {
    const newEnrollment = await dao.createEnrollment(req.body);
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

// Get all enrollments - All authenticated users, but filter based on role
router.get("/api/enrollments", verifyToken, filterEnrollmentsByRole, async (req, res) => {
  try {
    let enrollments;
    
    if (req.userRole === 'STUDENT') {
      // Students can only see their own enrollments
      enrollments = await dao.findEnrollmentsByUser(req.userId);
    } else {
      // Faculty and admin can see all
      enrollments = await dao.findAllEnrollments();
    }
    
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollment by ID - All authenticated users, but verify ownership for students
router.get("/api/enrollments/:id", verifyToken, async (req, res) => {
  try {
    const enrollment = await dao.findEnrollmentById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    
    // Students can only access their own enrollments
    if (req.userRole === 'STUDENT' && 
        enrollment.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollments by user ID
router.get("/api/users/:userId/enrollments", async (req, res) => {
  try {
    const enrollments = await dao.findEnrollmentsByUser(req.params.userId);
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollments by course ID
router.get("/api/courses/:courseId/enrollments", async (req, res) => {
  try {
    const enrollments = await dao.findEnrollmentsByCourse(req.params.courseId);
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if a user is enrolled in a course
router.get("/api/users/:userId/courses/:courseId/enrollment", async (req, res) => {
  try {
    const isEnrolled = await dao.isUserEnrolled(req.params.userId, req.params.courseId);
    res.status(200).json({ isEnrolled });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New endpoint to check if a user has any enrollments
router.get("/api/users/:userId/has-enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.params.userId }).limit(1);
    res.status(200).json({ hasEnrollments: enrollments.length > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New endpoint to check if a course has any enrollments
router.get("/api/courses/:courseId/has-enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId }).limit(1);
    res.status(200).json({ hasEnrollments: enrollments.length > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update enrollment - Admin only
router.put("/api/enrollments/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedEnrollment = await dao.updateEnrollment(req.params.id, req.body);
    if (!updatedEnrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json(updatedEnrollment);
  } catch (error) {
    res.status(400).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

// Delete enrollment - Admin only
router.delete("/api/enrollments/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedEnrollment = await dao.deleteEnrollment(req.params.id);
    if (!deletedEnrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

// Bulk enrollment endpoint - demonstrates complex transaction with potential rollback
router.post("/api/courses/:courseId/bulk-enroll", async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Invalid user IDs provided" });
    }
    
    const results = await dao.bulkEnrollStudents(req.params.courseId, userIds);
    
    res.status(200).json({
      message: "Bulk enrollment processed",
      results
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

export default router;
