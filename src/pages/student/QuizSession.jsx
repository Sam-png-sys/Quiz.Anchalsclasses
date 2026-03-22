import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { demoQuizzes } from '../../data/demoData'
import { useTimer } from '../../hooks/useTimer'
import Badge from '../../components/ui/Badge'

export default function QuizSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quiz = demoQuizzes.find(q => q._id === id) || demoQuizzes[0]
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null))

  const { formatted, isWarning } = useTimer(quiz.duration * 60, () => handleSubmit())

  const q      = quiz.questions[current]
  const total  = quiz.questions.length
  const sel    = answers[current]
  const locked = sel !== null

  const selectAnswer = (idx) => {
    if (locked) return
    const updated = [...answers]
    updated[current] = idx
    setAnswers(updated)
  }

  const handleSubmit = () => navigate('/result/demo')

  const answeredCount = answers.filter(a => a !== null).length
  const correct = answers.filter((a, i) => a !== null && a === quiz.questions[i].correctIndex).length
  const wrong   = answers.filter((a, i) => a !== null && a !== quiz.questions[i].correctIndex).length
  const pct     = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0
  const circ    = 2 * Math.PI * 36
  const offset  = circ - (circ * pct) / 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] px-4 py-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-4">

        {/* Main */}
        <div className="flex-1 bg-white dark:bg-[#18181f] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge value={q.tag} type="tag" />
              <Badge value={q.difficulty} type="difficulty" />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Q{current + 1} / {total}</span>
            </div>
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
              ${isWarning ? 'border-red-400 text-red-400 animate-pulse' : 'border-[#185fa5] dark:border-[#378add] text-[#185fa5] dark:text-[#378add]'}`}>
              {formatted()}
            </div>
          </div>

          <div className="h-1 bg-gray-100 dark:bg-[#222230] rounded-full mb-7 overflow-hidden">
            <div className="h-full bg-[#185fa5] dark:bg-[#378add] rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>

          <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-6">{q.text}</p>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              let cls = 'border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] hover:border-[#185fa5] hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer'
              if (locked) {
                if (i === q.correctIndex)      cls = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                else if (i === sel)            cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                else                          cls = 'border-black/[0.05] dark:border-white/[0.05] opacity-50 cursor-default'
              } else if (sel === i) {
                cls = 'border-[#185fa5] bg-blue-50 dark:bg-blue-900/20'
              }
              return (
                <div key={i} onClick={() => selectAnswer(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${cls}`}>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                    ${locked && i === q.correctIndex ? 'bg-green-500 border-green-500 text-white'
                    : locked && i === sel ? 'bg-red-400 border-red-400 text-white'
                    : sel === i ? 'bg-[#185fa5] border-[#185fa5] text-white'
                    : 'border-black/10 dark:border-white/10 text-gray-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm font-medium">{opt}</span>
                </div>
              )
            })}
          </div>

          {locked && q.explanation && (
            <div className="mt-5 p-4 bg-gray-50 dark:bg-[#222230] rounded-xl border-l-4 border-[#0f6e56] dark:border-[#1d9e75]">
              <span className="block text-[10px] font-bold text-[#0f6e56] dark:text-[#1d9e75] uppercase tracking-wider mb-1.5">AI Explanation</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-7 pt-5 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-sm font-medium text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-[#185fa5] hover:text-[#185fa5] transition-all">
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-gray-400">{answeredCount} of {total} answered</span>
            {current < total - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#185fa5] dark:bg-[#378add] text-white text-sm font-semibold hover:opacity-90 transition-all">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all">
                <Flag size={15} /> Finish
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#18181f] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] p-5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Live Score</h4>
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-[#222230]" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                    className="text-[#185fa5] dark:text-[#378add]"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-gray-900 dark:text-white">{pct}%</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Correct', correct, 'text-green-600 dark:text-green-400'],
                ['Wrong',   wrong,   'text-red-500 dark:text-red-400'],
                ['Skipped', total - answeredCount, 'text-gray-400']].map(([lbl, val, cls]) => (
                <div key={lbl} className="bg-gray-50 dark:bg-[#222230] rounded-lg py-2">
                  <div className={`text-lg font-bold ${cls}`}>{val}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181f] rounded-2xl border border-black/[0.07] dark:border-white/[0.07] p-5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Question Map</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: total }).map((_, i) => {
                const a = answers[i]
                const qItem = quiz.questions[i]
                let cls = 'border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-400'
                if (i === current) cls = 'border-[#185fa5] dark:border-[#378add] bg-blue-50 dark:bg-blue-900/20 text-[#185fa5] dark:text-[#378add]'
                else if (a !== null) cls = a === qItem.correctIndex
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`aspect-square rounded-lg border text-[11px] font-semibold transition-all hover:scale-105 ${cls}`}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
