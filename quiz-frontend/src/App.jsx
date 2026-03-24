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

      <div className="absolute w-[500px] h-[500px] bg-purple-500 blur-[120px] opacity-20 rounded-full"></div>

      <div className="relative bg-[#111827]/60 backdrop-blur-xl p-8 rounded-2xl w-96 border border-gray-800 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-purple-400 mb-6">
          Create Account
        </h1>

        <input
          placeholder="Name"
          className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-transparent"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-700 rounded-lg bg-transparent"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-700 rounded-lg bg-transparent"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold
                     hover:shadow-[0_0_25px_#A855F780]"
        >
          Sign Up
        </button>

        {/* Switch */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}