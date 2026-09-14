import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {Toaster} from "react-hot-toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizList from "./pages/QuizList";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Analytics from "./pages/Analytics";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import EditQuiz from "./pages/EditPage";
import StudyMaterials from "./pages/StudyMaterials";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />

        {/* ADMIN (PROTECTED) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/study-materials" element={<ProtectedRoute><StudyMaterials /></ProtectedRoute>} />
        <Route path="/edit-quiz/:id" element={<ProtectedRoute><EditQuiz /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* DEFAULT CATCH-ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      
      </Routes>
    </Router>
    </>
  );
}
