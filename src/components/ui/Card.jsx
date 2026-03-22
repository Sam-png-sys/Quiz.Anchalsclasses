export default function Card({ children, className = '', padding = true, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white dark:bg-[#18181f] border border-black/[0.07] dark:border-white/[0.07] rounded-xl ${padding ? 'p-5' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}