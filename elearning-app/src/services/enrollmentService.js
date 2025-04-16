import api from './api';

// Get all enrollments
export const getEnrollments = () => {
  return api.get('/api/enrollments');
};

// Get a specific enrollment
export const getEnrollment = (id) => {
  return api.get(`/api/enrollments/${id}`);
};

// Create a new enrollment (Admin only)
export const createEnrollment = (enrollment) => {
  return api.post('/api/enrollments', enrollment);
};

// Update an enrollment (Admin only)
export const updateEnrollment = (id, enrollment) => {
  return api.put(`/api/enrollments/${id}`, enrollment);
};

// Delete an enrollment (Admin only)
export const deleteEnrollment = (id) => {
  return api.delete(`/api/enrollments/${id}`);
};

// Test authentication endpoint
export const testAuth = () => {
  return api.get('/api/enrollments/test-auth');
};
