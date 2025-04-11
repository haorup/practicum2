import jwt from 'jsonwebtoken';
import User from '../user/model.js';
import bcrypt from 'bcryptjs';

// Add this console log to show what secret is being used
console.log("Auth service using JWT_SECRET:", process.env.JWT_SECRET ? 
  process.env.JWT_SECRET.substring(0, 3) + '...' : 
  'default secret');

// ...existing code...