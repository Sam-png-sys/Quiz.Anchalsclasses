import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4 }}
      className="h-screen flex items-center justify-center"
    >
      <div className="bg-[#111827]/70 backdrop-blur-xl p-8 rounded-2xl w-96 border border-gray-800 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">
          Welcome Back
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 mb-4 bg-transparent border border-gray-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 bg-transparent border border-gray-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-semibold
                     hover:shadow-[0_0_25px_#00E5FF80]"
        >
          Login
        </button>

        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </motion.div>
  );
}