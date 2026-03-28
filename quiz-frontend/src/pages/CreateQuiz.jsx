import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, BookOpen, Clock, AlignLeft,
  Lightbulb, Save, ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function CreateQuiz() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({ title: "", description: "", duration: "" });
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  function newQuestion() {
    return { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" };
  }

  const handleQuizChange = (field, value) => setQuiz({ ...quiz, [field]: value });

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, newQuestion()]);
    // Auto-scroll to new question
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 50);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const toggleCollapse = (index) => {
    setCollapsed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const validate = () => {
    if (!quiz.title.trim() || !quiz.duration) { alert("Title and duration are required"); return false; }
    for (let q of questions) {
      if (!q.questionText.trim()) { alert("All questions need text"); return false; }
      if (q.options.some(o => !o.trim())) { alert("Fill all options"); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const quizRes = await fetch("http://127.0.0.1:8000/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: quiz.title, description: quiz.description,
          duration: Number(quiz.duration), totalQuestions: questions.length,
        }),
      });
      const quizData = await quizRes.json();
      if (!quizRes.ok) { alert(quizData.detail || "Quiz creation failed"); return; }
      const quizId = quizData.quiz_id;
      for (let q of questions) {
        await fetch("http://127.0.0.1:8000/admin/question", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quizId, questionText: q.questionText, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation }),
        });
      }
      alert("Quiz created successfully 🚀");
      setQuiz({ title: "", description: "", duration: "" });
      setQuestions([newQuestion()]);
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Quiz</h1>
            <p className="text-sm text-white/35 mt-0.5">Build a new quiz for your students</p>
          </div>
        </div>

        {/* Quiz info card */}
        <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={15} className="text-cyan-400" />
            <h2 className="text-[14px] font-bold text-white">Quiz Details</h2>
          </div>

          <div className="flex flex-col gap-4">
            <Field icon={<BookOpen size={14} className="text-white/30" />} label="Quiz Title">
              <input
                value={quiz.title}
                onChange={e => handleQuizChange("title", e.target.value)}
                placeholder="e.g. Oral Anatomy — Chapter 1"
                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
              />
            </Field>

            <Field icon={<AlignLeft size={14} className="text-white/30" />} label="Description">
              <textarea
                rows={2}
                value={quiz.description}
                onChange={e => handleQuizChange("description", e.target.value)}
                placeholder="Brief description of this quiz..."
                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none"
              />
            </Field>

            <Field icon={<Clock size={14} className="text-white/30" />} label="Duration (minutes)">
              <input
                type="number" min={1}
                value={quiz.duration}
                onChange={e => handleQuizChange("duration", e.target.value)}
                placeholder="e.g. 30"
                className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
              />
            </Field>
          </div>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-400" />
              <h2 className="text-[14px] font-bold text-white">Questions</h2>
              <span className="text-[11px] font-bold text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                {questions.length}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {questions.map((q, index) => (
              <motion.div key={index}
                variants={fadeUp} initial="hidden" animate="show" exit="exit"
                className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl overflow-hidden">

                {/* Question header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[12px] font-bold text-cyan-400">
                      {index + 1}
                    </div>
                    <span className="text-[13px] font-semibold text-white/60 truncate max-w-[240px]">
                      {q.questionText || `Question ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleCollapse(index)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                      {collapsed[index] ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(index)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question body */}
                {!collapsed[index] && (
                  <div className="p-5 flex flex-col gap-4">
                    {/* Question text */}
                    <Field icon={<AlignLeft size={14} className="text-white/30" />} label="Question">
                      <textarea rows={2}
                        value={q.questionText}
                        onChange={e => handleQuestionChange(index, "questionText", e.target.value)}
                        placeholder="Type your question here..."
                        className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none"
                      />
                    </Field>

                    {/* Options */}
                    <div>
                      <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3 block">
                        Options — click radio to mark correct answer
                      </label>
                      <div className="flex flex-col gap-2">
                        {q.options.map((opt, i) => {
                          const isCorrect = q.correctAnswer === i;
                          return (
                            <div key={i}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
                                ${isCorrect
                                  ? "border-cyan-500/40 bg-cyan-500/8"
                                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"}`}>
                              <button
                                onClick={() => handleQuestionChange(index, "correctAnswer", i)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                  ${isCorrect ? "border-cyan-400 bg-cyan-400" : "border-white/20 hover:border-cyan-400/50"}`}>
                                {isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                              </button>
                              <span className={`text-[12px] font-bold flex-shrink-0 w-5 ${isCorrect ? "text-cyan-400" : "text-white/25"}`}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <input
                                value={opt}
                                onChange={e => handleOptionChange(index, i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className={`flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/20
                                  ${isCorrect ? "text-cyan-300" : "text-white/70"}`}
                              />
                              {isCorrect && (
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 flex-shrink-0">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <Field icon={<Lightbulb size={14} className="text-amber-400/60" />} label="AI Explanation (optional)">
                      <textarea rows={2}
                        value={q.explanation}
                        onChange={e => handleQuestionChange(index, "explanation", e.target.value)}
                        placeholder="Explain why the correct answer is right..."
                        className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none"
                      />
                    </Field>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add question button */}
        <button onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/[0.10] text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200 mb-6 text-[13px] font-semibold">
          <PlusCircle size={16} />
          Add Question
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[15px] hover:opacity-90 hover:shadow-xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
        >
          <Save size={17} />
          {loading ? "Creating Quiz..." : `Create Quiz · ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
        </button>

      </div>
    </div>
  );
}

// Reusable field wrapper
function Field({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] focus-within:border-cyan-500/30 focus-within:bg-cyan-500/[0.03] transition-all duration-200">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-1">{label}</label>
        {children}
      </div>
    </div>
  );
}
