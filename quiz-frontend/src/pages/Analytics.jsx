import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Users, TrendingUp, BarChart3
} from "lucide-react";
import Navbar from "./Navbar";
import { apiRequest } from "../utils/api";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalyticsList() {

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get all quizzes
      const courses = await apiRequest("/admin/courses");

      // 2️⃣ Fetch analytics for each quiz
      const data = await Promise.all(
        courses.map(async (q) => {
          try {
            const analytics = await apiRequest(`/admin/analytics/${q._id}`);

            return {
              ...q,
              totalAttempts: analytics.total_attempts,
              avgScore: analytics.average_score,
            };
          } catch {
            return {
              ...q,
              totalAttempts: 0,
              avgScore: 0,
            };
          }
        })
      );

      setQuizzes(data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-white/40">
              Performance overview of all quizzes
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06]"
          />
        </div>

        {/* GRID */}
        {loading ? (
          <p className="text-white/40">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {filtered.map((quiz) => (
              <motion.div
                key={quiz._id}
                className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all"
              >

                {/* TITLE */}
                <h3 className="font-bold text-white mb-3">
                  {quiz.title}
                </h3>

                {/* STATS */}
                <div className="space-y-3">

                  {/* Attempts */}
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Users size={14} />
                    {quiz.totalAttempts} Attempts
                  </div>

                  {/* Avg Score */}
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <TrendingUp size={14} />
                    Avg Score: {Math.round(quiz.avgScore)}%
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${quiz.avgScore}%` }}
                      />
                    </div>
                  </div>

                </div>

              </motion.div>
            ))}

          </div>
        )}
      </main>
    </div>
  );
}