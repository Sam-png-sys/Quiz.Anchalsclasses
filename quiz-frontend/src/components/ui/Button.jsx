export default function Button({ children, variant = 'primary', className = '', disabled, onClick, type = 'button' }) {
  const base = 'font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'w-full py-3 bg-[#185fa5] dark:bg-[#378add] text-white hover:opacity-90',
    ghost:   'w-full py-3 border border-[#185fa5] dark:border-[#378add] text-[#185fa5] dark:text-[#378add] hover:bg-blue-50 dark:hover:bg-blue-900/10',
    outline: 'px-5 py-2.5 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#222230] text-gray-700 dark:text-gray-300 hover:border-[#185fa5] hover:text-[#185fa5]',
    danger:  'px-5 py-2.5 bg-red-500 text-white hover:bg-red-600',
    success: 'px-5 py-2.5 bg-green-600 text-white hover:bg-green-700',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
