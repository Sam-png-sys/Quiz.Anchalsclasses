import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, FileQuestion, Plus, Eye, ToggleLeft, ArrowRight } from 'lucide-react'
import { demoAdminStats, demoQuizzes } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'

export default function AdminDashboard() {
  const navigate = useNavigate()
  return (
    <AppLayout>
      <div className="mb-7 fade-up">
        <p className="text-sm font-semibold text-[#4f6ef7] mb-1">Admin Panel</p>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dr. Anchal's Classes</h1>
        <p className="text-sm text-gray-400 mt-1">Manage quizzes, questions and students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 fade-up">
        {[
          { label: 'Questions', value: demoAdminStats.totalQuestions, icon: '❓', gradient: 'from-[#4f6ef7] to-[#7c3aed]' },
          { label: 'Quizzes',   value: demoAdminStats.totalQuizzes,   icon: '📋', gradient: 'from-violet-500 to-purple-600' },
          { label: 'Students',  value: demoAdminStats.totalStudents,  icon: '👨‍🎓', gradient: 'from-emerald-500 to-teal-600' },
        ].map(({ label, value, icon, gradient }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-glow`}>
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold font-display">{value}</div>
            <div className="text-white/70 text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6 fade-up">
        {[
          { label: 'Add Question',  emoji: '➕', to: '/admin/questions/new', primary: true },
          { label: 'Create Quiz',   emoji: '📝', to: '/admin/quizzes/new',   primary: false },
          { label: 'Manage Access', emoji: '🔐', to: '/admin/students',      primary: false },
          { label: 'View Results',  emoji: '📊', to: '/admin/students',      primary: false },
        ].map(({ label, emoji, to, primary }) => (
          <button key={label} onClick={() => navigate(to)}
            className={`flex items-center justify-between px-5 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] group
              ${primary
                ? 'bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed] text-white shadow-glow'
                : 'bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06] text-gray-700 dark:text-gray-200 shadow-card hover:border-[#4f6ef7]/30'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span>{label}</span>
            </div>
            <ArrowRight size={15} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* Quiz status */}
      <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card overflow-hidden fade-up">
        <div className="px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Quiz Status</h3>
          <span className="text-xs text-gray-400 font-medium">{demoQuizzes.length} total</span>
        </div>
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {demoQuizzes.map(q => (
            <div key={q._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#1e1e35] transition-colors">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                ${q.tag === 'BDS' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                {q.tag === 'BDS' ? '🦷' : '🔬'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{q.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{q.questionCount} questions · {q.duration}m</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                ${q.isOpen ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-[#1e1e35] text-gray-400'}`}>
                {q.isOpen ? '● Open' : '○ Closed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
