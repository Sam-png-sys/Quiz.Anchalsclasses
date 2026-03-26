import { motion } from "framer-motion";

export default function Dashboard() {

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-[#0B0F1A] text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#111827] border-r border-gray-800 p-6 flex flex-col">

        <h1 className="text-2xl font-bold text-cyan-400 mb-10">
          Quiz Admin
        </h1>

        <nav className="flex flex-col gap-4">

          <button className="text-left px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            Dashboard
          </button>

          <button className="text-left px-4 py-2 rounded-lg hover:bg-gray-800">
            Create Quiz
          </button>

          <button className="text-left px-4 py-2 rounded-lg hover:bg-gray-800">
            Students
          </button>

          <button className="text-left px-4 py-2 rounded-lg hover:bg-gray-800">
            Analytics
          </button>

        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 rounded-lg mt-6"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-6"
        >
          Dashboard Overview
        </motion.h1>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">
            <h2 className="text-gray-400">Total Quizzes</h2>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">
            <h2 className="text-gray-400">Total Students</h2>
            <p className="text-2xl font-bold mt-2">120</p>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">
            <h2 className="text-gray-400">Attempts Today</h2>
            <p className="text-2xl font-bold mt-2">35</p>
          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <div className="mt-10 bg-[#111827] p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl mb-4">Recent Activity</h2>

          <ul className="space-y-3 text-gray-400">
            <li>Rahul attempted Math Quiz</li>
            <li>New quiz created: Physics Test</li>
            <li>Priya scored 85%</li>
          </ul>
        </div>

      </div>
    </div>
  );
}