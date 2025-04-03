import api from './api'

export const getEnrollments = () => api.get('/enrollments')
export const getEnrollment = (id) => api.get(`/enrollments/${id}`)
export const createEnrollment = (enrollment) => api.post('/enrollments', enrollment)
export const updateEnrollment = (id, enrollment) => api.put(`/enrollments/${id}`, enrollment)
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`)
