import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";



export default function Login() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);

  //  LOGIN → SEND OTP
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      //  move to OTP step
      setPhone(data.phone);
      setStep("otp");

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  //  VERIFY OTP
  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      console.log("VERIFY RESPONSE:", data);

      if (!res.ok) {
        alert(data.detail || "Invalid OTP");
        return;
      }

      //  SAVE TOKEN
      localStorage.setItem("token", data.access_token);

      //  REDIRECT
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      alert("Server error");
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

          <h1 className="text-4xl font-semibold mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">
            Please enter your details.
          </p>

          {/* ================= FORM ================= */}
          {step === "form" && (
            <>
              <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none"
              />

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-semibold
                           hover:shadow-[0_0_25px_#00E5FF80] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </>
          )}

          {/* ================= OTP STEP ================= */}
          {step === "otp" && (
            <div className="animate-fadeIn">

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-cyan-400 outline-none text-center tracking-widest"
              />

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black rounded-lg font-semibold
                           disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p
                className="text-sm text-gray-400 mt-4 text-center cursor-pointer"
                onClick={() => setStep("form")}
              >
                ← Go back
              </p>
            </div>
          )}

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