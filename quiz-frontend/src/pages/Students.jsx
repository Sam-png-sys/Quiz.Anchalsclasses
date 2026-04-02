import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, X, ToggleLeft, ToggleRight,
  ChevronDown, TrendingUp, CheckCircle2, XCircle,
  Clock, BookOpen, ArrowUpDown, ArrowLeft, Eye, Mail, Phone,
  SlidersHorizontal, Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { apiRequest } from "../utils/api";

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
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, avgScore: 0 });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/admin/students");

      // 🔥 Normalize data
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
      await fetch(`http://127.0.0.1:8000/admin/students/${id}/access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !current }),
      });
      setStudents(prev => prev.map(s => (s._id || s.id) === id ? { ...s, isActive: !current } : s));
    } catch { alert("Failed to update access"); }
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

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />
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

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white text-sm font-semibold transition-all">
            <Download size={15} /> Export
          </button>

        </div>

        {error && <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">⚠️ {error}</div>}

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
            <div className="text-5xl mb-4">👥</div>
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
              {processed.map((student, i) => {
                const id = student._id || student.id;
                return (
                  <motion.div key={id} variants={fadeUp}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors group">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/10 flex items-center justify-center text-sm font-bold text-cyan-400 flex-shrink-0">
                      {student.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{student.name || "Unknown"}</p>
                      <p className="text-[11px] text-white/30 truncate mt-0.5">{student.email || student.phone || "—"}</p>
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
                    <button onClick={() => toggleAccess(id, student.isActive)}
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
              ${value === opt ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:border-white/[0.12]"}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
