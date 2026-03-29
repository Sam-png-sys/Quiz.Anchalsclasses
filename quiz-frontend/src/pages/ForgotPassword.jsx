import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 SEND OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);

      await apiRequest("/auth/forgot-password", "POST", {
        phone,
      });

      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESET PASSWORD
  const handleReset = async () => {
    try {
      setLoading(true);

      await apiRequest("/auth/reset-password", "POST", {
        phone,
        otp,
        password,
      });

      alert("Password reset successful 🔥");
      window.location.href = "/login";
    } catch (err) {
      alert("Invalid OTP or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#0B0F1A] text-white">

      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center"
      >
        <div className="w-[380px]">

          <h1 className="text-4xl font-semibold mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-400 mb-8">
            Reset your password via OTP
          </p>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-semibold
                           hover:shadow-[0_0_25px_#00E5FF80] disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div>

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none text-center tracking-widest"
              />

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black rounded-lg font-semibold
                           disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p
                className="text-sm text-gray-400 mt-4 text-center cursor-pointer"
                onClick={() => setStep(1)}
              >
                ← Go back
              </p>
            </div>
          )}

          <p className="text-gray-400 text-sm mt-6 text-center">
            Remember your password?{" "}
            <Link to="/login" className="text-cyan-400">
              Login
            </Link>
          </p>

        </div>
      </motion.div>

      {/* RIGHT SIDE (SAME AS LOGIN) */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center relative"
      >
        <div className="absolute w-[300px] h-[300px] bg-purple-500 blur-[120px] opacity-30 rounded-full"></div>

        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>
        </div>
      </motion.div>

    </div>
  );
}