import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [role, setRole]         = useState('student')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => navigate(role === 'admin' ? '/admin' : '/home')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] dark:bg-[#0d0d14] px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#4f6ef7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl relative fade-up">
        <div className="bg-white dark:bg-[#16162a] rounded-3xl shadow-card-lg border border-black/[0.05] dark:border-white/[0.05] overflow-hidden flex flex-col md:flex-row">

          {/* Left — brand panel */}
          <div className="md:w-[45%] bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] p-10 flex flex-col justify-between relative overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-12 -left-6 w-52 h-52 bg-white/[0.06] rounded-full" />

            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl mb-6">🎓</div>
              <h1 className="font-display text-2xl font-bold text-white leading-snug mb-3">
                Dr. Anchal's<br />Classes
              </h1>
              <p className="text-white/70 text-sm leading-relaxed">
                Master Dentistry.<br />Ace Every Exam.
              </p>
            </div>

            <div className="relative flex gap-2.5 mt-8">
              {[['500+', 'Questions'], ['12', 'Quizzes'], ['200', 'Students']].map(([num, lbl]) => (
                <div key={lbl} className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
                  <div className="text-lg font-bold text-white">{num}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 p-10 flex flex-col justify-center">
            {/* Role toggle */}
            <div className="flex bg-gray-100 dark:bg-[#1e1e35] rounded-2xl p-1 mb-8">
              {['student', 'admin'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200
                    ${role === r
                      ? 'bg-white dark:bg-[#16162a] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                  {r === 'student' ? '👨‍🎓 Student' : '🛡️ Admin'}
                </button>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {role === 'admin' ? 'Admin Login' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-400 mb-7">Sign in to continue to your dashboard</p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="input-field" />
            </div>
            <div className="mb-7">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="input-field" />
            </div>

            <button onClick={handleLogin}
              className="btn-primary">
              Sign In →
            </button>

            <p className="text-center text-xs text-gray-400 mt-5">
              Demo mode — any credentials work
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
