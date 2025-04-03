import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Create a new course
router.post("/api/courses", async (req, res) => {
  try {
    const newCourse = await dao.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all courses
router.get("/api/courses", async (req, res) => {
  try {
    const courses = await dao.findAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course by ID
router.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await dao.findCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course
router.put("/api/courses/:id", async (req, res) => {
  try {
    const updatedCourse = await dao.updateCourse(req.params.id, req.body);
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course
router.delete("/api/courses/:id", async (req, res) => {
  try {
    const deletedCourse = await dao.deleteCourse(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
