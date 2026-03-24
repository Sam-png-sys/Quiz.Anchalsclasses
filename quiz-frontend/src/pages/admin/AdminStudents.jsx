import { useState } from 'react'
import { Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { demoStudents } from '../../data/demoData'
import AppLayout from '../../components/layout/AppLayout'

export default function AdminStudents() {
  const [students, setStudents] = useState(demoStudents)
  const [search, setSearch]     = useState('')

  const toggleAccess = (id) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s))
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  )

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Students</h1>
        <span className="text-sm text-gray-400">{students.length} registered</span>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#18181f] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#185fa5] transition-all" />
      </div>

      <div className="bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
          {['Student', 'Phone', 'Branch / Year', 'Access'].map(h => (
            <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {filtered.map(s => (
            <div key={s._id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-[#222230] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xs font-bold text-[#185fa5] dark:text-[#378add] flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{s.phone}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{s.branch} · {s.year}</span>
              <button onClick={() => toggleAccess(s._id)}
                className={`transition-colors ${s.isActive ? 'text-green-500 hover:text-green-600' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'}`}>
                {s.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
