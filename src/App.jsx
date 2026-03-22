import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

import Login            from './pages/Login'
import Home             from './pages/student/Home'
import QuizSession      from './pages/student/QuizSession'
import Result           from './pages/student/Result'
import Analytics        from './pages/student/Analytics'
import Leaderboard      from './pages/student/Leaderboard'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminQuestions   from './pages/admin/AdminQuestions'
import QuestionForm     from './pages/admin/QuestionForm'
import QuizForm         from './pages/admin/QuizForm'
import AdminStudents    from './pages/admin/AdminStudents'

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/"                        element={<Navigate to="/login" replace />} />
        <Route path="/login"                   element={<Login />} />
        <Route path="/home"                    element={<Home />} />
        <Route path="/quiz/:id"                element={<QuizSession />} />
        <Route path="/result/:id"              element={<Result />} />
        <Route path="/analytics"               element={<Analytics />} />
        <Route path="/leaderboard"             element={<Leaderboard />} />
        <Route path="/admin"                   element={<AdminDashboard />} />
        <Route path="/admin/questions"         element={<AdminQuestions />} />
        <Route path="/admin/questions/new"     element={<QuestionForm />} />
        <Route path="/admin/questions/edit/:id" element={<QuestionForm />} />
        <Route path="/admin/quizzes/new"       element={<QuizForm />} />
        <Route path="/admin/students"          element={<AdminStudents />} />
        <Route path="*"                        element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  )
}
