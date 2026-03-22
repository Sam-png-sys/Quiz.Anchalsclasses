import { demoLeaderboard } from '../../data/demoData'
import { Trophy, Medal } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'

const ME = 'u1'
const medals = ['🥇','🥈','🥉']
const podiumH = ['h-24','h-32','h-18']
const podiumBg = [
  'from-gray-400 to-gray-500',
  'from-amber-400 to-yellow-500',
  'from-orange-400 to-amber-500',
]

export default function Leaderboard() {
  const data   = demoLeaderboard
  const top3   = data.slice(0, 3)
  const myRank = data.findIndex(d => d.userId === ME) + 1
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <AppLayout>
      <div className="mb-7 fade-up">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-sm text-gray-400 mt-1">Top performers this month</p>
      </div>

      {/* Podium */}
      <div className="bg-gradient-to-br from-[#4f6ef7]/10 to-[#7c3aed]/10 dark:from-[#4f6ef7]/5 dark:to-[#7c3aed]/5 rounded-3xl border border-[#4f6ef7]/10 p-6 mb-5 fade-up">
        <div className="flex items-end justify-center gap-5">
          {podiumOrder.map((p, i) => p && (
            <div key={p.userId} className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#16162a] border-2 border-white dark:border-[#1e1e35] shadow-lg flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200">
                  {p.name.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 text-base">{medals[i === 0 ? 1 : i === 1 ? 0 : 2]}</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[70px] truncate">{p.name.split(' ')[0]}</p>
                <p className="text-xs font-bold text-[#4f6ef7]">{p.avgScore}%</p>
              </div>
              <div className={`w-20 ${i === 1 ? 'h-32' : i === 0 ? 'h-24' : 'h-16'} bg-gradient-to-b ${podiumBg[i === 0 ? 1 : i === 1 ? 0 : 2]} rounded-t-2xl flex items-start justify-center pt-2 text-white font-bold text-sm opacity-80`}>
                {i === 1 ? '1' : i === 0 ? '2' : '3'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {myRank > 0 && (
        <div className="flex items-center justify-center gap-2 mb-5 fade-up">
          <div className="flex items-center gap-2 py-2 px-5 bg-[#4f6ef7]/10 dark:bg-[#4f6ef7]/10 rounded-full border border-[#4f6ef7]/20">
            <Trophy size={14} className="text-[#4f6ef7]" />
            <span className="text-sm font-bold text-[#4f6ef7]">Your rank: #{myRank}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 fade-up">
        {data.map((entry, i) => {
          const isMe = entry.userId === ME
          return (
            <div key={entry.userId}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all
                ${isMe
                  ? 'border-[#4f6ef7]/30 bg-gradient-to-r from-[#4f6ef7]/5 to-[#7c3aed]/5 shadow-sm'
                  : 'border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#16162a]'}`}>
              <div className={`w-8 text-sm font-bold text-center flex-shrink-0 font-display
                ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4f6ef7]/20 to-[#7c3aed]/20 flex items-center justify-center text-sm font-bold text-[#4f6ef7] flex-shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {entry.name}
                  {isMe && <span className="ml-1.5 text-[10px] font-bold text-[#4f6ef7] bg-[#4f6ef7]/10 px-2 py-0.5 rounded-full">You</span>}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{entry.attempts} attempts</div>
              </div>
              <div className="text-base font-bold font-display text-[#4f6ef7]">{entry.avgScore}%</div>
            </div>
          )
        })}
      </div>
    </AppLayout>
  )
}
