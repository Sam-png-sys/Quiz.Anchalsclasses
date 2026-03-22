import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, FileQuestion, Plus, Eye, ToggleLeft } from 'lucide-react'
import { demoAdminStats, demoQuizzes } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function AdminDashboard() {
  const navigate = useNavigate()
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-0.5">Dr. Anchal's Classes</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Questions', value: demoAdminStats.totalQuestions, Icon: FileQuestion, color: 'bg-blue-50 dark:bg-blue-900/20 text-[#185fa5] dark:text-[#378add]' },
          { label: 'Quizzes',   value: demoAdminStats.totalQuizzes,   Icon: BookOpen,      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
          { label: 'Students',  value: demoAdminStats.totalStudents,  Icon: Users,         color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label} className="flex flex-col items-center py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Add Question',  icon: Plus,        to: '/admin/questions/new', color: 'bg-[#185fa5] dark:bg-[#378add] text-white' },
          { label: 'Create Quiz',   icon: BookOpen,    to: '/admin/quizzes/new',   color: 'bg-white dark:bg-[#18181f] border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-gray-200' },
          { label: 'Manage Access', icon: ToggleLeft,  to: '/admin/students',      color: 'bg-white dark:bg-[#18181f] border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-gray-200' },
          { label: 'View Results',  icon: Eye,         to: '/admin/students',      color: 'bg-white dark:bg-[#18181f] border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-gray-200' },
        ].map(({ label, icon: Icon, to, color }) => (
          <button key={label} onClick={() => navigate(to)}
            className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] ${color}`}>
            <Icon size={20} />{label}
          </button>
        ))}
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Quiz Status</h3>
        </div>
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {demoQuizzes.map(q => (
            <div key={q._id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="text-base flex-shrink-0">{q.tag === 'BDS' ? '🦷' : '🔬'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{q.title}</div>
                <Badge value={q.tag} type="tag" className="mt-0.5" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${q.isOpen ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {q.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  )
}
