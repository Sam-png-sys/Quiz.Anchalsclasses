import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "/dashboard";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A]">

      <div className="bg-[#111827] p-8 rounded-2xl w-96 border border-gray-800 shadow-xl">

        <h1 className="mb-6 text-2xl font-bold text-center text-cyan-400">
          Admin Login
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-cyan-400 text-black rounded-lg font-semibold
                     hover:shadow-[0_0_25px_#00E5FF80] transition"
        >
          Login
        </button>

        <p className="mt-4 text-center text-gray-500">
          Don’t have an account?{" "}
          <a href="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}