import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Toaster} from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizList from "./pages/QuizList";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import EditQuiz from "./pages/EditPage";

export default function App() {
  return (
    <>
    <Toaster position="top-right" />
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ADMIN */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        {/* DEFAULT */}
        <Route path="*" element={<Login />} />
        <Route path="/quizzes"  element={<QuizList />} />
        <Route path="/courses"  element={<Courses />} />
        <Route path="/students" element={<Students />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/edit-quiz/:id" element={<EditQuiz />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      
      </Routes>
    </Router>
    </>
  );
}