import express from 'express';
import * as dao from './dao.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users - ADMIN only
router.get('/api/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await dao.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID - Any authenticated user (with additional checks)
router.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    // Allow users to get their own info or admins to get any user's info
    if (req.userId !== req.params.id && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: You can only view your own profile' });
    }
    
    const user = await dao.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user - ADMIN only
router.post('/api/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const newUser = await dao.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user - User can update own info, ADMIN can update anyone
router.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    // Allow users to update their own info or admins to update any user's info
    if (req.userId !== req.params.id && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: You can only update your own profile' });
    }
    
    // If a non-admin user tries to change their own role, prevent it
    if (req.userRole !== 'ADMIN' && req.body.role && req.body.role !== req.userRole) {
      return res.status(403).json({ message: 'Access denied: You cannot change your role' });
    }
    
    const updatedUser = await dao.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user - ADMIN only
router.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedUser = await dao.deleteUser(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    // Check for specific error that might indicate the user has related data
    if (error.name === 'MongoServerError' && error.code === 16759) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing enrollments or assignments. Remove related data first.' 
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// Current user profile - Any authenticated user
router.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await dao.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
