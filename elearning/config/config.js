import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use the same secret as in authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default {
  JWT_SECRET,
  // Add other configuration settings as needed
  tokenExpiration: '24h',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning'
};
