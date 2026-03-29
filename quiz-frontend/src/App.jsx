import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizList from "./pages/QuizList";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
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
      
        
      </Routes>
    </Router>
  );
}