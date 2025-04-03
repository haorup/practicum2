import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Create a new assignment
router.post("/api/courses/:cid/assignment", async (req, res) => {
  try {
    const newAssignment = await dao.createAssignment(req.body);
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all assignments
router.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await dao.findAllAssignments();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update assignment
router.put("/api/courses/:aid", async (req, res) => {
  try {
    const updatedAssignment = await dao.updateAssignment(req.params.id, req.body);
    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment
router.delete("/api/courses/:aid", async (req, res) => {
  try {
    const deletedAssignment = await dao.deleteAssignment(req.params.id);
    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
