import { difficultyClass, tagClass } from '../../utils/helpers'

export default function Badge({ type = 'tag', value, className = '' }) {
  const cls = type === 'difficulty' ? difficultyClass(value) : tagClass(value)
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide ${cls} ${className}`}>
      {value}
    </span>
  )
}
