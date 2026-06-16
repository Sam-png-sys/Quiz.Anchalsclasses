import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, BookOpen, Clock, AlignLeft,
  Lightbulb, Save, ArrowLeft, GraduationCap, BarChart2,
  ImagePlus, X, FileText, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/config";
import AdminShell from "../components/AdminShell";

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

const EXAM_TYPES = [
  { value: "no_section_no_timer", label: "No Section No Timer" },
  { value: "section_no_timer", label: "Section with No Timer" },
  { value: "section_with_timer", label: "Section with Timer" },
];

const MotionDiv = motion.div;
const emptyQuiz = () => ({
  title: "",
  description: "",
  duration: "",
  course: "",
  subject: "",
  subSubject: "",
  difficulty: "",
  examType: "no_section_no_timer",
  requireAnswer: true,
  sections: [],
  studyMaterialUrl: "",
  studyMaterialName: "",
});
const MAX_AI_PDF_SIZE = 50 * 1024 * 1024;

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

function newSection(index = 0) {
  return {
    title: `Section ${index + 1}`,
    questionCount: "",
    durationMinutes: "",
  };
}

export default function CreateQuiz() {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const imageRefs = useRef([]);
  const panelStyle = {
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    boxShadow: "0 18px 36px var(--app-shadow)",
  };

  const [quiz, setQuiz] = useState(emptyQuiz());
  const [questions, setQuestions] = useState([newQuestion()]);
  const [loading, setLoading]     = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPdf, setAiPdf] = useState(null);
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [collapsed, setCollapsed] = useState({});
  const [studyMaterialUploading, setStudyMaterialUploading] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleQuizChange = (field, value) =>
    setQuiz(prev => ({ ...prev, [field]: value }));

  const updateSections = (sections) =>
    setQuiz(prev => ({ ...prev, sections }));

  const handleSectionChange = (index, field, value) =>
    updateSections(
      quiz.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section
      )
    );

  const addSection = () => updateSections([...(quiz.sections || []), newSection(quiz.sections?.length || 0)]);

  const removeSection = (index) => {
    updateSections(
      quiz.sections
        .filter((_, sectionIndex) => sectionIndex !== index)
        .map((section, sectionIndex) => ({
          ...section,
          title: section.title || `Section ${sectionIndex + 1}`,
        }))
    );
  };

  const usesSections = quiz.examType !== "no_section_no_timer";
  const sectionQuestionTotal = (quiz.sections || []).reduce(
    (total, section) => total + (Number(section.questionCount) || 0),
    0
  );
  const computedDuration = quiz.examType === "section_with_timer"
    ? (quiz.sections || []).reduce((total, section) => total + (Number(section.durationMinutes) || 0), 0)
    : Number(quiz.duration) || 0;

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
  const uploadQuestionImage = async (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateQuestion(index, { imagePreview: e.target.result, uploading: true });
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/admin/upload-question-image`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`Upload failed: ${res.status} ${text}`);

      const data = JSON.parse(text);
      updateQuestion(index, { imageUrl: data.url, uploading: false });

    } catch (err) {
      console.error("Image upload error:", err.message);
      alert(`Image upload failed: ${err.message}`);
      updateQuestion(index, { imageUrl: null, imagePreview: null, uploading: false });
    }
  };

  const handleImagePick = async (index, file) => {
    await uploadQuestionImage(index, file);
  };

  const handleImagePaste = async (index, event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const imageItem = Array.from(items).find((item) => item.type?.startsWith("image/"));
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();
    await uploadQuestionImage(index, file);
  };

  const handleStudyMaterialPick = async (file) => {
    if (!file) return;

    try {
      setStudyMaterialUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/admin/upload-study-material`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Study material upload failed");

      setQuiz((prev) => ({
        ...prev,
        studyMaterialUrl: data.url,
        studyMaterialName: data.name,
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Study material upload failed");
    } finally {
      setStudyMaterialUploading(false);
    }
  };

  const handleAIPdfPick = (file) => {
    if (!file) {
      setAiPdf(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please choose a PDF file");
      return;
    }
    if (file.size > MAX_AI_PDF_SIZE) {
      alert("PDF must be 50MB or smaller");
      return;
    }
    setAiPdf(file);
  };

  const removeImage = (index) =>
    updateQuestion(index, { imageUrl: null, imagePreview: null });

  // ── AI Generate ───────────────────────────────────────────────────────────
  const handleAIGenerateQuiz = async () => {
    if (!aiPdf) { alert("Please select a PDF first"); return; }
    if (!quiz.title.trim()) { alert("Quiz title is required"); return; }
    if (!quiz.course.trim()) { alert("Course name is required"); return; }
    if (!quiz.subject.trim()) { alert("Subject is required"); return; }
    if (!quiz.difficulty) { alert("Please select a difficulty level"); return; }
    if (quiz.examType === "no_section_no_timer" && !quiz.duration) { alert("Duration is required"); return; }
    if (usesSections && (!quiz.sections?.length || quiz.sections.some(section => !section.questionCount || !section.title.trim()))) {
      alert("Please complete all section details");
      return;
    }
    if (quiz.examType === "section_with_timer" && quiz.sections.some(section => !section.durationMinutes)) {
      alert("Each section needs a timer duration");
      return;
    }
    if (usesSections && sectionQuestionTotal !== Number(aiQuestionCount)) {
      alert(`Section question count must match AI question count (${aiQuestionCount})`);
      return;
    }

    try {
      setAiLoading(true);
      const formData = new FormData();
      formData.append("file", aiPdf);
      formData.append("title", quiz.title);
      formData.append("description", quiz.description);
      formData.append("course", quiz.course);
      formData.append("subject", quiz.subject);
      formData.append("subSubject", quiz.subSubject || "");
      formData.append("difficulty", quiz.difficulty);
      formData.append("duration", computedDuration);
      formData.append("questionCount", Number(aiQuestionCount));
      formData.append("examType", quiz.examType);
      formData.append("requireAnswer", quiz.requireAnswer ? "true" : "false");
      formData.append("sections", JSON.stringify((quiz.sections || []).map(section => ({
        title: section.title.trim(),
        questionCount: Number(section.questionCount) || 0,
        durationMinutes: section.durationMinutes ? Number(section.durationMinutes) : null,
      }))));
      formData.append("studyMaterialUrl", quiz.studyMaterialUrl || "");
      formData.append("studyMaterialName", quiz.studyMaterialName || aiPdf.name);

      const res = await fetch(`${API_BASE}/ai/admin/generate-quiz`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { detail: raw || "AI quiz generation failed" };
      }
      if (!res.ok) throw new Error(data.detail || "AI quiz generation failed");

      alert(`AI created quiz with ${data.totalQuestions} questions`);
      setAiPdf(null);
      setQuiz(emptyQuiz());
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
    if (!quiz.title.trim()) { alert("Title is required"); return false; }
    if (!quiz.course.trim())  { alert("Course name is required"); return false; }
    if (!quiz.subject.trim()) { alert("Subject is required"); return false; }
    if (!quiz.difficulty)     { alert("Please select a difficulty level"); return false; }
    if (quiz.examType === "no_section_no_timer" && !quiz.duration) { alert("Duration is required"); return false; }
    if (studyMaterialUploading) { alert("Please wait for the study material upload to finish"); return false; }
    if (usesSections) {
      if (!quiz.sections.length) { alert("Add at least one section"); return false; }
      if (quiz.sections.some(section => !section.title.trim() || Number(section.questionCount) < 1)) {
        alert("Each section needs a title and question count");
        return false;
      }
      if (quiz.examType === "section_with_timer" && quiz.sections.some(section => Number(section.durationMinutes) < 1)) {
        alert("Each timed section needs a duration");
        return false;
      }
      if (sectionQuestionTotal !== questions.length) {
        alert(`Section question count must match total questions (${questions.length})`);
        return false;
      }
    }
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
          duration:       computedDuration,
          totalQuestions: questions.length,
          course:         quiz.course,
          subject:        quiz.subject,
          subSubject:     quiz.subSubject || "",
          difficulty:     quiz.difficulty,
          examType:       quiz.examType,
          requireAnswer:  quiz.requireAnswer,
          sections:       (quiz.sections || []).map(section => ({
            title: section.title.trim(),
            questionCount: Number(section.questionCount) || 0,
            durationMinutes: section.durationMinutes ? Number(section.durationMinutes) : null,
          })),
          studyMaterialUrl: quiz.studyMaterialUrl || null,
          studyMaterialName: quiz.studyMaterialName || null,
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
            correct_answer: q.options[q.correctAnswer],
            explanation:    q.explanation,
            imageUrl:       q.imageUrl || null,
          }),
        });
        if (!qRes.ok) {
          const err = await qRes.json();
          console.error("Question add failed:", err);
        }
      }

      alert("Quiz created successfully.");
      setQuiz(emptyQuiz());
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
    <AdminShell contentRef={scrollRef}>
      <div className="max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>Create Quiz</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--app-text-subtle)" }}>Build a new quiz for your students</p>
          </div>
        </div>

        {/* Quiz Details */}
        <div className="rounded-2xl p-6 mb-5" style={panelStyle}>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--app-text)" }}>Quiz Details</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field icon={<GraduationCap size={14} className="text-cyan-400/60" />} label="Course">
                <input value={quiz.course} onChange={e => handleQuizChange("course", e.target.value)}
                  placeholder="e.g. BDS Year 2"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
              </Field>
              <Field icon={<BookOpen size={14} className="text-emerald-400/60" />} label="Subject">
                <input value={quiz.subject} onChange={e => handleQuizChange("subject", e.target.value)}
                  placeholder="e.g. Oral Anatomy"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
              </Field>
              <Field icon={<BookOpen size={14} className="text-purple-400/60" />} label="Sub-subject">
                <input value={quiz.subSubject || ""} onChange={e => handleQuizChange("subSubject", e.target.value)}
                  placeholder="e.g. Teeth"
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none" />
              </Field>
              <Field icon={<Clock size={14} className="text-white/30" />} label="Duration (minutes)">
                <input
                  type="number"
                  min={quiz.examType === "no_section_no_timer" ? 1 : 0}
                  value={quiz.duration}
                  onChange={e => handleQuizChange("duration", e.target.value)}
                  placeholder={quiz.examType === "no_section_no_timer" ? "e.g. 30" : "Auto from sections"}
                  disabled={usesSections}
                  className="w-full bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none disabled:opacity-50"
                />
              </Field>
            </div>

            <Field icon={<Clock size={14} className="text-white/30" />} label="Exam Type">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {EXAM_TYPES.map((type) => {
                  const active = quiz.examType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleQuizChange("examType", type.value)}
                      className="px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all"
                      style={active
                        ? { color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-border)" }
                        : { color: "var(--app-text-subtle)", background: "var(--app-input)", borderColor: "var(--app-border)" }}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="rounded-xl px-4 py-3.5" style={{ background: "var(--app-input)", border: "1px solid var(--app-border)" }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-subtle)" }}>Answer Required</p>
                  <p className="text-[12px] mt-1" style={{ color: "var(--app-text-muted)" }}>
                    When turned off, students can move to the next question without selecting an option.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuizChange("requireAnswer", !quiz.requireAnswer)}
                  className="px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all"
                  style={quiz.requireAnswer
                    ? { color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-border)" }
                    : { color: "var(--app-text-subtle)", background: "var(--app-surface)", borderColor: "var(--app-border)" }}
                >
                  {quiz.requireAnswer ? "Required" : "Optional"}
                </button>
              </div>
            </div>

            {usesSections && (
              <div className="rounded-xl px-4 py-4 flex flex-col gap-3" style={{ background: "var(--app-input)", border: "1px solid var(--app-border)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-text-subtle)" }}>Sections</p>
                    <p className="text-[12px] mt-1" style={{ color: "var(--app-text-muted)" }}>
                      Divide the quiz into blocks like 80 questions in 60 minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all"
                    style={{ color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-border)" }}
                  >
                    Add Section
                  </button>
                </div>

                {(quiz.sections || []).map((section, index) => (
                  <div key={`${section.title}-${index}`} className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr,auto] gap-2 items-center">
                    <input
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                      placeholder={`Section ${index + 1}`}
                      className="px-3 py-2 rounded-xl bg-transparent text-[13px] outline-none"
                      style={{ color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    />
                    <input
                      type="number"
                      min={1}
                      value={section.questionCount}
                      onChange={(e) => handleSectionChange(index, "questionCount", e.target.value)}
                      placeholder="Questions"
                      className="px-3 py-2 rounded-xl bg-transparent text-[13px] outline-none"
                      style={{ color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    />
                    <input
                      type="number"
                      min={1}
                      disabled={quiz.examType !== "section_with_timer"}
                      value={section.durationMinutes}
                      onChange={(e) => handleSectionChange(index, "durationMinutes", e.target.value)}
                      placeholder={quiz.examType === "section_with_timer" ? "Minutes" : "No timer"}
                      className="px-3 py-2 rounded-xl bg-transparent text-[13px] outline-none disabled:opacity-50"
                      style={{ color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center"
                      style={{ color: "#f87171", borderColor: "rgba(248,113,113,0.28)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <div className="flex flex-wrap gap-4 text-[12px]" style={{ color: "var(--app-text-subtle)" }}>
                  <span>Total section questions: <strong style={{ color: "var(--app-text)" }}>{sectionQuestionTotal}</strong></span>
                  <span>Current quiz questions: <strong style={{ color: "var(--app-text)" }}>{questions.length}</strong></span>
                  {quiz.examType === "section_with_timer" && (
                    <span>Total timed duration: <strong style={{ color: "var(--app-text)" }}>{computedDuration} min</strong></span>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: "var(--app-text-subtle)" }}>
                Study Material (PDF)
              </label>
              <label
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed cursor-pointer transition-all"
                style={{ background: "var(--app-input)", borderColor: "var(--app-border-strong)" }}
              >
                <FileText size={18} style={{ color: "var(--accent)" }} />
                <span className="text-[13px] truncate flex-1" style={{ color: "var(--app-text-muted)" }}>
                  {studyMaterialUploading
                    ? "Uploading PDF..."
                    : quiz.studyMaterialName || "Upload study material PDF"}
                </span>
                {quiz.studyMaterialUrl && !studyMaterialUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuiz((prev) => ({ ...prev, studyMaterialUrl: "", studyMaterialName: "" }));
                    }}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg border"
                    style={{ color: "var(--app-text-subtle)", borderColor: "var(--app-border)" }}
                  >
                    Remove
                  </button>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleStudyMaterialPick(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-[11px]" style={{ color: "var(--app-text-ghost)" }}>
                Students can use this PDF as supporting study material.
              </p>
            </div>

            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200" style={{ background: "var(--app-input)", border: "1px solid var(--app-border)" }}>
              <BarChart2 size={14} className={`mt-0.5 flex-shrink-0 ${selectedDifficulty ? selectedDifficulty.color : "text-white/30"}`} />
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: "var(--app-text-subtle)" }}>Difficulty Level</label>
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
        <div className="rounded-2xl p-6 mb-5" style={{ ...panelStyle, border: "1px solid var(--accent-border)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--app-text)" }}>AI Quiz Generator</h2>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-2">
                PDF Context
              </label>
              <label className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed cursor-pointer transition-all" style={{ background: "var(--app-input)", borderColor: "var(--app-border-strong)" }}>
                <FileText size={18} style={{ color: "var(--accent)" }} />
                <span className="text-[13px] truncate" style={{ color: "var(--app-text-muted)" }}>
                  {aiPdf ? aiPdf.name : "Choose PDF to generate quiz"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => handleAIPdfPick(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <Field icon={<CheckCircle2 size={14} className="text-cyan-400/60" />} label="Questions">
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={aiQuestionCount}
                  onChange={e => setAiQuestionCount(e.target.value)}
                  className="w-20 bg-transparent text-[14px] text-white outline-none"
                />
              </Field>

              <button
                onClick={handleAIGenerateQuiz}
                disabled={aiLoading}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white text-[13px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 18px 30px var(--accent-glow)" }}
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
            <CheckCircle2 size={15} style={{ color: "var(--accent)" }} />
            <h2 className="text-[14px] font-bold" style={{ color: "var(--app-text)" }}>Questions</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--app-text-subtle)", background: "var(--app-input)" }}>{questions.length}</span>
          </div>

          <AnimatePresence>
            {questions.map((q, index) => (
              <MotionDiv key={index} variants={fadeUp} initial="hidden" animate="show" exit="exit"
                className="rounded-2xl overflow-hidden" style={panelStyle}>

                {/* Question header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[12px] font-bold" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
                      {index + 1}
                    </div>
                    <span className="text-[13px] font-semibold truncate max-w-[320px]" style={{ color: "var(--app-text-muted)" }}>
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
                  <div className="p-6 flex flex-col gap-5">

                    {/* Question text */}
                    <Field icon={<AlignLeft size={14} className="text-white/30" />} label="Question">
                      <textarea rows={4} value={q.questionText}
                        onChange={e => handleQuestionChange(index, "questionText", e.target.value)}
                        placeholder="Type your question here..."
                        className="w-full min-h-[120px] bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none resize-y" />
                    </Field>

                    {/* Image upload */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                        Question Image <span className="text-white/15 normal-case font-normal">(optional)</span>
                      </label>

                      {q.imagePreview ? (
                        <div
                          className="relative rounded-xl overflow-hidden border border-white/[0.08] group"
                          onPaste={(e) => handleImagePaste(index, e)}
                          tabIndex={0}
                        >
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
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => imageRefs.current[index]?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              imageRefs.current[index]?.click();
                            }
                          }}
                          onPaste={(e) => handleImagePaste(index, e)}
                          className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2"
                          style={{ borderColor: "var(--app-border-strong)", color: "var(--app-text-subtle)", background: "var(--app-input)" }}>
                          <ImagePlus size={22} />
                          <span className="text-[12px] font-semibold">Click or paste image</span>
                          <span className="text-[11px]" style={{ color: "var(--app-text-ghost)" }}>JPG, PNG, WEBP — max 5MB</span>
                          <span className="text-[11px]" style={{ color: "var(--app-text-ghost)" }}>Click this box, then press Ctrl+V to paste</span>
                        </div>
                      )}

                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        ref={el => imageRefs.current[index] = el}
                        onChange={e => handleImagePick(index, e.target.files[0])} />
                    </div>

                    {/* Options */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest mb-3 block" style={{ color: "var(--app-text-subtle)" }}>
                        Options — click radio to mark correct answer
                      </label>
                      <div className="flex flex-col gap-2">
                        {q.options.map((opt, i) => {
                          const isCorrect = q.correctAnswer === i;
                          return (
                            <div key={i}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
                              style={isCorrect
                                ? { borderColor: "var(--accent-border)", background: "var(--accent-soft)" }
                                : { borderColor: "var(--app-border)", background: "var(--app-input)" }}>
                              <button onClick={() => handleQuestionChange(index, "correctAnswer", i)}
                                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                style={isCorrect ? { borderColor: "var(--accent)", background: "var(--accent)" } : { borderColor: "var(--app-text-ghost)" }}>
                                {isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                              </button>
                              <span className="text-[12px] font-bold flex-shrink-0 w-5" style={{ color: isCorrect ? "var(--accent)" : "var(--app-text-subtle)" }}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <input value={opt} onChange={e => handleOptionChange(index, i, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                className="flex-1 bg-transparent text-[13px] outline-none"
                                style={{ color: isCorrect ? "var(--accent-strong)" : "var(--app-text)" }} />
                              {isCorrect && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-border)" }}>
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
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>

        <button onClick={addQuestion}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed transition-all duration-200 mb-6 text-[13px] font-semibold"
          style={{ borderColor: "var(--app-border-strong)", color: "var(--app-text-subtle)", background: "var(--app-input)" }}>
          <PlusCircle size={16} /> Add Question
        </button>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 22px 38px var(--accent-glow)" }}>
          <Save size={17} />
          {loading ? "Creating Quiz..." : `Create Quiz · ${questions.length} Question${questions.length !== 1 ? "s" : ""}`}
        </button>

      </div>
    </AdminShell>
  );
}

function Field({ icon, label, children }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
      style={{ background: "var(--app-input)", border: "1px solid var(--app-border)" }}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "var(--app-text-subtle)" }}>{label}</label>
        {children}
      </div>
    </div>
  );
}
