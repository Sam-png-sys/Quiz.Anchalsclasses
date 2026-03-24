import api from './axios'

// ── AUTH ─────────────────────────────────────────────────────────────────
export const sendOtp    = (phone)        => api.post('/auth/send-otp', { phone })
export const verifyOtp  = (phone, otp)   => api.post('/auth/verify-otp', { phone, otp })
export const getMe      = ()             => api.get('/auth/me')

// ── QUIZZES ───────────────────────────────────────────────────────────────
export const getQuizzes       = (params) => api.get('/quiz', { params })
export const getQuizById      = (id)     => api.get(`/quiz/${id}`)
export const createQuiz       = (data)   => api.post('/quiz', data)
export const updateQuiz       = (id, d)  => api.put(`/quiz/${id}`, d)
export const deleteQuiz       = (id)     => api.delete(`/quiz/${id}`)

// ── QUESTIONS ─────────────────────────────────────────────────────────────
export const getQuestions     = (params) => api.get('/questions', { params })
export const createQuestion   = (data)   => api.post('/questions', data)
export const updateQuestion   = (id, d)  => api.put(`/questions/${id}`, d)
export const deleteQuestion   = (id)     => api.delete(`/questions/${id}`)

// ── ATTEMPTS ──────────────────────────────────────────────────────────────
export const submitAttempt    = (data)   => api.post('/attempts/submit', data)
export const getMyAttempts    = ()       => api.get('/attempts/me')
export const getAttemptById   = (id)     => api.get(`/attempts/${id}`)

// ── ANALYTICS ─────────────────────────────────────────────────────────────
export const getMyAnalytics   = ()       => api.get('/analytics/me')
export const getAdminAnalytics= ()       => api.get('/analytics/admin')

// ── LEADERBOARD ───────────────────────────────────────────────────────────
export const getLeaderboard   = ()       => api.get('/leaderboard')

// ── ADMIN ─────────────────────────────────────────────────────────────────
export const getStudents      = ()       => api.get('/admin/students')
export const updateAccess     = (id, d)  => api.put(`/admin/students/${id}/access`, d)
export const getAdminStats    = ()       => api.get('/admin/stats')
