import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { demoQuestions } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

export default function AdminQuestions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(demoQuestions)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('All')

  const handleDelete = (id) => {
    if (!window.confirm('Delete this question?')) return
    setQuestions(prev => prev.filter(q => q._id !== id))
  }

  const filtered = questions.filter(q => {
    const matchTag    = filter === 'All' || q.tag === filter
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Questions</h1>
        <button onClick={() => navigate('/admin/questions/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#185fa5] dark:bg-[#378add] text-white text-sm font-semibold hover:opacity-90 transition-all">
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#18181f] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#185fa5] transition-all" />
        </div>
        <div className="flex gap-1.5">
          {['All', 'BDS', 'MDS'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-[#185fa5] dark:bg-[#378add] text-white' : 'bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] text-gray-500 hover:border-[#185fa5]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-3">{filtered.length} questions</div>

      <div className="flex flex-col gap-2">
        {filtered.map((q, i) => (
          <Card key={q._id} padding={false} className="flex items-start gap-4 p-4">
            <span className="text-xs font-bold text-gray-300 dark:text-gray-600 mt-1 w-6 flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 leading-relaxed">{q.text}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge value={q.tag} type="tag" />
                <Badge value={q.difficulty} type="difficulty" />
                <span className="text-xs text-gray-400">{q.options.length} options</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => navigate(`/admin/questions/edit/${q._id}`)}
                className="w-8 h-8 rounded-lg border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-[#185fa5] hover:border-[#185fa5] transition-all">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(q._id)}
                className="w-8 h-8 rounded-lg border border-black/[0.07] dark:border-white/[0.07] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
