import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { createQuestion, updateQuestion, getQuestions } from '../../api/services'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

const EMPTY = {
  text: '', tag: 'BDS', difficulty: 'Medium', subject: '',
  options: ['', '', '', ''], correctIndex: 0, explanation: '',
}

export default function QuestionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm]     = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      getQuestions()
        .then(res => {
          const q = res.data.find(q => q._id === id)
          if (q) setForm(q)
        })
    }
  }, [id])

  const setOpt = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm(f => ({ ...f, options: opts }))
  }

  const addOption = () => {
    if (form.options.length >= 6) return
    setForm(f => ({ ...f, options: [...f.options, ''] }))
  }

  const removeOption = (i) => {
    if (form.options.length <= 2) return
    const opts = form.options.filter((_, idx) => idx !== i)
    setForm(f => ({ ...f, options: opts, correctIndex: Math.min(f.correctIndex, opts.length - 1) }))
  }

  const handleSubmit = async () => {
    if (!form.text.trim()) return toast.error('Question text required')
    if (form.options.some(o => !o.trim())) return toast.error('Fill all options')
    setLoading(true)
    try {
      if (isEdit) await updateQuestion(id, form)
      else await createQuestion(form)
      toast.success(isEdit ? 'Updated!' : 'Question added!')
      navigate('/admin/questions')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin/questions')} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">← Back</button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit' : 'Add'} Question</h1>
        </div>

        <div className="bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-6 flex flex-col gap-5">

          {/* Question text */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Question Text</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              rows={3} placeholder="Enter the question..."
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none resize-none focus:border-[#185fa5] dark:focus:border-[#378add] transition-all" />
          </div>

          {/* Tag + Difficulty + Subject */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tag', key: 'tag', opts: ['BDS', 'MDS'] },
              { label: 'Difficulty', key: 'difficulty', opts: ['Easy', 'Medium', 'Hard'] },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
                <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-[#185fa5] transition-all">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Oral Anatomy"
                className="w-full px-3 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-[#185fa5] transition-all" />
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Options (select correct)</label>
              <button onClick={addOption} className="text-xs text-[#185fa5] dark:text-[#378add] flex items-center gap-1 hover:underline">
                <Plus size={12} /> Add option
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {form.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${form.correctIndex === i ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-black/[0.07] dark:border-white/[0.07]'}`}>
                  <button onClick={() => setForm(f => ({ ...f, correctIndex: i }))}
                    className={`flex-shrink-0 transition-colors ${form.correctIndex === i ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}>
                    <CheckCircle size={18} />
                  </button>
                  <span className="w-6 text-xs font-bold text-gray-400 flex-shrink-0">{String.fromCharCode(65 + i)}</span>
                  <input value={opt} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400" />
                  {form.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Explanation <span className="text-gray-300 normal-case font-normal">(shown after answer)</span>
            </label>
            <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              rows={3} placeholder="Explain why the correct answer is correct..."
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none resize-none focus:border-[#185fa5] transition-all" />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Question' : 'Add Question'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
