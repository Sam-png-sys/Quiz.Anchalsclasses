export default function Input({ label, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08]
          bg-gray-50 dark:bg-[#222230] text-gray-900 dark:text-gray-100
          text-sm outline-none transition-all duration-200
          focus:border-[#185fa5] dark:focus:border-[#378add]
          placeholder:text-gray-400 dark:placeholder:text-gray-600 ${className}`}
        {...props}
      />
    </div>
  )
}
