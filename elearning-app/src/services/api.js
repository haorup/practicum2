import axios from 'axios';
import AuthService from './AuthService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:4000/api/'
});

// Add request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const headers = AuthService.authHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
