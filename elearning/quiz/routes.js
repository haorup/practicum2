import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Create a new quiz
router.post("/api/courses/:cid/quizzes", async (req, res) => {
  try {
    const quiz = {
      ...req.body,
      courses: req.params.cid  // Changed from course_number to courses to match schema
    };
    const newQuiz = await dao.createQuiz(quiz);
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all quizzes
router.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await dao.findAllQuizzes();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quizzes for a course
router.get("/api/courses/:cid/quizzes", async (req, res) => {
  try {
    const quizzes = await dao.findQuizzesByCourse(req.params.cid);
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz by ID
router.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await dao.findQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz
router.put("/api/quizzes/:id", async (req, res) => {
  try {
    const updatedQuiz = await dao.updateQuiz(req.params.id, req.body);
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete quiz
router.delete("/api/quizzes/:id", async (req, res) => {
  try {
    const deletedQuiz = await dao.deleteQuiz(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
