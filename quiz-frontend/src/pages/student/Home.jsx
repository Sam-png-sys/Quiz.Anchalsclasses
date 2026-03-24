import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen, Users, ChevronRight, Flame, Star } from 'lucide-react'
import { demoQuizzes, demoAnalytics, demoUser } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'

const tagStyle = {
  BDS: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800',
  MDS: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800',
}
const diffStyle = {
  Easy:   'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800',
  Medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800',
  Hard:   'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800',
}

export default function Home() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? demoQuizzes : demoQuizzes.filter(q => q.tag === filter)

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 fade-up">
        <p className="text-sm font-medium text-[#4f6ef7] mb-1">Good morning 🌤️</p>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Hello, {demoUser.name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-400 mt-1">Ready to test your knowledge today?</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8 fade-up">
        {[
          { label: 'Tests Taken', value: demoAnalytics.totalAttempts, icon: '📝', color: 'from-blue-500 to-indigo-600' },
          { label: 'Avg Score',   value: demoAnalytics.avgScore + '%', icon: '⭐', color: 'from-violet-500 to-purple-600', accent: true },
          { label: 'Rank',        value: '#' + demoAnalytics.rank,   icon: '🏆', color: 'from-amber-500 to-orange-500' },
        ].map(({ label, value, icon, color, accent }) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl p-4 ${accent ? `bg-gradient-to-br ${color} text-white shadow-glow` : 'bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06] shadow-card'}`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className={`text-xl font-bold font-display ${accent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            <div className={`text-[11px] font-medium mt-0.5 ${accent ? 'text-white/70' : 'text-gray-400'}`}>{label}</div>
            {accent && <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-white/10 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 fade-up">
        {['All', 'BDS', 'MDS'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${filter === f
                ? 'bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed] text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                : 'bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:border-[#4f6ef7]/40 hover:text-[#4f6ef7]'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Quiz cards */}
      <div className="flex flex-col gap-3 fade-up">
        {filtered.map((quiz, i) => (
          <div key={quiz._id}
            onClick={() => navigate(`/quiz/${quiz._id}`)}
            className="group bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl p-5 cursor-pointer hover:border-[#4f6ef7]/40 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm
                ${quiz.tag === 'BDS' ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20' : 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/20'}`}>
                {quiz.tag === 'BDS' ? '🦷' : '🔬'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] truncate">{quiz.title}</h3>
                  {i === 0 && <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800"><Flame size={9} />Hot</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${tagStyle[quiz.tag]}`}>{quiz.tag}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${diffStyle[quiz.difficulty]}`}>{quiz.difficulty}</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"><Clock size={10} /> {quiz.duration}m</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"><BookOpen size={10} /> {quiz.questionCount} Qs</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium"><Users size={10} /> {quiz.attempts}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#1e1e35] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4f6ef7] group-hover:text-white transition-all duration-200">
                <ChevronRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
