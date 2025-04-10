import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userSchema from '../user/schema.js';

const router = express.Router();
const User = mongoose.model('User', userSchema);

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret";

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'STUDENT' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Generate userID
    const highestUser = await User.findOne().sort('-userID');
    const userID = highestUser ? highestUser.userID + 1 : 1001;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      userID,
      lastActivity: new Date()
    });
    
    await newUser.save();
    
    res.status(201).json({ 
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password, legacyAuth } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`Login attempt for user: ${username}`);
    console.log(`Password in database starts with: ${user.password.substring(0, 10)}...`);
    
    let isPasswordValid = false;
    
    // Check if the stored password looks like a bcrypt hash (starts with $2a$, $2b$, etc.)
    const isBcryptHash = /^\$2[abxy]\$/.test(user.password);
    console.log(`Password appears to be hashed: ${isBcryptHash}`);
    
    if (isBcryptHash) {
      // Try bcrypt comparison for hashed passwords
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`Bcrypt comparison result: ${isPasswordValid}`);
      } catch (error) {
        console.error("Bcrypt comparison error:", error);
        isPasswordValid = false;
      }
    }
    
    // If password is not valid yet and legacyAuth is true, try direct comparison
    if (!isPasswordValid && legacyAuth) {
      console.log("Trying direct string comparison for legacy password");
      isPasswordValid = (password === user.password);
      console.log(`Direct comparison result: ${isPasswordValid}`);
      
      // If direct comparison succeeded, upgrade to hashed password
      if (isPasswordValid) {
        console.log("Upgrading legacy password to hashed version");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();
        console.log("Password successfully upgraded to bcrypt hash");
      }
    }
    
    if (!isPasswordValid) {
      console.log("Authentication failed: Invalid password");
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Authentication successful - continue with token generation
    console.log("Authentication successful");
    
    // Update last activity
    user.lastActivity = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;