import api from './api'

export const getCourses = () => api.get('/courses')
export const getCourse = (id) => api.get(`/courses/${id}`)
export const createCourse = (course) => api.post('/courses', course)
export const updateCourse = (id, course) => api.put(`/courses/${id}`, course)
export const deleteCourse = (id) => api.delete(`/courses/${id}`)
