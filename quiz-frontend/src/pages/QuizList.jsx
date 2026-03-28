import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, BookOpen, Clock, Users,
  ChevronDown, Plus, Trash2, Edit2, Eye, X,
  ArrowUpDown, TrendingUp, CheckCircle2, XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { apiRequest } from "../utils/api";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const SORT_OPTIONS = [
  { label: "Newest First",    value: "newest" },
  { label: "Oldest First",   value: "oldest" },
  { label: "Most Attempts",  value: "attempts_desc" },
  { label: "Least Attempts", value: "attempts_asc" },
  { label: "A → Z",          value: "alpha_asc" },
  { label: "Z → A",          value: "alpha_desc" },
];

const DIFF_COLORS = {
  Easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function QuizList() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [quizzes, setQuizzes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [sort, setSort]             = useState("newest");
  const [sortOpen, setSortOpen]     = useState(false);
  const [filterTag, setFilterTag]   = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

const fetchQuizzes = async () => {
  try {
    setLoading(true);

    const data = await apiRequest("/admin/courses");

    // 🔥 Normalize backend data to match UI
    const formatted = data.map((q) => ({
      ...q,
      id: q._id,
      isOpen: q.isOpen ?? true,
      attempts: q.attempts ?? 0,
      totalQuestions: q.totalQuestions ?? 0,
      difficulty: q.difficulty ?? "Medium",
      createdAt: q.createdAt ?? new Date().toISOString(),
    }));

    setQuizzes(formatted);

  } catch (err) {
    console.error(err);
    setError("Could not load quizzes.");
    setQuizzes([]);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/admin/quiz/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(prev => prev.filter(q => q._id !== id && q.id !== id));
      setDeleteId(null);
    } catch {
      alert("Failed to delete quiz");
    }
  };

  const handleToggleStatus = async (quiz) => {
    const id = quiz._id || quiz.id;
    try {
      await fetch(`http://127.0.0.1:8000/admin/quiz/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(prev => prev.map(q =>
        (q._id || q.id) === id ? { ...q, isOpen: !q.isOpen } : q
      ));
    } catch {
      alert("Failed to update status");
    }
  };

  // Filter + sort
  const processed = quizzes
    .filter(q => {
      const matchSearch = q.title?.toLowerCase().includes(search.toLowerCase());
      const matchTag    = filterTag === "All" || q.tag === filterTag;
      const matchDiff   = filterDiff === "All" || q.difficulty === filterDiff;
      const matchStatus = filterStatus === "All" ||
        (filterStatus === "Open" && q.isOpen) ||
        (filterStatus === "Closed" && !q.isOpen);
      return matchSearch && matchTag && matchDiff && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "newest")        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "attempts_desc") return (b.attempts || 0) - (a.attempts || 0);
      if (sort === "attempts_asc")  return (a.attempts || 0) - (b.attempts || 0);
      if (sort === "alpha_asc")     return a.title?.localeCompare(b.title);
      if (sort === "alpha_desc")    return b.title?.localeCompare(a.title);
      return 0;
    });

  const activeFilters = [filterTag, filterDiff, filterStatus].filter(f => f !== "All").length;

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Quizzes</h1>
            <p className="text-sm text-white/35 mt-1">{processed.length} quiz{processed.length !== 1 ? "zes" : ""} found</p>
          </div>
          <button onClick={() => navigate("/create-quiz")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98]">
            <Plus size={16} /> New Quiz
          </button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Search + Sort + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search quizzes by title..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:border-white/[0.12] transition-all whitespace-nowrap">
              <ArrowUpDown size={14} />
              {SORT_OPTIONS.find(s => s.value === sort)?.label}
              <ChevronDown size={13} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#13131f] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-20">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-all hover:bg-white/[0.06]
                      ${sort === opt.value ? "text-cyan-400 font-semibold" : "text-white/60"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all relative whitespace-nowrap
              ${filtersOpen || activeFilters > 0
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                : "bg-[#0c0c18] border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.12]"}`}>
            <SlidersHorizontal size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-5 flex flex-wrap gap-6">
                <FilterGroup label="Tag" options={["All","BDS","MDS"]} value={filterTag} onChange={setFilterTag} />
                <FilterGroup label="Difficulty" options={["All","Easy","Medium","Hard"]} value={filterDiff} onChange={setFilterDiff} />
                <FilterGroup label="Status" options={["All","Open","Closed"]} value={filterStatus} onChange={setFilterStatus} />
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterTag("All"); setFilterDiff("All"); setFilterStatus("All"); }}
                    className="self-end text-[12px] font-semibold text-red-400/70 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-5 animate-pulse">
                <div className="w-3/4 h-4 bg-white/[0.05] rounded mb-3" />
                <div className="w-1/2 h-3 bg-white/[0.05] rounded mb-5" />
                <div className="flex gap-2">
                  <div className="w-12 h-6 bg-white/[0.05] rounded-full" />
                  <div className="w-16 h-6 bg-white/[0.05] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40 font-semibold">No quizzes found</p>
            <p className="text-white/20 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processed.map((quiz) => {
              const id = quiz._id || quiz.id;
              return (
                <motion.div key={id} variants={fadeUp}
                  className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/30 transition-all duration-300 group flex flex-col">

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                      ${quiz.tag === "BDS" ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                      {quiz.tag === "BDS" ? "🦷" : "🔬"}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${quiz.isOpen ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.04] text-white/25 border-white/[0.06]"}`}>
                      {quiz.isOpen ? "● Open" : "○ Closed"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-[14px] leading-snug mb-1">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-[12px] text-white/35 mb-3 line-clamp-2 leading-relaxed">{quiz.description}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${quiz.tag === "BDS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                      {quiz.tag}
                    </span>
                    {quiz.difficulty && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${DIFF_COLORS[quiz.difficulty] || DIFF_COLORS.Medium}`}>
                        {quiz.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-[11px] text-white/30 mb-5">
                    <span className="flex items-center gap-1"><Clock size={10} /> {quiz.duration || "—"}m</span>
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {quiz.totalQuestions || 0} Qs</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {quiz.attempts || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleToggleStatus(quiz)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold border transition-all
                        ${quiz.isOpen
                          ? "border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                          : "border-emerald-500/20 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"}`}>
                      {quiz.isOpen ? <><XCircle size={13} /> Close</> : <><CheckCircle2 size={13} /> Open</>}
                    </button>
                    <button onClick={() => navigate(`/edit-quiz/${id}`)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Delete confirm modal */}
        <AnimatePresence>
          {deleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setDeleteId(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#13131f] border border-white/[0.08] rounded-3xl p-7 w-full max-w-sm shadow-2xl">
                <div className="text-4xl mb-4">🗑️</div>
                <h3 className="text-lg font-bold text-white mb-2">Delete Quiz?</h3>
                <p className="text-sm text-white/40 mb-6 leading-relaxed">This will permanently delete the quiz and all its questions. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex gap-1.5">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all
              ${value === opt
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:border-white/[0.12]"}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
