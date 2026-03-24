import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, Zap } from 'lucide-react'
import { demoQuizzes } from '../../data/demoData'
import { useTimer } from '../../hooks/useTimer'

const tagStyle = { BDS: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', MDS: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' }
const diffStyle = { Easy: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', Medium: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', Hard: 'bg-red-50 dark:bg-red-900/20 text-red-500' }

export default function QuizSession() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quiz = demoQuizzes.find(q => q._id === id) || demoQuizzes[0]
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null))

  const { formatted, isWarning } = useTimer(quiz.duration * 60, () => navigate('/result/demo'))

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

  const answeredCount = answers.filter(a => a !== null).length
  const correct = answers.filter((a, i) => a !== null && a === quiz.questions[i].correctIndex).length
  const wrong   = answers.filter((a, i) => a !== null && a !== quiz.questions[i].correctIndex).length
  const pct     = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0
  const circ    = 2 * Math.PI * 34
  const offset  = circ - (circ * pct) / 100

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0d0d14] px-4 py-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-4">

        {/* Main question panel */}
        <div className="flex-1 bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card p-7 fade-up">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${tagStyle[q.tag]}`}>{q.tag}</span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${diffStyle[q.difficulty]}`}>{q.difficulty}</span>
              <span className="text-sm font-semibold text-gray-400">Q{current + 1} / {total}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold transition-all
              ${isWarning
                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-500 animate-pulse'
                : 'border-[#4f6ef7]/20 bg-[#4f6ef7]/5 text-[#4f6ef7]'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-red-400' : 'bg-[#4f6ef7]'}`} />
              {formatted()}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-[#1e1e35] rounded-full mb-7 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / total) * 100}%`, background: 'linear-gradient(90deg, #4f6ef7, #7c3aed)' }} />
          </div>

          {/* Question */}
          <p className="text-[17px] font-semibold text-gray-900 dark:text-white leading-relaxed mb-7">{q.text}</p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const key   = String.fromCharCode(65 + i)
              const isCorrect = locked && i === q.correctIndex
              const isWrong   = locked && i === sel && sel !== q.correctIndex
              const isSelected = !locked && sel === i

              let wrapCls = 'border-black/[0.07] dark:border-white/[0.07] bg-gray-50/80 dark:bg-[#1e1e35] hover:border-[#4f6ef7]/40 hover:bg-[#4f6ef7]/5 cursor-pointer'
              let keyCls  = 'border-black/10 dark:border-white/10 text-gray-400 bg-white dark:bg-[#16162a]'
              if (isCorrect)  { wrapCls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'; keyCls = 'bg-emerald-500 border-emerald-500 text-white' }
              if (isWrong)    { wrapCls = 'border-red-400 bg-red-50 dark:bg-red-900/20'; keyCls = 'bg-red-400 border-red-400 text-white' }
              if (isSelected) { wrapCls = 'border-[#4f6ef7]/60 bg-[#4f6ef7]/8 dark:bg-[#4f6ef7]/10'; keyCls = 'bg-gradient-to-br from-[#4f6ef7] to-[#7c3aed] border-transparent text-white' }
              if (locked && !isCorrect && !isWrong) { wrapCls += ' opacity-40 cursor-default' }

              return (
                <div key={i} onClick={() => selectAnswer(i)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${wrapCls}`}>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${keyCls}`}>
                    {key}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt}</span>
                  {isCorrect && <span className="ml-auto text-emerald-500 text-lg">✓</span>}
                  {isWrong   && <span className="ml-auto text-red-400 text-lg">✗</span>}
                </div>
              )
            })}
          </div>

          {/* AI Explanation */}
          {locked && q.explanation && (
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#4f6ef7]/5 to-[#7c3aed]/5 border border-[#4f6ef7]/15 fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} className="text-[#4f6ef7]" />
                <span className="text-[11px] font-bold text-[#4f6ef7] uppercase tracking-wider">AI Explanation</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1e1e35] text-sm font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:border-[#4f6ef7]/40 hover:text-[#4f6ef7] transition-all">
              <ChevronLeft size={15} /> Prev
            </button>
            <span className="text-sm font-medium text-gray-400">{answeredCount} / {total} answered</span>
            {current < total - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed] text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 transition-all">
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button onClick={() => navigate('/result/demo')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg transition-all">
                <Flag size={14} /> Finish
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[270px] flex flex-col gap-4">

          {/* Score ring */}
          <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card p-5 fade-up">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live Score</h4>
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="38" cy="38" r="34" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-100 dark:text-[#1e1e35]" />
                  <circle cx="38" cy="38" r="34" fill="none" strokeWidth="5" strokeLinecap="round"
                    stroke="url(#grad)" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f6ef7" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[15px] font-bold font-display text-gray-900 dark:text-white">{pct}%</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Correct', correct, 'text-emerald-500', 'bg-emerald-50 dark:bg-emerald-900/20'],
                ['Wrong',   wrong,   'text-red-400',     'bg-red-50 dark:bg-red-900/20'],
                ['Left',    total - answeredCount, 'text-gray-400', 'bg-gray-50 dark:bg-[#1e1e35]']].map(([lbl, val, cls, bg]) => (
                <div key={lbl} className={`${bg} rounded-xl py-2.5`}>
                  <div className={`text-lg font-bold font-display ${cls}`}>{val}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question map */}
          <div className="bg-white dark:bg-[#16162a] rounded-3xl border border-black/[0.06] dark:border-white/[0.06] shadow-card p-5 fade-up">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Question Map</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: total }).map((_, i) => {
                const a = answers[i]
                const qItem = quiz.questions[i]
                let cls = 'border-black/[0.07] dark:border-white/[0.07] bg-gray-50 dark:bg-[#1e1e35] text-gray-400'
                if (i === current)  cls = 'border-transparent text-white shadow-glow'
                else if (a !== null) cls = a === qItem.correctIndex
                  ? 'border-transparent bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`aspect-square rounded-xl border text-[11px] font-bold transition-all hover:scale-105 ${cls}`}
                    style={i === current ? { background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)' } : {}}>
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3 mt-3 flex-wrap">
              {[['bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed]', 'Current'],
                ['bg-emerald-400', 'Correct'], ['bg-red-400', 'Wrong']].map(([bg, lbl]) => (
                <div key={lbl} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <div className={`w-2.5 h-2.5 rounded-md ${bg}`} />
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
