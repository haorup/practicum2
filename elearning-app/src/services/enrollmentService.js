import api from './api';

// Get all enrollments
export const getEnrollments = () => {
  return api.get('/enrollments');
};

// Get a specific enrollment
export const getEnrollment = (id) => {
  return api.get(`/enrollments/${id}`);
};

// Create a new enrollment (Admin only)
export const createEnrollment = (enrollment) => {
  return api.post('/enrollments', enrollment);
};

// Update an enrollment (Admin only)
export const updateEnrollment = (id, enrollment) => {
  return api.put(`/enrollments/${id}`, enrollment);
};

// Delete an enrollment (Admin only)
export const deleteEnrollment = (id) => {
  return api.delete(`/enrollments/${id}`);
};

// Test authentication endpoint
export const testAuth = () => {
  return api.get('/enrollments/test-auth');
};
