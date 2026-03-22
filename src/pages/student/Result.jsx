import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, MinusCircle, Home, RotateCcw } from 'lucide-react'
import { demoQuizzes, demoQuestions } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const demoAttempt = {
  score: 8, total: 12, correct: 8, wrong: 3, skipped: 1,
  timeTaken: 542, createdAt: new Date().toISOString(),
  quiz: demoQuizzes[0],
  answers: demoQuestions.map((q, i) => ({
    ...q,
    selected: i === 11 ? null : i % 4 === 1 ? (q.correctIndex + 1) % 4 : q.correctIndex,
  })),
}

export default function Result() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const { score, total, correct, wrong, skipped, timeTaken, quiz, answers } = demoAttempt
  const pct   = Math.round((correct / total) * 100)
  const grade = pct >= 80 ? { label: 'Excellent!',       emoji: '🏆', color: 'text-green-600' }
    : pct >= 60           ? { label: 'Good Job!',         emoji: '👍', color: 'text-blue-600' }
    :                       { label: 'Keep Practicing',   emoji: '💪', color: 'text-amber-600' }

  return (
    <AppLayout>
      <div className="flex gap-2 mb-6">
        {['overview', 'review'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-[#185fa5] dark:bg-[#378add] text-white' : 'bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] text-gray-500 hover:border-[#185fa5]'}`}>
            {t === 'overview' ? '📊 Overview' : '📝 Review'}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="flex flex-col gap-4">
          <Card className="text-center py-8">
            <div className="text-5xl mb-2">{grade.emoji}</div>
            <div className={`text-3xl font-bold mb-1 ${grade.color}`}>{pct}%</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{grade.label}</div>
            <div className="text-sm text-gray-400">{quiz.title}</div>
            <div className="grid grid-cols-3 gap-3 mt-6 max-w-xs mx-auto">
              {[['Correct', correct, CheckCircle, 'text-green-500'],
                ['Wrong',   wrong,   XCircle,     'text-red-400'],
                ['Skipped', skipped, MinusCircle, 'text-gray-400']].map(([lbl, val, Icon, cls]) => (
                <div key={lbl} className="bg-gray-50 dark:bg-[#222230] rounded-xl p-3">
                  <Icon size={18} className={`${cls} mx-auto mb-1`} />
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{val}</div>
                  <div className="text-[11px] text-gray-400">{lbl}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">Score Breakdown</h3>
            {[['Score', `${score} / ${total}`],
              ['Time Taken', `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`],
              ['Date', new Date(demoAttempt.createdAt).toLocaleDateString()]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{k}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v}</span>
              </div>
            ))}
          </Card>

          <div className="flex gap-3">
            <button onClick={() => navigate('/home')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#18181f] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#185fa5] hover:text-[#185fa5] transition-all">
              <Home size={16} /> Home
            </button>
            <button onClick={() => navigate(`/quiz/${quiz._id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#185fa5] dark:bg-[#378add] text-white text-sm font-semibold hover:opacity-90 transition-all">
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {answers.map((ans, i) => {
            const isCorrect = ans.selected === ans.correctIndex
            const isSkipped = ans.selected === null
            return <ReviewCard key={i} index={i} ans={ans} isCorrect={isCorrect} isSkipped={isSkipped} />
          })}
        </div>
      )}
    </AppLayout>
  )
}

function ReviewCard({ index, ans, isCorrect, isSkipped }) {
  const [open, setOpen] = useState(false)
  const borderCls = isSkipped ? 'border-l-gray-300' : isCorrect ? 'border-l-green-500' : 'border-l-red-400'
  const icon = isSkipped ? <MinusCircle size={16} className="text-gray-400" />
    : isCorrect  ? <CheckCircle size={16} className="text-green-500" />
    : <XCircle size={16} className="text-red-400" />

  return (
    <div className={`bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] border-l-4 ${borderCls} rounded-xl p-4 cursor-pointer`}
      onClick={() => setOpen(o => !o)}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-gray-400">Q{index + 1}</span>
            <Badge value={ans.tag} type="tag" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{ans.text}</p>
          {open && (
            <div className="mt-3 space-y-1.5">
              {ans.options.map((opt, i) => (
                <div key={i} className={`text-sm px-3 py-2 rounded-lg
                  ${i === ans.correctIndex ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                  : i === ans.selected    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300'
                  : 'text-gray-500 dark:text-gray-400'}`}>
                  {String.fromCharCode(65 + i)}. {opt}
                </div>
              ))}
              {ans.explanation && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-[#222230] rounded-lg border-l-2 border-[#0f6e56] dark:border-[#1d9e75]">
                  <span className="text-[10px] font-bold text-[#0f6e56] dark:text-[#1d9e75] uppercase tracking-wider block mb-1">AI Explanation</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{ans.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}