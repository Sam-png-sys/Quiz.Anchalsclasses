export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-10">

      <h1 className="mb-8 text-3xl font-bold text-cyan-400">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <Card title="Quizzes" value="10" />
        <Card title="Students" value="250" />
        <Card title="Attempts" value="1200" />

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-[#111827] p-6 rounded-xl border border-gray-800 
                    hover:shadow-[0_0_20px_#00E5FF40] transition">
      <p className="text-gray-400">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-cyan-400">{value}</h2>
    </div>
  );
}