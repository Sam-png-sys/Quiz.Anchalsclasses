import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, BookOpen, Clock, Users,
  ChevronRight, Trash2, Edit2, X, Save, Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const COURSE_COLORS = [
  { from: "from-cyan-500",   to: "to-blue-600",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400" },
  { from: "from-purple-500", to: "to-pink-600",   bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  { from: "from-amber-500",  to: "to-orange-600", bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400" },
  { from: "from-green-500",  to: "to-emerald-600",bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400" },
];

const EMPTY_FORM = { title: "", description: "", tag: "BDS", duration: "", totalQuizzes: "" };

export default function Courses() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { navigate("/login"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data.courses || data || []);
    } catch {
      setError("Could not load courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = (c)  => { setEditing(c._id || c.id); setForm({ title: c.title, description: c.description, tag: c.tag, duration: c.duration, totalQuizzes: c.totalQuizzes }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { alert("Title required"); return; }
    setSaving(true);
    try {
      const url    = editing ? `http://127.0.0.1:8000/admin/course/${editing}` : "http://127.0.0.1:8000/admin/course";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchCourses();
      setModalOpen(false);
    } catch {
      alert("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/admin/course/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(prev => prev.filter(c => (c._id || c.id) !== id));
      setDeleteId(null);
    } catch { alert("Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Courses</h1>
            <p className="text-sm text-white/35 mt-1">Manage your course catalog</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98]">
            <Plus size={16} /> Add Course
          </button>
        </div>

        {error && <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">⚠️ {error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-white/[0.05] rounded-2xl mb-4" />
                <div className="w-3/4 h-4 bg-white/[0.05] rounded mb-2" />
                <div className="w-full h-3 bg-white/[0.05] rounded mb-1" />
                <div className="w-2/3 h-3 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center text-4xl mx-auto mb-4">🎓</div>
            <p className="text-white/40 font-semibold text-lg">No courses yet</p>
            <p className="text-white/20 text-sm mt-1 mb-6">Create your first course to get started</p>
            <button onClick={openCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
              Create Course
            </button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, idx) => {
              const id    = course._id || course.id;
              const color = COURSE_COLORS[idx % COURSE_COLORS.length];
              return (
                <motion.div key={id} variants={fadeUp}
                  className="bg-[#0c0c18] border border-white/[0.06] rounded-3xl overflow-hidden hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40 transition-all duration-300 group">

                  {/* Top gradient */}
                  <div className={`h-24 bg-gradient-to-br ${color.from} ${color.to} opacity-10 relative`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 text-5xl">
                      {course.tag === "BDS" ? "🦷" : "🔬"}
                    </div>
                  </div>

                  <div className="p-5 -mt-8 relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center text-2xl shadow-lg mb-4`}>
                      {course.tag === "BDS" ? "🦷" : "🔬"}
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-[15px] leading-snug flex-1 pr-2">{course.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 ${color.bg} ${color.border} ${color.text}`}>
                        {course.tag}
                      </span>
                    </div>

                    <p className="text-[12px] text-white/35 leading-relaxed mb-4 line-clamp-2">{course.description || "No description provided."}</p>

                    <div className="flex items-center gap-4 text-[11px] text-white/25 mb-5">
                      <span className="flex items-center gap-1"><Layers size={10} /> {course.totalQuizzes || 0} quizzes</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {course.duration || "—"}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {course.enrolled || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/courses/${id}`)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${color.bg} ${color.border} ${color.text} hover:opacity-80`}>
                        View Quizzes <ChevronRight size={13} />
                      </button>
                      <button onClick={() => openEdit(course)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setModalOpen(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#13131f] border border-white/[0.08] rounded-3xl p-7 w-full max-w-md shadow-2xl">

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">{editing ? "Edit Course" : "New Course"}</h3>
                  <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <FormField label="Course Title">
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="e.g. BDS Complete Prep" className="field-input" />
                  </FormField>
                  <FormField label="Description">
                    <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      placeholder="Describe this course..." className="field-input resize-none" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Tag">
                      <select value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}
                        className="field-input">
                        <option>BDS</option>
                        <option>MDS</option>
                      </select>
                    </FormField>
                    <FormField label="Duration">
                      <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                        placeholder="e.g. 6 months" className="field-input" />
                    </FormField>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                    <Save size={14} /> {saving ? "Saving..." : editing ? "Update" : "Create"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setDeleteId(null)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#13131f] border border-white/[0.08] rounded-3xl p-7 w-full max-w-sm shadow-2xl">
                <div className="text-4xl mb-4">🗑️</div>
                <h3 className="text-lg font-bold text-white mb-2">Delete Course?</h3>
                <p className="text-sm text-white/40 mb-6">This will permanently remove the course. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-sm font-semibold">Cancel</button>
                  <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <style>{`
        .field-input {
          width: 100%;
          background: transparent;
          color: white;
          font-size: 13px;
          outline: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
        select.field-input option { background: #13131f; }
      `}</style>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-cyan-500/30 transition-all">
      <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-1">{label}</label>
      {children}
    </div>
  );
}
