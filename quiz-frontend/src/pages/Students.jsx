import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, X, ToggleLeft, ToggleRight,
  ChevronDown, TrendingUp, CheckCircle2, XCircle,
  ArrowUpDown, ArrowLeft, Mail, Phone,
  SlidersHorizontal, Download, Shield, BookOpen, Check, Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { API_BASE } from "../utils/config";
import AdminShell from "../components/AdminShell";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Score", value: "score_desc" },
  { label: "Lowest Score", value: "score_asc" },
  { label: "A → Z", value: "alpha_asc" },
  { label: "Most Attempts", value: "attempts_desc" },
];

export default function Students() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, avgScore: 0 });

  // Course & Quiz Access states
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [allowedCourses, setAllowedCourses] = useState([]);
  const [allowedQuizzes, setAllowedQuizzes] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionSuccess, setPermissionSuccess] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchCoursesAndQuizzes();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      setAllowedCourses(selectedStudent.allowedCourses || []);
      setAllowedQuizzes(selectedStudent.allowedQuizzes || []);
      setCourseSearch("");
      setQuizSearch("");
      setPermissionError("");
      setPermissionSuccess(false);
    }
  }, [selectedStudent]);

  const fetchCoursesAndQuizzes = async () => {
    try {
      const coursesData = await apiRequest("/admin/course-catalog");
      setCourses(coursesData || []);
      const quizzesData = await apiRequest("/admin/courses");
      setQuizzes(quizzesData || []);
    } catch (err) {
      console.error("Failed to load courses or quizzes:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/students");

      // Normalize data
      const list = data.map((s) => ({
        ...s,
        isActive: s.isActive ?? true,
        avgScore: s.avgScore ?? 0,
        totalAttempts: s.totalAttempts ?? 0,
        branch: s.branch ?? "BDS",
      }));

      setStudents(list);

      setStats({
        total: list.length,
        active: list.filter(s => s.isActive).length,
        inactive: list.filter(s => !s.isActive).length,
        avgScore: list.length
          ? Math.round(list.reduce((a, s) => a + s.avgScore, 0) / list.length)
          : 0,
      });

    } catch (err) {
      setError("Could not load students.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (id, current) => {
    try {
      await fetch(`${API_BASE}/admin/students/${id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current }),
      });
      setStudents(prev => prev.map(s => (s._id || s.id) === id ? { ...s, isActive: !current } : s));
    } catch { alert("Failed to update access"); }
  };

  const savePermissions = async () => {
    setSavingPermissions(true);
    setPermissionError("");
    setPermissionSuccess(false);
    try {
      const id = selectedStudent._id || selectedStudent.id;
      await apiRequest(`/admin/students/${id}/permissions`, "PUT", {
        allowedCourses,
        allowedQuizzes,
      });
      // Update local list
      setStudents(prev =>
        prev.map(s =>
          (s._id || s.id) === id
            ? { ...s, allowedCourses, allowedQuizzes }
            : s
        )
      );
      setPermissionSuccess(true);
      setTimeout(() => {
        setSelectedStudent(null);
      }, 1500);
    } catch (err) {
      setPermissionError(err.message || "Failed to save permissions");
    } finally {
      setSavingPermissions(false);
    }
  };

  const toggleCoursePermission = (courseTitle) => {
    setAllowedCourses(prev =>
      prev.includes(courseTitle)
        ? prev.filter(c => c !== courseTitle)
        : [...prev, courseTitle]
    );
  };

  const toggleQuizPermission = (quizId) => {
    setAllowedQuizzes(prev =>
      prev.includes(quizId)
        ? prev.filter(q => q !== quizId)
        : [...prev, quizId]
    );
  };

  const exportStudents = async () => {
    try {
      setExporting(true);
      const data = await apiRequest("/admin/students/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `students-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export students");
    } finally {
      setExporting(false);
    }
  };

  // Filter + sort
  const processed = students
    .filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search);
      const matchStatus = filterStatus === "All" ||
        (filterStatus === "Active" && s.isActive) ||
        (filterStatus === "Inactive" && !s.isActive);
      const matchTag = filterTag === "All" || s.branch === filterTag;
      return matchSearch && matchStatus && matchTag;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "score_desc") return (b.avgScore || 0) - (a.avgScore || 0);
      if (sort === "score_asc") return (a.avgScore || 0) - (b.avgScore || 0);
      if (sort === "alpha_asc") return a.name?.localeCompare(b.name);
      if (sort === "attempts_desc") return (b.totalAttempts || 0) - (a.totalAttempts || 0);
      return 0;
    });

  const activeFilters = [filterStatus, filterTag].filter(f => f !== "All").length;

  // Search filtered courses & quizzes for modal editor
  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(quizSearch.toLowerCase())
  );

  return (
    <AdminShell>
      <main className="max-w-6xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Students</h1>
              <p className="text-sm text-white/35 mt-1">
                {processed.length} of {stats.total} students
              </p>
            </div>
          </div>

          <button
            onClick={exportStudents}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all"
          >
            <Download size={15} /> {exporting ? "Exporting..." : "Export"}
          </button>

        </div>

        {error && <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Inactive", value: stats.inactive, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Avg Score", value: stats.avgScore + "%", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <p className={`text-lg font-bold ${color}`}>{loading ? "—" : value}</p>
                <p className="text-[11px] text-white/30">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Sort + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-all" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:border-white/[0.12] transition-all whitespace-nowrap">
              <ArrowUpDown size={14} />
              {SORT_OPTIONS.find(s => s.value === sort)?.label}
              <ChevronDown size={13} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#13131f] border border-white/[0.08] rounded-2xl shadow-2xl z-20 overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] hover:bg-white/[0.06] transition-all ${sort === opt.value ? "text-cyan-400 font-semibold" : "text-white/60"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all relative whitespace-nowrap
              ${filtersOpen || activeFilters > 0 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-[#0c0c18] border-white/[0.06] text-white/60 hover:text-white"}`}>
            <SlidersHorizontal size={14} /> Filters
            {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">{activeFilters}</span>}
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-5 flex flex-wrap gap-6">
                <FilterGroup label="Status" options={["All", "Active", "Inactive"]} value={filterStatus} onChange={setFilterStatus} />
                <FilterGroup label="Branch" options={["All", "BDS", "MDS"]} value={filterTag} onChange={setFilterTag} />
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterStatus("All"); setFilterTag("All"); }}
                    className="self-end text-[12px] font-semibold text-red-400/70 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {loading ? (
          <div className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex-shrink-0" />
                <div className="flex-1"><div className="w-32 h-3.5 bg-white/[0.05] rounded mb-1.5" /><div className="w-48 h-3 bg-white/[0.05] rounded" /></div>
                <div className="w-16 h-6 bg-white/[0.05] rounded-full" />
                <div className="w-12 h-8 bg-white/[0.05] rounded-lg" />
              </div>
            ))}
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4">No Students</div>
            <p className="text-white/40 font-semibold">No students found</p>
            <p className="text-white/20 text-sm mt-1">Try adjusting search or filters</p>
          </div>
        ) : (
          <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
              {["", "Student", "Branch", "Avg Score", "Attempts", "Access"].map(h => (
                <span key={h} className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show">
              {processed.map((student) => {
                const id = student._id || student.id;
                return (
                  <motion.div key={id} variants={fadeUp}
                    onClick={() => setSelectedStudent(student)}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group cursor-pointer">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/10 flex items-center justify-center text-sm font-bold text-cyan-400 flex-shrink-0">
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">{student.name || "Unknown"}</p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{student.email || student.phone || "—"}</p>
                    </div>

                    {/* Branch */}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${student.branch === "BDS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                      {student.branch || "—"}
                    </span>

                    {/* Score */}
                    <span className={`text-[13px] font-bold ${(student.avgScore || 0) >= 70 ? "text-emerald-400" : (student.avgScore || 0) >= 50 ? "text-amber-400" : "text-red-400"}`}>
                      {student.avgScore != null ? student.avgScore + "%" : "—"}
                    </span>

                    {/* Attempts */}
                    <span className="text-[13px] font-semibold text-white/40">
                      {student.totalAttempts || 0}
                    </span>

                    {/* Toggle */}
                    <button onClick={(e) => { e.stopPropagation(); toggleAccess(id, student.isActive); }}
                      className={`transition-colors ${student.isActive ? "text-emerald-400 hover:text-emerald-300" : "text-white/20 hover:text-white/40"}`}>
                      {student.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}
      </main>

      {/* Permissions Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl h-[85vh] max-h-[750px] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              style={{ background: "var(--app-surface-alt)" }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Student Permissions</h3>
                    <p className="text-xs text-white/40 mt-0.5">Manage which courses and quizzes {selectedStudent.name} can access</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                {/* Courses Panel */}
                <div className="flex flex-col h-full min-h-0 border border-white/[0.06] bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Allowed Courses</span>
                    </div>
                    <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold px-2 py-0.5 rounded-full">
                      {allowedCourses.length} selected
                    </span>
                  </div>

                  {/* Course Search */}
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-500/30 transition-all"
                    />
                    {courseSearch && (
                      <button onClick={() => setCourseSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Course List */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 min-h-[200px]">
                    {filteredCourses.length === 0 ? (
                      <div className="text-center py-8 text-white/20 text-xs">No courses found</div>
                    ) : (
                      filteredCourses.map(course => {
                        const checked = allowedCourses.includes(course.title);
                        return (
                          <button
                            key={course._id || course.id}
                            onClick={() => toggleCoursePermission(course.title)}
                            className="flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs"
                            style={checked
                              ? { background: "var(--accent-soft)", borderColor: "var(--accent-border)", color: "var(--accent)" }
                              : { background: "white/[0.02]", borderColor: "white/[0.04]", color: "white/60" }
                            }
                          >
                            <div>
                              <span className="font-semibold text-white">{course.title}</span>
                              <span className="text-[10px] text-white/30 block mt-0.5">{course.tag || "BDS"} &bull; {course.subjects?.length || 0} subjects</span>
                            </div>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${checked ? "bg-cyan-500 border-cyan-400" : "border-white/10"}`}>
                              {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quizzes Panel */}
                <div className="flex flex-col h-full min-h-0 border border-white/[0.06] bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">Allowed Quizzes</span>
                    </div>
                    <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold px-2 py-0.5 rounded-full">
                      {allowedQuizzes.length} selected
                    </span>
                  </div>

                  {/* Quiz Search */}
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      value={quizSearch}
                      onChange={e => setQuizSearch(e.target.value)}
                      placeholder="Search quizzes..."
                      className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder:text-white/20 outline-none focus:border-cyan-500/30 transition-all"
                    />
                    {quizSearch && (
                      <button onClick={() => setQuizSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Quiz List */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 min-h-[200px]">
                    {filteredQuizzes.length === 0 ? (
                      <div className="text-center py-8 text-white/20 text-xs">No quizzes found</div>
                    ) : (
                      filteredQuizzes.map(quiz => {
                        const id = quiz._id || quiz.id;
                        const checked = allowedQuizzes.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => toggleQuizPermission(id)}
                            className="flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs"
                            style={checked
                              ? { background: "var(--accent-soft)", borderColor: "var(--accent-border)", color: "var(--accent)" }
                              : { background: "white/[0.02]", borderColor: "white/[0.04]", color: "white/60" }
                            }
                          >
                            <div className="min-w-0 pr-4">
                              <span className="font-semibold text-white block truncate">{quiz.title}</span>
                              <span className="text-[10px] text-white/30 block mt-0.5">{quiz.course || "General"} &bull; {quiz.totalQuestions || 0} Questions</span>
                            </div>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${checked ? "bg-cyan-500 border-cyan-400" : "border-white/10"}`}>
                              {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {permissionError && (
                <div className="mx-6 mb-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <X size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-[12px] text-red-400">{permissionError}</p>
                </div>
              )}

              {permissionSuccess && (
                <div className="mx-6 mb-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <p className="text-[12px] text-emerald-400">Permissions updated successfully!</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                <p className="text-[10px] text-white/30 max-w-[50%]">
                  Restricting a student will hide all other courses/quizzes from their app home feed. Leaving selections empty grants access to all public quizzes.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    disabled={savingPermissions}
                    className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-50 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePermissions}
                    disabled={savingPermissions}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white disabled:opacity-50 text-xs font-bold shadow-lg shadow-cyan-500/10 transition-all animate-pulse-subtle"
                  >
                    {savingPermissions ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={13} /> Save Permissions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
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
              ${value === opt ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:border-white/[0.12]"}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
