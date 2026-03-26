import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, role: "admin" }),
    });

    window.location.href = "/login";
  };

  return (
    <div className="h-screen w-full flex bg-[#0B0F1A] text-white">

      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ duration: 0.5 }}
        className="w-1/2 flex items-center justify-center"
      >
        <div className="w-[380px]">

          <h1 className="text-4xl font-semibold mb-2">
            Create Account
          </h1>

          <p className="text-gray-400 mb-8">
            Start your journey with us.
          </p>

          <input
            placeholder="Full Name"
            className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-purple-400 outline-none"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-purple-400 outline-none"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-purple-400 outline-none"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            onClick={handleSignup}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold
                       hover:shadow-[0_0_25px_#A855F780]"
          >
            Sign up
          </button>

          <p className="text-gray-400 text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:underline">
              Login
            </Link>
          </p>

        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5 }}
        className="w-1/2 flex items-center justify-center relative"
      >

        {/* Glow background */}
        <div className="absolute w-[300px] h-[300px] bg-purple-500 blur-[120px] opacity-30 rounded-full"></div>

        {/* Main orb */}
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">

          {/* Half reflection */}
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>

        </div>

      </motion.div>

    </div>
  );
}