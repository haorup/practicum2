import axios from 'axios';
import authHeader from './authHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth headers
api.interceptors.request.use(
  (config) => {
    // Add authorization headers to every request
    const headers = authHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    if (headers['x-user-role']) {
      config.headers['x-user-role'] = headers['x-user-role'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle auth errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      console.log('Authentication error, redirecting to login...');
      // Optional: Redirect to login or clear auth tokens
      // localStorage.removeItem('user');
      // window.location = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
