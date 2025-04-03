import api from './api'

export const getAssignments = () => api.get('/assignments')
export const getAssignment = (id) => api.get(`/assignments/${id}`)
export const createAssignment = (assignment) => api.post('/assignments', assignment)
export const updateAssignment = (id, assignment) => api.put(`/assignments/${id}`, assignment)
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`)
