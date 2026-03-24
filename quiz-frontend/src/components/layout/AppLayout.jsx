import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#0d0d14]">
      <Navbar />
      <main className="md:ml-[70px] pb-28 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-7">
          {children}
        </div>
      </main>
    </div>
  )
}
