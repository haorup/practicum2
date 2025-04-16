import jwt from 'jsonwebtoken';

const JWT_SECRET = "your_jwt_secret";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Extract user information from token
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
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