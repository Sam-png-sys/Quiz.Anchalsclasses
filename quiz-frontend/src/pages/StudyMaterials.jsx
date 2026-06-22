import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, ExternalLink, FileText, Download } from "lucide-react";
import { apiRequest } from "../utils/api";
import AdminShell from "../components/AdminShell";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const MotionDiv = motion.div;

export default function StudyMaterials() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // Fetching from /admin/courses returns all quizzes for admins
      const data = await apiRequest("/admin/courses");
      
      // Filter quizzes that have study materials
      const materials = data.filter(q => q.studyMaterialUrl);
      setQuizzes(materials);
    } catch (err) {
      setError("Could not load study materials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group by Course -> Subject -> SubSubject
  const grouped = {};
  quizzes.forEach(q => {
    const course = q.course || "General Course";
    const subject = q.subject || "General Subject";

    if (!grouped[course]) grouped[course] = {};
    if (!grouped[course][subject]) grouped[course][subject] = [];
    
    // Filter by search query
    const textToSearch = `${q.studyMaterialName} ${q.title} ${course} ${subject}`.toLowerCase();
    if (searchQuery && !textToSearch.includes(searchQuery.toLowerCase())) return;

    grouped[course][subject].push(q);
  });

  return (
    <AdminShell title="Study Materials">
      <MotionDiv initial="hidden" animate="show" variants={stagger} className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <MotionDiv variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              Study Materials
            </h1>
            <p className="text-slate-400 mt-1">View and manage study materials categorized by course and subject.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-slate-800/50 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
            />
          </div>
        </MotionDiv>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No study materials found</h3>
            <p className="text-slate-500 mt-1">Study materials added to quizzes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([courseName, subjects]) => {
              const hasItems = Object.values(subjects).some(list => list.length > 0);
              if (!hasItems) return null;

              return (
                <MotionDiv variants={fadeUp} key={courseName} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                      {courseName}
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {Object.entries(subjects).map(([subjectName, items]) => {
                      if (items.length === 0) return null;
                      return (
                        <div key={subjectName}>
                          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">
                            {subjectName}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((quiz) => (
                              <div key={quiz._id} className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all rounded-xl p-4 flex flex-col h-full">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="bg-indigo-500/10 p-2.5 rounded-lg text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium line-clamp-2" title={quiz.studyMaterialName || "Document"}>
                                      {quiz.studyMaterialName || "Document"}
                                    </h4>
                                    <p className="text-slate-500 text-xs mt-1">
                                      Quiz: {quiz.title}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end">
                                  <a
                                    href={quiz.studyMaterialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download PDF</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        )}

      </MotionDiv>
    </AdminShell>
  );
}
