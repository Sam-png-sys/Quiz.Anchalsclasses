import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { demoAnalytics } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'

export default function Analytics() {
  const data = demoAnalytics
  return (
    <AppLayout>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tests Taken', value: data.totalAttempts },
          { label: 'Avg Score',   value: data.avgScore + '%', accent: true },
          { label: 'Best Score',  value: data.bestScore + '%' },
          { label: 'Time Spent',  value: data.totalTime },
        ].map(({ label, value, accent }) => (
          <Card key={label} className="text-center">
            <div className={`text-2xl font-bold ${accent ? 'text-[#185fa5] dark:text-[#378add]' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Score Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.scoreTrend} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 12 }} formatter={v => [v + '%', 'Score']} />
            <Bar dataKey="score" fill="#185fa5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Subject Performance</h3>
        <div className="flex flex-col gap-4">
          {data.subjectPerformance.map(({ subject, score, color }) => (
            <div key={subject}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600 dark:text-gray-300 font-medium">{subject}</span>
                <span className="font-bold text-gray-900 dark:text-white">{score}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-[#222230] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: score + '%', background: color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  )
}
