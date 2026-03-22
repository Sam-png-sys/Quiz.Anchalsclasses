import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart2, Trophy, Settings, LogOut, Sun, Moon, Shield, BookOpen } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const studentLinks = [
  { to: '/home',        icon: Home,      label: 'Home' },
  { to: '/analytics',   icon: BarChart2, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy,    label: 'Ranks' },
]

const adminLinks = [
  { to: '/admin',           icon: Shield,   label: 'Dashboard' },
  { to: '/admin/questions', icon: Settings, label: 'Questions' },
  { to: '/admin/quizzes/new', icon: BookOpen, label: 'Quizzes' },
  { to: '/admin/students',  icon: Home,     label: 'Students' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin  = location.pathname.startsWith('/admin')
  const links    = isAdmin ? adminLinks : studentLinks

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-16 bg-white dark:bg-[#18181f] border-r border-black/[0.07] dark:border-white/[0.07] z-50">
        <div className="flex flex-col items-center py-5 gap-6 flex-1">
          <div className="w-9 h-9 bg-[#185fa5] rounded-xl flex items-center justify-center text-white font-bold text-sm">Q</div>
          <nav className="flex flex-col gap-2 mt-4 flex-1">
            {links.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to} title={label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${active ? 'bg-[#185fa5] dark:bg-[#378add] text-white' : 'text-gray-400 hover:text-[#185fa5] hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                  <Icon size={18} />
                </Link>
              )
            })}
          </nav>
          <div className="flex flex-col gap-2 pb-2">
            <button onClick={toggle} title="Toggle theme"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#185fa5] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/login')} title="Logout"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#18181f] border-t border-black/[0.07] dark:border-white/[0.07] z-50 flex justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all
                ${active ? 'text-[#185fa5] dark:text-[#378add]' : 'text-gray-400'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
