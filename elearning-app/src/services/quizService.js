import api from './api'

export const getQuizzes = () => api.get('/quizzes')
export const getQuiz = (id) => api.get(`/quizzes/${id}`)
export const createQuiz = (quiz) => api.post('/quizzes', quiz)
export const updateQuiz = (id, quiz) => api.put(`/quizzes/${id}`, quiz)
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`)
