import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Create a new enrollment with transaction support
router.post("/api/enrollments", async (req, res) => {
  try {
    const newEnrollment = await dao.createEnrollment(req.body);
    res.status(201).json(newEnrollment);
  } catch (error) {
    console.error("Enrollment creation failed:", error);
    res.status(400).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

// Get all enrollments
router.get("/api/enrollments", async (req, res) => {
  try {
    const enrollments = await dao.findAllEnrollments();
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get enrollment by ID
router.get("/api/enrollments/:id", async (req, res) => {
  try {
    const enrollment = await dao.findEnrollmentById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
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

// Update enrollment with transaction support
router.put("/api/enrollments/:id", async (req, res) => {
  try {
    const updatedEnrollment = await dao.updateEnrollment(req.params.id, req.body);
    if (!updatedEnrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json(updatedEnrollment);
  } catch (error) {
    console.error("Enrollment update failed:", error);
    res.status(400).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

// Delete enrollment with transaction support
router.delete("/api/enrollments/:id", async (req, res) => {
  try {
    const deletedEnrollment = await dao.deleteEnrollment(req.params.id);
    if (!deletedEnrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error("Enrollment deletion failed:", error);
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
    console.error("Bulk enrollment failed:", error);
    res.status(500).json({ 
      message: error.message,
      transactionFailed: true
    });
  }
});

export default router;
