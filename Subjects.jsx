import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Clock, Users, ChevronRight, Trash2, Edit2,
  X, Save, Layers, ArrowLeft, BookOpen
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../utils/api";
import { API_BASE } from "../utils/config";
import AdminShell from "../components/AdminShell";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const MotionDiv = motion.div;

const SUBJECT_COLORS = [
  { from: "from-cyan-500", to: "to-blue-600", bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  { from: "from-purple-500", to: "to-pink-600", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  { from: "from-amber-500", to: "to-orange-600", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  { from: "from-green-500", to: "to-emerald-600", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
  { from: "from-rose-500", to: "to-red-600", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
  { from: "from-indigo-500", to: "to-violet-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
];

const EMPTY_FORM = { name: "", description: "" };

export default function Subjects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");

  const courseId = searchParams.get("courseId");
  const courseTitle = searchParams.get("course") || "Course";

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (courseId) fetchSubjects();
  }, [courseId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/admin/course/${courseId}/subjects`);
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load subjects.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s._id || s.id);
    setForm({ name: s.name, description: s.description || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Subject name required"); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/admin/subject/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`${API_BASE}/admin/course/${courseId}/subject`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
      }
      await fetchSubjects();
      setModalOpen(false);
    } catch {
      alert("Failed to save subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/admin/subject/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(prev => prev.filter(s => (s._id || s.id) !== id));
      setDeleteId(null);
    } catch {
      alert("Failed to delete subject");
    }
  };

  return (
    <AdminShell>
      <main className="max-w-6xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/courses")}
              className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Subjects</h1>
              <p className="text-sm text-white/35 mt-1">{courseTitle}</p>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 18px 32px var(--accent-glow)" }}
          >
            <Plus size={16} /> Add Subject
          </button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-white/[0.05] rounded-2xl mb-4" />
                <div className="w-3/4 h-4 bg-white/[0.05] rounded mb-2" />
                <div className="w-full h-3 bg-white/[0.05] rounded mb-1" />
                <div className="w-2/3 h-3 bg-white/[0.05] rounded" />
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-cyan-400/50" />
            </div>
            <p className="text-white/40 font-semibold text-lg">No subjects yet</p>
            <p className="text-white/20 text-sm mt-1 mb-6">Add your first subject to get started</p>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
            >
              Add Subject
            </button>
          </div>
        ) : (
          <MotionDiv variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject, idx) => {
              const id = subject._id || subject.id;
              const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
              return (
                <MotionDiv key={id} variants={fadeUp}
                  className="bg-[#0c0c18] border border-white/[0.06] rounded-3xl overflow-hidden hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40 transition-all duration-300 group">

                  {/* Top gradient */}
                  <div className={`h-24 bg-gradient-to-br ${color.from} ${color.to} opacity-10 relative`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <BookOpen size={40} />
                    </div>
                  </div>

                  <div className="p-5 -mt-8 relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center shadow-lg mb-4`}>
                      <BookOpen size={22} className="text-white" />
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-[15px] leading-snug flex-1 pr-2">{subject.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex-shrink-0 ${color.bg} ${color.border} ${color.text}`}>
                        Subject
                      </span>
                    </div>

                    <p className="text-[12px] text-white/35 leading-relaxed mb-4 line-clamp-2">
                      {subject.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-white/25 mb-5">
                      <span className="flex items-center gap-1"><Layers size={10} /> {subject.totalQuizzes || 0} quizzes</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/quizzes?course=${encodeURIComponent(courseTitle)}&subjectId=${id}&subject=${encodeURIComponent(subject.name)}`)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${color.bg} ${color.border} ${color.text} hover:opacity-80`}
                      >
                        View Quizzes <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(subject)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
          </MotionDiv>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {modalOpen && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setModalOpen(false)}>
              <MotionDiv initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#13131f] border border-white/[0.08] rounded-3xl p-7 w-full max-w-md shadow-2xl">

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">{editing ? "Edit Subject" : "New Subject"}</h3>
                  <button onClick={() => setModalOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <FormField label="Subject Name">
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Anatomy"
                      className="field-input"
                    />
                  </FormField>
                  <FormField label="Description">
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe this subject..."
                      className="field-input resize-none"
                    />
                  </FormField>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}>
                    <Save size={14} /> {saving ? "Saving..." : editing ? "Update" : "Create"}
                  </button>
                </div>
              </MotionDiv>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteId && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setDeleteId(null)}>
              <MotionDiv initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#13131f] border border-white/[0.08] rounded-3xl p-7 w-full max-w-sm shadow-2xl">
                <div className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4">Delete</div>
                <h3 className="text-lg font-bold text-white mb-2">Delete Subject?</h3>
                <p className="text-sm text-white/40 mb-6">This will permanently remove the subject. This cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-sm font-semibold">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                    Delete
                  </button>
                </div>
              </MotionDiv>
            </MotionDiv>
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
    </AdminShell>
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
