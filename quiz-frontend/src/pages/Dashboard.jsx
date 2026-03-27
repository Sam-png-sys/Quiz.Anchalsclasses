import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    quizzes: 0,
    students: 0,
    attempts: 0,
  });

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🔥 FETCH STATS
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setStats({
          quizzes: data.total_quizzes || 0,
          students: data.total_students || 0,
          attempts: data.total_attempts || 0,
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-[#0B0F1A] text-white overflow-hidden">

      {/* 🔥 SIDEBAR */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="bg-[#111827] border-r border-gray-800 flex flex-col"
      >

        {/* 🔥 HEADER */}
        <div className={`flex ${sidebarOpen ? "justify-between px-4" : "justify-center"} items-center py-4`}>

          {sidebarOpen && (
            <h1 className="text-lg font-bold text-cyan-400 tracking-wide">
              Quiz Admin
            </h1>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        {/* 🔥 MENU */}
        <nav className="flex flex-col gap-2 px-2 mt-4">

          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            open={sidebarOpen}
            active
            onClick={() => navigate("/dashboard")}
          />

          <SidebarItem
            icon={<PlusCircle size={20} />}
            label="Create Quiz"
            open={sidebarOpen}
            onClick={() => navigate("/create-quiz")}
          />

          <SidebarItem
            icon={<Users size={20} />}
            label="Students"
            open={sidebarOpen}
            onClick={() => alert("Coming soon")}
          />

          <SidebarItem
            icon={<BarChart3 size={20} />}
            label="Analytics"
            open={sidebarOpen}
            onClick={() => alert("Coming soon")}
          />

        </nav>

        {/* 🔥 LOGOUT */}
        <div className="mt-auto p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg 
                       bg-red-500 hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            {sidebarOpen && "Logout"}
          </button>
        </div>

      </motion.div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-8"
        >
          Dashboard Overview
        </motion.h1>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-3 gap-6">

          <StatCard title="Total Quizzes" value={stats.quizzes} color="cyan" />
          <StatCard title="Students" value={stats.students} color="purple" />
          <StatCard title="Attempts" value={stats.attempts} color="green" />

        </div>

        {/* 🔥 ACTIVITY */}
        <div className="mt-10 bg-[#111827] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl mb-4">Recent Activity</h2>

          <ul className="space-y-2 text-gray-400">
            <li>Students are attempting quizzes...</li>
            <li>New quizzes being created...</li>
            <li>Live analytics updating...</li>
          </ul>
        </div>

      </div>
    </div>
  );
}


// 🔥 SIDEBAR ITEM
function SidebarItem({ icon, label, open, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
      transition-all duration-200
      ${active
        ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_#00E5FF20]"
        : "hover:bg-gray-800 hover:scale-[1.02]"
      }`}
    >
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </div>
  );
}


// 🔥 STAT CARD
function StatCard({ title, value, color }) {

  const colors = {
    cyan: "from-cyan-400 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-400 to-emerald-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="bg-[#111827] p-6 rounded-xl border border-gray-800 
                 hover:shadow-[0_0_30px_#00E5FF10] transition"
    >
      <h2 className="text-gray-400">{title}</h2>

      <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
    </motion.div>
  );
}