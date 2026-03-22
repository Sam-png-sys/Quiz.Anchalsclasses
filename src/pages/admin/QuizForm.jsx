import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, X, CheckSquare } from 'lucide-react'
import { createQuiz, updateQuiz, getQuizById, getQuestions } from '../../api/services'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

const EMPTY = { title: '', tag: 'BDS', difficulty: 'Medium', duration: 10, branch: '', year: '', section: '', isOpen: true, questionIds: [] }

export default function QuizForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm]         = useState(EMPTY)
  const [questions, setQuestions] = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    getQuestions().then(res => setQuestions(res.data))
    if (isEdit) getQuizById(id).then(res => setForm(res.data))
  }, [id])

  const toggleQ = (qId) => {
    setForm(f => ({
      ...f,
      questionIds: f.questionIds.includes(qId)
        ? f.questionIds.filter(x => x !== qId)
        : [...f.questionIds, qId],
    }))
  }

  const filtered = questions.filter(q => {
    const matchTag = form.tag === 'All' || q.tag === form.tag
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Title required')
    if (form.questionIds.length < 1) return toast.error('Select at least 1 question')
    setLoading(true)
    try {
      if (isEdit) await updateQuiz(id, form)
      else await createQuiz(form)
      toast.success(isEdit ? 'Quiz updated!' : 'Quiz created!')
      navigate('/admin')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">← Back</button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit' : 'Create'} Quiz</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* Left: Quiz settings */}
        <div className="bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Quiz Details</h3>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. NEET MDS Mock Test 1"
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-[#185fa5] transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tag', key: 'tag', opts: ['BDS', 'MDS'] },
              { label: 'Difficulty', key: 'difficulty', opts: ['Easy', 'Medium', 'Hard'] },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-sm outline-none focus:border-[#185fa5] transition-all text-gray-900 dark:text-gray-100">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duration (minutes)</label>
            <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} min={1}
              className="w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-sm outline-none focus:border-[#185fa5] transition-all text-gray-900 dark:text-gray-100" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['branch', 'year', 'section'].map(key => (
              <div key={key}>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 capitalize">{key}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={key === 'branch' ? 'BDS' : key === 'year' ? '2nd' : 'A'}
                  className="w-full px-3 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-sm outline-none focus:border-[#185fa5] transition-all text-gray-900 dark:text-gray-100" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-[#222230] rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Quiz Status</div>
              <div className="text-xs text-gray-400">{form.isOpen ? 'Students can take this quiz' : 'Hidden from students'}</div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, isOpen: !f.isOpen }))}
              className={`w-11 h-6 rounded-full transition-all duration-300 relative ${form.isOpen ? 'bg-[#185fa5] dark:bg-[#378add]' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.isOpen ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="pt-2">
            <div className="text-xs text-gray-400 mb-3">{form.questionIds.length} questions selected</div>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </div>

        {/* Right: Question picker */}
        <div className="bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Select Questions</h3>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50 dark:bg-[#222230] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#185fa5] transition-all" />
          </div>

          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map(q => {
              const selected = form.questionIds.includes(q._id)
              return (
                <div key={q._id} onClick={() => toggleQ(q._id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                    ${selected ? 'border-[#185fa5]/30 bg-blue-50 dark:bg-blue-900/10' : 'border-black/[0.06] dark:border-white/[0.06] hover:border-[#185fa5]/30'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${selected ? 'bg-[#185fa5] dark:bg-[#378add]' : 'border border-black/10 dark:border-white/10'}`}>
                    {selected && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{q.text}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <Badge value={q.tag} type="tag" />
                      <Badge value={q.difficulty} type="difficulty" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
