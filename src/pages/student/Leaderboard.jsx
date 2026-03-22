import { demoLeaderboard } from '../../data/demoData'
import { Trophy } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

const ME = 'u1'

export default function Leaderboard() {
  const data   = demoLeaderboard
  const top3   = data.slice(0, 3)
  const myRank = data.findIndex(d => d.userId === ME) + 1

  const podiumOrder   = [top3[1], top3[0], top3[2]]
  const podiumHeights = ['h-20', 'h-28', 'h-16']
  const podiumColors  = ['bg-gray-400', 'bg-amber-400', 'bg-orange-400']
  const podiumEmoji   = ['🥈', '🥇', '🥉']

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <span className="text-sm text-gray-400">Top performers this month</span>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 py-4">
        {podiumOrder.map((p, i) => p && (
          <div key={p.userId} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#222230] flex items-center justify-center text-lg font-bold border-2 border-white dark:border-[#18181f]">
              {p.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[64px] text-center truncate">{p.name}</span>
            <span className="text-xs font-bold text-[#185fa5] dark:text-[#378add]">{p.avgScore}%</span>
            <div className={`w-20 ${podiumHeights[i]} ${podiumColors[i]} rounded-t-xl flex items-center justify-center text-lg`}>
              {podiumEmoji[i]}
            </div>
          </div>
        ))}
      </div>

      {myRank > 0 && (
        <div className="flex items-center justify-center gap-2 mb-5 py-2.5 px-5 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto border border-[#185fa5]/20">
          <Trophy size={14} className="text-[#185fa5] dark:text-[#378add]" />
          <span className="text-sm font-semibold text-[#185fa5] dark:text-[#378add]">Your rank: #{myRank}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {data.map((entry, i) => {
          const isMe = entry.userId === ME
          return (
            <div key={entry.userId}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all
                ${isMe ? 'border-[#185fa5]/30 bg-blue-50 dark:bg-blue-900/10' : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#18181f]'}`}>
              <div className={`w-7 text-sm font-bold text-center flex-shrink-0 ${i < 3 ? 'text-amber-500' : 'text-gray-400'}`}>#{i + 1}</div>
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#222230] flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {entry.name} {isMe && <span className="text-xs text-[#185fa5] dark:text-[#378add] font-normal">(You)</span>}
                </div>
                <div className="text-xs text-gray-400">{entry.attempts} attempts</div>
              </div>
              <div className="text-base font-bold text-[#185fa5] dark:text-[#378add] flex-shrink-0">{entry.avgScore}%</div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
