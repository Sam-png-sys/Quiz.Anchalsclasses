import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13]">
      <Navbar />
      <main className="md:ml-16 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
