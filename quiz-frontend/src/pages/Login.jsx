import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Login() {
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
        {/* INNER CARD (MOVED INSIDE) */}
        <div className="w-[380px]">

          <h1 className="text-4xl font-semibold mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">
            Please enter your details.
          </p>

          <input
            placeholder="Email"
            className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-cyan-400 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                       focus:ring-2 focus:ring-cyan-400 outline-none"
          />

          <div className="flex justify-between text-sm text-gray-400 mb-6">
            <span>Remember me</span>
            <span className="hover:text-cyan-400 cursor-pointer">
              Forgot password
            </span>
          </div>

          <button
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-semibold
                       hover:shadow-[0_0_25px_#00E5FF80]"
          >
            Sign in
          </button>

          <p className="text-gray-400 text-sm mt-6 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-cyan-400">
              Sign up
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

        {/* GLOW BACKGROUND */}
        <div className="absolute w-[300px] h-[300px] bg-purple-500 blur-[120px] opacity-30 rounded-full"></div>

        {/* MAIN ORB */}
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">

          {/* HALF BLUR REFLECTION */}
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>

        </div>

      </motion.div>

    </div>
  );
}