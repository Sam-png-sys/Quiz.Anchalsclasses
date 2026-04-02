import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, Users, BarChart3,
  PanelLeftClose, PanelLeftOpen, Shield, BookOpen,
  TrendingUp, Activity, ArrowUpRight, Clock, Zap,
  Loader2,
  GraduationCapIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

// Decode JWT to get user info
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [topStudents, setTopStudents] = useState([]);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const user = decodeToken(token);
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    fetch("http://127.0.0.1:8000/admin/top-students", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setTopStudents)
      .catch(() => setTopStudents([]));
  }, []);

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:8000/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();
        setStats({
          quizzes: data.total_quizzes ?? 0,
          students: data.total_students ?? 0,
          attempts: data.total_attempts ?? 0,
        });
      } catch (err) {
        setError("Could not load stats. Is your backend running?");
        // Fallback to zeros so UI doesn't break
        setStats({ quizzes: 0, students: 0, attempts: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", active: true },
    { icon: PlusCircle, label: "Create Quiz", path: "/create-quiz", active: false },
    { icon: BookOpen, label: "All Quizzes", path: "/quizzes", active: false },
    { icon: Users, label: "Students", path: "/students", active: false },
    { icon: GraduationCapIcon, label: "Courses", path: "/courses", active: false },
    { icon: BarChart3, label: "Analytics", path: "/analytics", active: false },
  ];

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 220 : 68 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-[#0c0c18] border-r border-white/[0.05] flex flex-col h-[calc(100vh-64px)] sticky top-16 flex-shrink-0"
        >
          <div className={`flex ${sidebarOpen ? "justify-end pr-3" : "justify-center"} pt-4 pb-2`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-2 flex-1 pt-2">
            {navItems.map(({ icon: Icon, label, path, active }) => (
              <button key={label}
                onClick={() => path ? navigate(path) : alert("Coming soon")}
                title={!sidebarOpen ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.08)]" : "text-white/40 hover:text-white hover:bg-white/[0.05]"}
                  ${!sidebarOpen ? "justify-center" : ""}`}>
                <Icon size={17} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}
                {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/10 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={13} className="text-cyan-400" />
                <span className="text-[11px] font-bold text-cyan-400">Pro Admin</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">Full access to all features.</p>
            </div>
          )}
        </motion.aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-7">

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Header */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                {/* ✅ Real name from JWT */}
                <p className="text-sm text-white/35 mt-1">Welcome back, {userName} 👋</p>
              </div>
              <motion.button variants={fadeUp}
                onClick={() => navigate("/create-quiz")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-[0.98]">
                <PlusCircle size={16} /> New Quiz
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {loading ? (
              // Loading skeletons
              [1, 2, 3].map(i => (
                <div key={i} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-5 animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.05] mb-4" />
                  <div className="w-16 h-8 bg-white/[0.05] rounded-lg mb-2" />
                  <div className="w-24 h-3 bg-white/[0.05] rounded-full" />
                </div>
              ))
            ) : (
              <>
                <StatCard variants={fadeUp} icon={BookOpen} label="Total Quizzes" value={stats.quizzes} color="cyan" />
                <StatCard variants={fadeUp} icon={Users} label="Students" value={stats.students} color="purple" />
                <StatCard variants={fadeUp} icon={TrendingUp} label="Total Attempts" value={stats.attempts} color="green" />
              </>
            )}
          </motion.div>

          {/* Bottom grid */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Top Students (Leaderboard) */}
            <motion.div variants={fadeUp} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-6">

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-cyan-400" />
                  <h2 className="text-[14px] font-bold text-white">Top Students</h2>
                </div>
                <button className="text-[11px] font-semibold text-cyan-400 hover:underline">
                  View all
                </button>
              </div>

              <div className="flex flex-col gap-0">

                {topStudents.length === 0 ? (
                  <p className="text-white/40">No data yet</p>
                ) : (
                  topStudents.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0"
                    >

                      {/* Rank Dot */}
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 
              ${i === 0
                            ? "bg-yellow-400"
                            : i === 1
                              ? "bg-gray-300"
                              : i === 2
                                ? "bg-amber-600"
                                : "bg-cyan-400"
                          }`}
                      />

                      {/* Text */}
                      <p className="flex-1 text-[13px] text-white/60 leading-snug">
                        <span className="text-white font-semibold">{item.name}</span> scored{" "}
                        <span className="text-green-400 font-semibold">
                          {item.score}%
                        </span>{" "}
                        in {item.quiz}
                      </p>

                      {/* Time */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} className="text-white/20" />
                        <span className="text-[11px] text-white/25">
                          {item.submittedAt
                            ? `${Math.floor(
                              (Date.now() - new Date(item.submittedAt)) / 60000
                            )} min ago`
                            : "--"}
                        </span>
                      </div>
                    </div>
                  ))
                )}

              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={fadeUp} className="bg-[#0c0c18] border border-white/[0.05] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={15} className="text-cyan-400" />
                <h2 className="text-[14px] font-bold text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Create Quiz", icon: PlusCircle, path: "/create-quiz", color: "from-cyan-500/15 to-blue-600/15 border-cyan-500/20 text-cyan-400" },
                  { label: "View Students", icon: Users, path: "/students", color: "from-purple-500/15 to-pink-600/15 border-purple-500/20 text-purple-400" },
                  { label: "Analytics", icon: BarChart3, path: "/analytics", color: "from-green-500/15 to-emerald-600/15 border-green-500/20 text-green-400" },
                  { label: "All Quizzes", icon: BookOpen, path: "/quizzes", color: "from-amber-500/15 to-orange-600/15 border-amber-500/20 text-amber-400" },

                ].map(({ label, icon: Icon, path, color }) => (
                  <button key={label}
                    onClick={() => path ? navigate(path) : alert("Coming soon")}
                    className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br border hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${color} group`}>
                    <div>
                      <Icon size={18} className="mb-2" />
                      <p className="text-[12px] font-bold text-white/80">{label}</p>
                    </div>
                    <ArrowUpRight size={13} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, variants }) {
  const palette = {
    cyan: { grad: "from-cyan-400 to-blue-500", glow: "shadow-cyan-500/20", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/15" },
    purple: { grad: "from-purple-400 to-pink-500", glow: "shadow-purple-500/20", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/15" },
    green: { grad: "from-green-400 to-emerald-500", glow: "shadow-green-500/20", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/15" },
  };
  const p = palette[color];

  return (
    <motion.div variants={variants}
      className={`bg-[#0c0c18] border ${p.border} rounded-2xl p-5 hover:shadow-lg ${p.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl ${p.bg} flex items-center justify-center`}>
          <Icon size={18} className={p.text} />
        </div>
      </div>
      <p className={`text-3xl font-bold bg-gradient-to-r ${p.grad} bg-clip-text text-transparent mb-1`}>
        {value}
      </p>
      <p className="text-[12px] font-medium text-white/35">{label}</p>
    </motion.div>
  );
}
