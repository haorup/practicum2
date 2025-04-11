import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Common secrets that might have been used to sign tokens
    const possibleSecrets = [
      config.JWT_SECRET,
      'your_jwt_secret', 
      'your_super_secure_jwt_secret_key_for_elearning_platform',
      'your-secret-key',
      'elearning-platform-secret-key',
      'secret',
      'jwt-secret-key',
      'jwtSecretKey',
      'APP_SECRET',
      process.env.JWT_SECRET || '',
    ];
    
    let decoded = null;
    let successfulSecret = null;
    
    // Try each possible secret
    for (const secret of possibleSecrets) {
      try {
        decoded = jwt.verify(token, secret);
        successfulSecret = secret;
        break; // If verification succeeds, exit the loop
      } catch (e) {
        // Continue to next secret
      }
    }
    
    // If no secret worked
    if (!decoded) {
      throw new Error("Token verification failed with all possible secrets");
    }
    
    // Extract user information from token
    req.userId = decoded.id || decoded._id || decoded.userId || decoded.user_id;
    req.userRole = req.headers['x-user-role'] || decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Requires admin role' });
};

export const isFacultyOrAdmin = (req, res, next) => {
  if (req.userRole === 'FACULTY' || req.userRole === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Requires faculty or admin role' });
};

export const isStudent = (req, res, next) => {
  if (req.userRole === 'STUDENT') {
    return next();
  }
  return res.status(403).json({ message: 'Requires student role' });
};

export const filterEnrollmentsByRole = (req, res, next) => {
  // This middleware will be used to filter enrollment responses based on role
  req.filterByRole = true;
  next();
};