import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4 }}
      className="h-screen flex items-center justify-center"
    >
      <div className="bg-[#111827]/70 backdrop-blur-xl p-8 rounded-2xl w-96 border border-gray-800 shadow-2xl">

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
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold
                     hover:shadow-[0_0_25px_#A855F780]"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </motion.div>
  );
}