import express from "express";
import * as dao from "./dao.js";

const router = express.Router();

// Create a new user
router.post("/api/users", async (req, res) => {
  try {
    const newUser = await dao.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users
router.get("/api/users", async (req, res) => {
  try {
    const users = await dao.findAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get("/api/users/:id", async (req, res) => {
  try {
    const user = await dao.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by role
router.get("/api/users/role/:role", async (req, res) => {
  try {
    const users = await dao.findUsersByRole(req.params.role);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await dao.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await dao.deleteUser(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
