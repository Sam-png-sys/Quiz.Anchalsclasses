import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { demoAnalytics } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'

export default function Analytics() {
  const d = demoAnalytics
  return (
    <AppLayout>
      <div className="mb-7 fade-up">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Track your performance over time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 fade-up">
        {[
          { label: 'Tests Taken', value: d.totalAttempts, emoji: '📝', accent: false },
          { label: 'Avg Score',   value: d.avgScore + '%', emoji: '⭐', accent: true  },
          { label: 'Best Score',  value: d.bestScore + '%', emoji: '🏆', accent: false },
          { label: 'Time Spent',  value: d.totalTime,      emoji: '⏱️', accent: false },
        ].map(({ label, value, emoji, accent }) => (
          <div key={label} className={`rounded-2xl p-4 shadow-card ${accent ? 'bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] text-white' : 'bg-white dark:bg-[#16162a] border border-black/[0.06] dark:border-white/[0.06]'}`}>
            <div className="text-xl mb-1">{emoji}</div>
            <div className={`text-2xl font-bold font-display ${accent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            <div className={`text-[11px] font-medium mt-0.5 ${accent ? 'text-white/70' : 'text-gray-400'}`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card p-6 mb-4 fade-up">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5">Score Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={d.scoreTrend} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-[#1e1e35]" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              formatter={v => [v + '%', 'Score']} cursor={{ fill: '#4f6ef7', opacity: 0.05, radius: 8 }} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}
              fill="url(#barGrad)" />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f6ef7" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card p-6 fade-up">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5">Subject Performance</h3>
        <div className="flex flex-col gap-5">
          {d.subjectPerformance.map(({ subject, score, color }) => (
            <div key={subject}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{subject}</span>
                <span className="font-bold text-gray-900 dark:text-white">{score}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-[#1e1e35] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: score + '%', background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
