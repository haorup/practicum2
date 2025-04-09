import api from './api'

export const getQuizzes = () => api.get('/quizzes')
export const getQuiz = (id) => api.get(`/quizzes/${id}`)
// Update parameter name for clarity
export const createQuiz = (courseId, quiz) => api.post(`/courses/${courseId}/quizzes`, quiz)
export const updateQuiz = (id, quiz) => api.put(`/quizzes/${id}`, quiz)
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`)
