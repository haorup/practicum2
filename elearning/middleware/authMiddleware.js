import jwt from 'jsonwebtoken';

const JWT_SECRET = "your_jwt_secret"; // Should match the secret in authRoutes.js

export const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Role check middleware
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: 'No role specified' });
    }
    
    if (roles.includes(req.userRole)) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};