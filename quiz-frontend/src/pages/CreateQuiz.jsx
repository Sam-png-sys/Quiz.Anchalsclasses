import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, BookOpen, Clock, AlignLeft,
  Lightbulb, Save, ArrowLeft, GraduationCap, BarChart2,
  ImagePlus, X, FileText, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.1.8:8000";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:   { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const DIFFICULTY_LEVELS = [
  { value: "easy",   label: "Easy",   color: "text-emerald-400", dot: "bg-emerald-400", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "medium", label: "Medium", color: "text-amber-400",   dot: "bg-amber-400",   badge: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { value: "hard",   label: "Hard",   color: "text-rose-400",    dot: "bg-rose-400",    badge: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
];

function newQuestion() {
  return {
    questionText: "",
    options:      ["", "", "", ""],
    correctAnswer: 0,
    explanation:  "",
    imageUrl:     null,
    imagePreview: null,
    uploading:    false,
  };
}

export default function CreateQuiz() {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const imageRefs = useRef([]);

  const [quiz, setQuiz] = useState({
    title: "", description: "", duration: "", course: "", difficulty: "",
  });
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPdf, setAiPdf] = useState(null);
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [collapsed, setCollapsed] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleQuizChange = (field, value) =>
    setQuiz(prev => ({ ...prev, [field]: value }));

  //  Use functional updater everywhere to avoid stale state
  const updateQuestion = (index, patch) =>
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });

  const handleQuestionChange = (index, field, value) =>
    updateQuestion(index, { [field]: value });

  const handleOptionChange = (qIndex, oIndex, value) =>
    setQuestions(prev => {
      const next = [...prev];
      const opts = [...next[qIndex].options];
      opts[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });

  const addQuestion = () => {
    setQuestions(prev => [...prev, newQuestion()]);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCollapse = (index) =>
    setCollapsed(prev => ({ ...prev, [index]: !prev[index] }));

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImagePick = async (index, file) => {
    if (!file) return;

    // 1. Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      updateQuestion(index, { imagePreview: e.target.result, uploading: true });
    };
    reader.readAsDataURL(file);

    // 2. Upload to backend → Cloudinary
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading to:", `${API_BASE}/admin/upload-question-image`);

      const res = await fetch(`${API_BASE}/admin/upload-question-image`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
        //  Do NOT set Content-Type — browser sets it with boundary for multipart
      });

      const text = await res.text(); // read as text first for better error logging
      console.log("Upload response:", res.status, text);

      if (!res.ok) throw new Error(`Upload failed: ${res.status} ${text}`);

      const data = JSON.parse(text);
      //  functional updater — no stale closure
      updateQuestion(index, { imageUrl: data.url, uploading: false });

    } catch (err) {
      console.error("Image upload error:", err.message);
      alert(`Image upload failed: ${err.message}`);
      updateQuestion(index, { imageUrl: null, imagePreview: null, uploading: false });
    }
  };

  const removeImage = (index) =>
    updateQuestion(index, { imageUrl: null, imagePreview: null });

  const handleAIGenerateQuiz = async () => {
    if (!aiPdf) { alert("Please select a PDF first"); return; }
    if (!quiz.title.trim()) { alert("Quiz title is required"); return; }
    if (!quiz.course.trim()) { alert("Course name is required"); return; }
    if (!quiz.difficulty) { alert("Please select a difficulty level"); return; }
    if (!quiz.duration) { alert("Duration is required"); return; }

    try {
      setAiLoading(true);
      const formData = new FormData();
      formData.append("file", aiPdf);
      formData.append("title", quiz.title);
      formData.append("description", quiz.description);
      formData.append("course", quiz.course);
      formData.append("difficulty", quiz.difficulty);
      formData.append("duration", Number(quiz.duration));
      formData.append("questionCount", Number(aiQuestionCount));

      const res = await fetch(`${API_BASE}/ai/admin/generate-quiz`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "AI quiz generation failed");

      alert(`AI created quiz with ${data.totalQuestions} questions`);
      setAiPdf(null);
      setQuiz({ title: "", description: "", duration: "", course: "", difficulty: "" });
      setQuestions([newQuestion()]);
      navigate("/quizzes");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!quiz.title.trim() || !quiz.duration) { alert("Title and duration are required"); return false; }
    if (!quiz.course.trim())  { alert("Course name is required"); return false; }
    if (!quiz.difficulty)     { alert("Please select a difficulty level"); return false; }
    for (let q of questions) {
      if (!q.questionText.trim())            { alert("All questions need text"); return false; }
      if (q.options.some(o => !o.trim()))    { alert("Fill all options"); return false; }
      if (q.uploading)                       { alert("Please wait for image uploads to finish"); return false; }
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      const quizRes = await fetch(`${API_BASE}/admin/quiz`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:          quiz.title,
          description:    quiz.description,
          duration:       Number(quiz.duration),
          totalQuestions: questions.length,
          course:         quiz.course,
          difficulty:     quiz.difficulty,
        }),
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok) { alert(quizData.detail || "Quiz creation failed"); return; }

      const quizId = quizData.quiz_id;

      for (let q of questions) {
        const qRes = await fetch(`${API_BASE}/admin/question`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            quizId,
            question:       q.questionText,
            options:        q.options,
            correct_answer: q.options[q.correctAnswer], //  text not index
            explanation:    q.explanation,
            imageUrl:       q.imageUrl || null,
          }),
        });
        if (!qRes.ok) {
          const err = await qRes.json();
          console.error("Question add failed:", err);
        }
      }

      alert("Quiz created successfully 🚀");
      setQuiz({ title: "", description: "", duration: "", course: "", difficulty: "" });
      setQuestions([newQuestion()]);
    } catch (err) {
      console.error(err);
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedDifficulty = DIFFICULTY_LEVELS.find(d => d.value === quiz.difficulty);

  return (
    <div className="h-screen flex flex-col bg-[#080810] text-white overflow-hidden">
      <Navbar />

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto w-full px-4 py-8">

          {/* Header */}
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

          {/* Quiz Details */}
          <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={15} className="text-cyan-400" />
              <h2 className="text-[14px] font-bold text-white">Quiz Details</h2>
            </div>
            <div className="flex flex-col gap-4">
              <Field icon={<BookOpen size={14} className="text-white/30" />} label="Quiz Title">
                <input value={quiz.title} onChange={e => handleQuizChange("title", e.target.value)}
                  placeholder="e.g. Oral Anatomy — Chapter 1"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
              </Field>
              <Field icon={<AlignLeft size={14} className="text-white/30" />} label="Description">
                <textarea rows={2} value={quiz.description} onChange={e => handleQuizChange("description", e.target.value)}
                  placeholder="Brief description of this quiz..."
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<GraduationCap size={14} className="text-cyan-400/60" />} label="Course">
                  <input value={quiz.course} onChange={e => handleQuizChange("course", e.target.value)}
                    placeholder="e.g. BDS Year 2"
                    className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
                </Field>
                <Field icon={<Clock size={14} className="text-white/30" />} label="Duration (minutes)">
                  <input type="number" min={1} value={quiz.duration} onChange={e => handleQuizChange("duration", e.target.value)}
                    placeholder="e.g. 30"
                    className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
                </Field>
              </div>
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] transition-all duration-200">
                <BarChart2 size={14} className={`mt-0.5 flex-shrink-0 ${selectedDifficulty ? selectedDifficulty.color : "text-white/30"}`} />
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-2">Difficulty Level</label>
                  <div className="flex gap-2">
                    {DIFFICULTY_LEVELS.map(level => {
                      const active = quiz.difficulty === level.value;
                      return (
                        <button key={level.value} type="button" onClick={() => handleQuizChange("difficulty", level.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-bold transition-all duration-200
                            ${active ? `${level.badge} border-current` : "text-white/25 border-white/[0.07] hover:text-white/50 hover:border-white/20"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? level.dot : "bg-white/20"}`} />
                          {level.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI PDF Generator */}
          <div className="bg-[#0c0c18] border border-cyan-500/15 rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-cyan-400" />
              <h2 className="text-[14px] font-bold text-white">AI Quiz Generator</h2>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-2">
                  PDF Context
                </label>
                <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] cursor-pointer hover:border-cyan-500/35 hover:bg-cyan-500/[0.03] transition-all">
                  <FileText size={18} className="text-cyan-400" />
                  <span className="text-[13px] text-white/60 truncate">
                    {aiPdf ? aiPdf.name : "Choose PDF to generate quiz"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => setAiPdf(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <Field icon={<CheckCircle2 size={14} className="text-cyan-400/60" />} label="Questions">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={aiQuestionCount}
                    onChange={e => setAiQuestionCount(e.target.value)}
                    className="w-20 bg-transparent text-[14px] text-white outline-none"
                  />
                </Field>

                <button
                  onClick={handleAIGenerateQuiz}
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-500 text-white text-[13px] font-bold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles size={15} />
                  {aiLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-400" />
              <h2 className="text-[14px] font-bold text-white">Questions</h2>
              <span className="text-[11px] font-bold text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">{questions.length}</span>
            </div>

            <AnimatePresence>
              {questions.map((q, index) => (
                <motion.div key={index} variants={fadeUp} initial="hidden" animate="show" exit="exit"
                  className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl overflow-hidden">

                  {/* Question header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[12px] font-bold text-cyan-400">
                        {index + 1}
                      </div>
                      <span className="text-[13px] font-semibold text-white/60 truncate max-w-[200px]">
                        {q.questionText || `Question ${index + 1}`}
                      </span>
                      {q.imageUrl && (
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImagePlus size={9} /> Image
                        </span>
                      )}
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

                  {!collapsed[index] && (
                    <div className="p-5 flex flex-col gap-4">

                      {/* Question text */}
                      <Field icon={<AlignLeft size={14} className="text-white/30" />} label="Question">
                        <textarea rows={2} value={q.questionText}
                          onChange={e => handleQuestionChange(index, "questionText", e.target.value)}
                          placeholder="Type your question here..."
                          className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none" />
                      </Field>

                      {/* Image upload */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                          Question Image <span className="text-white/15 normal-case font-normal">(optional)</span>
                        </label>

                        {q.imagePreview ? (
                          <div className="relative rounded-xl overflow-hidden border border-white/[0.08] group">
                            <img src={q.imagePreview} alt="question"
                              className="w-full max-h-52 object-contain bg-white/[0.02]" />

                            {q.uploading && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
                                <span className="text-[11px] text-white/60">Uploading...</span>
                              </div>
                            )}

                            {q.imageUrl && !q.uploading && (
                              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/25 px-2 py-1 rounded-lg">
                                <CheckCircle2 size={10} /> Uploaded
                              </div>
                            )}

                            {!q.uploading && (
                              <button onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white/60 hover:text-red-400 hover:border-red-400/40 transition-all opacity-0 group-hover:opacity-100">
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => imageRefs.current[index]?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-white/[0.10] text-white/25 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200">
                            <ImagePlus size={22} />
                            <span className="text-[12px] font-semibold">Click to add image</span>
                            <span className="text-[11px] text-white/15">JPG, PNG, WEBP — max 5MB</span>
                          </button>
                        )}

                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                          ref={el => imageRefs.current[index] = el}
                          onChange={e => handleImagePick(index, e.target.files[0])} />
                      </div>

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
                                  ${isCorrect ? "border-cyan-500/40 bg-cyan-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"}`}>
                                <button onClick={() => handleQuestionChange(index, "correctAnswer", i)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                    ${isCorrect ? "border-cyan-400 bg-cyan-400" : "border-white/20 hover:border-cyan-400/50"}`}>
                                  {isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                                </button>
                                <span className={`text-[12px] font-bold flex-shrink-0 w-5 ${isCorrect ? "text-cyan-400" : "text-white/25"}`}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <input value={opt} onChange={e => handleOptionChange(index, i, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                  className={`flex-1 bg-transparent text-[13px] outline-none placeholder:text-white/20 ${isCorrect ? "text-cyan-300" : "text-white/70"}`} />
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
                      <Field icon={<Lightbulb size={14} className="text-amber-400/60" />} label="Explanation (optional)">
                        <textarea rows={2} value={q.explanation}
                          onChange={e => handleQuestionChange(index, "explanation", e.target.value)}
                          placeholder="Explain why the correct answer is right..."
                          className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-none" />
                      </Field>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/[0.10] text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200 mb-6 text-[13px] font-semibold">
            <PlusCircle size={16} /> Add Question
          </button>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[15px] hover:opacity-90 hover:shadow-xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]">
            <Save size={17} />
            {loading ? "Creating Quiz..." : `Create Quiz · ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
          </button>

        </div>
      </div>
    </div>
  );
}

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
