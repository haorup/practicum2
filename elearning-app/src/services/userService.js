import api from './api';

// Get all users - Admin only
export const getUsers = () => api.get('/users');

// Get a specific user
export const getUser = (id) => api.get(`/users/${id}`);

// Create a new user - Admin only
export const createUser = (user) => api.post('/users', user);

// Update a user - User can update own info, Admin can update anyone
export const updateUser = (id, user) => api.put(`/users/${id}`, user);

// Delete a user - Admin only
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Get current user profile
export const getCurrentUserProfile = () => api.get('/profile');
