import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart2, Trophy, Settings, LogOut, Sun, Moon, Shield, BookOpen, Users } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const studentLinks = [
  { to: '/home',        icon: Home,      label: 'Home' },
  { to: '/analytics',   icon: BarChart2, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy,    label: 'Ranks' },
]

const adminLinks = [
  { to: '/admin',             icon: Shield,   label: 'Dashboard' },
  { to: '/admin/questions',   icon: Settings, label: 'Questions' },
  { to: '/admin/quizzes/new', icon: BookOpen, label: 'Quizzes' },
  { to: '/admin/students',    icon: Users,    label: 'Students' },
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
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[70px] bg-white dark:bg-[#16162a] border-r border-black/[0.06] dark:border-white/[0.06] z-50 shadow-sm">
        <div className="flex flex-col items-center py-6 gap-5 flex-1">
          {/* Logo */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm font-display">Q</span>
          </div>

          <div className="w-8 h-px bg-gray-100 dark:bg-white/[0.06] rounded-full" />

          <nav className="flex flex-col gap-1.5 flex-1">
            {links.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to} title={label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative group
                    ${active
                      ? 'bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] text-white shadow-glow'
                      : 'text-gray-400 hover:text-[#4f6ef7] hover:bg-[#4f6ef7]/10 dark:hover:bg-[#4f6ef7]/10'}`}>
                  <Icon size={18} />
                  {/* Tooltip */}
                  <span className="absolute left-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="flex flex-col gap-1.5 pb-2">
            <button onClick={toggle} title="Toggle theme"
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#4f6ef7] hover:bg-[#4f6ef7]/10 transition-all">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => navigate('/login')} title="Logout"
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-card-lg flex justify-around px-2 py-2">
          {links.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                  ${active ? 'text-[#4f6ef7]' : 'text-gray-400'}`}>
                <Icon size={20} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
