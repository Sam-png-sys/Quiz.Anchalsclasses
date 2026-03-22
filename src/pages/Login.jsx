import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [role, setRole]       = useState('student')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate(role === 'admin' ? '/admin' : '/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] px-4">
      <div className="w-full max-w-3xl bg-white dark:bg-[#18181f] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[500px]">

        {/* Left panel */}
        <div className="bg-[#185fa5] md:w-1/2 p-10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-5">🎓</div>
            <h1 className="text-2xl font-bold text-white mb-2">Dr. Anchal's Classes</h1>
            <p className="text-white/70 text-sm leading-relaxed">Master Dentistry.<br />Ace Every Exam.</p>
          </div>
          <div className="flex gap-3 mt-8">
            {[['500+', 'Questions'], ['12', 'Quizzes'], ['200', 'Students']].map(([num, lbl]) => (
              <div key={lbl} className="flex-1 bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{num}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="flex bg-gray-100 dark:bg-[#222230] rounded-xl p-1 mb-7">
            {['student', 'admin'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
                  ${role === r ? 'bg-white dark:bg-[#18181f] text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                {r}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {role === 'admin' ? 'Admin Login' : 'Welcome back'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to your account</p>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-[#185fa5] placeholder:text-gray-400 transition-all" />
          </div>
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-[#185fa5] placeholder:text-gray-400 transition-all" />
          </div>

          <button onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-[#185fa5] dark:bg-[#378add] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Sign In →
          </button>
        </div>
      </div>
    </div>
  )
}
