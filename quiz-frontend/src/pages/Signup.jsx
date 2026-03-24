import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "admin" }),
    });

    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A]">

      <div className="bg-[#111827] p-8 rounded-2xl w-96 border border-gray-800 shadow-xl">

        <h1 className="mb-6 text-2xl font-bold text-center text-cyan-400">
          Create Account
        </h1>

        <input
          placeholder="Name"
          className="w-full p-3 mb-4 bg-transparent border border-gray-700 rounded-lg"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 bg-transparent border border-gray-700 rounded-lg"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-transparent border border-gray-700 rounded-lg"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-cyan-400 text-black rounded-lg font-semibold
                     hover:shadow-[0_0_25px_#00E5FF80]"
        >
          Sign Up
        </button>

      </div>
    </div>
  );
}