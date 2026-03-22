import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen, Users, ChevronRight } from 'lucide-react'
import { demoQuizzes, demoAnalytics, demoUser } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function Home() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? demoQuizzes : demoQuizzes.filter(q => q.tag === filter)

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Hello, {demoUser.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ready to test your knowledge today?</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: 'Tests Taken', value: demoAnalytics.totalAttempts },
          { label: 'Avg Score',   value: demoAnalytics.avgScore + '%', accent: true },
          { label: 'Leaderboard', value: '#' + demoAnalytics.rank },
        ].map(({ label, value, accent }) => (
          <Card key={label} className="text-center">
            <div className={`text-xl font-bold ${accent ? 'text-[#185fa5] dark:text-[#378add]' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {['All', 'BDS', 'MDS'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${filter === f ? 'bg-[#185fa5] dark:bg-[#378add] text-white' : 'bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] text-gray-500 hover:border-[#185fa5]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(quiz => (
          <Card key={quiz._id} padding={false}
            className="flex items-center justify-between p-4 cursor-pointer hover:border-[#185fa5]/40 transition-all duration-200 group"
            onClick={() => navigate(`/quiz/${quiz._id}`)}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg flex-shrink-0">
                {quiz.tag === 'BDS' ? '🦷' : '🔬'}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{quiz.title}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge value={quiz.tag} type="tag" />
                  <Badge value={quiz.difficulty} type="difficulty" />
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock size={11} /> {quiz.duration} min</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><BookOpen size={11} /> {quiz.questionCount} Qs</span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Users size={11} /> {quiz.attempts}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-[#185fa5] transition-colors" />
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
