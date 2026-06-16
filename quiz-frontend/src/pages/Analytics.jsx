import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, TrendingUp, BarChart3, Trophy, Award, ChevronRight, X, Calendar, BookOpen, ArrowLeft
} from "lucide-react";
import { apiRequest } from "../utils/api";
import { useNavigate } from "react-router-dom";
import AdminShell from "../components/AdminShell";

export default function AnalyticsList() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("quizzes"); // "quizzes" | "students"
  const [quizFilter, setQuizFilter] = useState("all"); // "all" or specific quizId
  const [selectedStudent, setSelectedStudent] = useState(null); // student object for detailed attempts modal

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      // 3️⃣ Get all students records
      const studentData = await apiRequest("/admin/students");
      const normalizedStudents = studentData.map(s => ({
        ...s,
        isActive: s.isActive ?? true,
        avgScore: s.avgScore ?? 0,
        totalAttempts: s.totalAttempts ?? 0,
        attempts: s.attempts ?? [],
      }));
      setStudents(normalizedStudents);

    } catch (err) {
      console.error("Failed to load analytics or students data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getLeaderboardData = () => {
    if (quizFilter === "all") {
      const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
      );
      return filteredStudents
        .sort((a, b) => b.avgScore - a.avgScore)
        .map((student, index) => ({
          student,
          rank: index + 1,
          scoreLabel: `${student.avgScore}%`,
          scoreValue: student.avgScore,
          attemptsLabel: `${student.totalAttempts} Attempt${student.totalAttempts !== 1 ? "s" : ""}`,
        }));
    } else {
      const quizStudents = students
        .map(student => {
          const matchingAttempts = student.attempts.filter(a => a.quizId === quizFilter);
          if (matchingAttempts.length === 0) return null;
          const bestAttempt = matchingAttempts.reduce((best, curr) => 
            curr.percentage > best.percentage ? curr : best, matchingAttempts[0]);
          return {
            student,
            bestScore: bestAttempt.percentage,
            scoreLabel: `${bestAttempt.percentage}%`,
            scoreValue: bestAttempt.percentage,
            attemptsLabel: `${matchingAttempts.length} Attempt${matchingAttempts.length !== 1 ? "s" : ""}`,
          };
        })
        .filter(item => item !== null)
        .filter(item =>
          item.student.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.student.email?.toLowerCase().includes(search.toLowerCase())
        );

      return quizStudents
        .sort((a, b) => b.bestScore - a.bestScore)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
    }
  };

  const leaderboardData = getLeaderboardData();

  return (
    <AdminShell>
      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-white/35 mt-1">
              Performance overview and student leaderboard
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/[0.06] mb-8 gap-6 relative">
          <button
            onClick={() => { setActiveTab("quizzes"); setSearch(""); }}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === "quizzes" ? "text-cyan-400 font-bold" : "text-white/40 hover:text-white/70"
            }`}
          >
            Quiz Analytics
            {activeTab === "quizzes" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
              />
            )}
          </button>
          <button
            onClick={() => { setActiveTab("students"); setSearch(""); }}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === "students" ? "text-cyan-400 font-bold" : "text-white/40 hover:text-white/70"
            }`}
          >
            Student Leaderboard
            {activeTab === "students" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
              />
            )}
          </button>
        </div>

        {/* QUIZZES TAB */}
        {activeTab === "quizzes" && (
          <>
            {/* SEARCH */}
            <div className="relative mb-6">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quizzes..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] focus:border-cyan-500/40 outline-none text-white transition-all"
              />
            </div>

            {loading ? (
              <p className="text-white/40">Loading quizzes...</p>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40">No quizzes found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuizzes.map((quiz) => (
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
                        {quiz.totalAttempts} Attempt{quiz.totalAttempts !== 1 ? "s" : ""}
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
          </>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students by name or email..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] focus:border-cyan-500/40 text-white outline-none transition-all"
                />
              </div>

              {/* QUIZ FILTER */}
              <div className="relative min-w-[240px]">
                <select
                  value={quizFilter}
                  onChange={(e) => setQuizFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0c18] border border-white/[0.06] text-white focus:border-cyan-500/40 outline-none appearance-none cursor-pointer pr-10"
                >
                  <option value="all">🏆 Global Leaderboard</option>
                  {quizzes.map(q => (
                    <option key={q._id} value={q._id}>📝 {q.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-white/40">Loading leaderboard...</p>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12 bg-[#0c0c18] border border-white/[0.06] rounded-2xl">
                <Trophy size={48} className="mx-auto text-white/20 mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-white/60">No Rankings Yet</h3>
                <p className="text-sm text-white/30 mt-1">
                  {quizFilter === "all" ? "No students have attempted any quizzes yet." : "No attempts recorded for this quiz."}
                </p>
              </div>
            ) : (
              <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                {/* Header Row */}
                <div className="grid grid-cols-[80px_1fr_120px_120px_100px] items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Rank</span>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Student</span>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest text-center">Attempts</span>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest text-center">Score</span>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest text-right">Details</span>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-white/[0.03]">
                  {leaderboardData.map(({ student, rank, scoreLabel, scoreValue, attemptsLabel }) => {
                    // Rank styling
                    let rankBadge = (
                      <span className="text-sm font-bold text-white/50">#{rank}</span>
                    );
                    if (rank === 1) {
                      rankBadge = (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold shadow-lg shadow-yellow-500/5">
                          🥇
                        </span>
                      );
                    } else if (rank === 2) {
                      rankBadge = (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/30 text-xs font-bold shadow-lg shadow-slate-300/5">
                          🥈
                        </span>
                      );
                    } else if (rank === 3) {
                      rankBadge = (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/30 text-xs font-bold shadow-lg shadow-amber-500/5">
                          🥉
                        </span>
                      );
                    }

                    // Score badge styling based on value
                    let scoreColor = "text-red-400 bg-red-500/10 border-red-500/20";
                    if (scoreValue >= 80) {
                      scoreColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    } else if (scoreValue >= 50) {
                      scoreColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    }

                    return (
                      <div
                        key={student._id}
                        onClick={() => setSelectedStudent(student)}
                        className="grid grid-cols-[80px_1fr_120px_120px_100px] items-center gap-4 px-6 py-4 hover:bg-white/[0.01] transition-all cursor-pointer group"
                      >
                        {/* Rank */}
                        <div className="flex items-center">{rankBadge}</div>

                        {/* Student details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/10 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                            {student.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-white/30 truncate mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {/* Attempts */}
                        <div className="text-sm text-white/50 text-center font-medium">
                          {attemptsLabel}
                        </div>

                        {/* Score */}
                        <div className="flex justify-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${scoreColor}`}>
                            {scoreLabel}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:text-cyan-400 transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0f0f1c] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Student Performance</h3>
                    <p className="text-xs text-white/40 mt-0.5">Quiz attempt history for {selectedStudent.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 p-6 bg-white/[0.01] border-b border-white/[0.04]">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Award size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/40 text-[10px] uppercase tracking-wider">Average Score</p>
                    <p className="text-lg font-bold text-cyan-400">{selectedStudent.avgScore}%</p>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BookOpen size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/40 text-[10px] uppercase tracking-wider">Total Attempts</p>
                    <p className="text-lg font-bold text-purple-400">{selectedStudent.totalAttempts}</p>
                  </div>
                </div>
              </div>

              {/* Attempts list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Quiz Attempts ({selectedStudent.attempts.length})</span>
                {selectedStudent.attempts.length === 0 ? (
                  <p className="text-sm text-white/30 text-center py-8">No attempts recorded for this student.</p>
                ) : (
                  selectedStudent.attempts.map((attempt) => {
                    // Look up quiz name
                    const quiz = quizzes.find(q => q._id === attempt.quizId);
                    const quizTitle = quiz?.title || "Unknown Quiz";

                    // Determine percentage score and style
                    const percent = attempt.percentage;
                    let badgeStyle = "text-red-400 bg-red-500/10 border-red-500/20";
                    if (percent >= 80) {
                      badgeStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    } else if (percent >= 50) {
                      badgeStyle = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    }

                    // Format date
                    const formattedDate = attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "Unknown Date";

                    return (
                      <div
                        key={attempt._id}
                        className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex items-center justify-between hover:border-white/[0.08] transition-all"
                      >
                        <div className="min-w-0 pr-4">
                          <h4 className="text-sm font-semibold text-white truncate">{quizTitle}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                            <Calendar size={12} />
                            <span>{formattedDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">{attempt.score} / {attempt.totalQuestions}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">Correct Answers</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${badgeStyle}`}>
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end bg-white/[0.01]">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-white text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
