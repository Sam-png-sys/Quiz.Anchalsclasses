import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 SIGNUP → SEND OTP (CORRECT FLOW)
  const handleSignup = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          role: "admin", // 🔥 web = admin
        }),
      });

      const data = await res.json();
      console.log("SIGNUP RESPONSE:", data);

      if (!res.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      // ✅ move to OTP step
      setStep("otp");

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VERIFY OTP
  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: form.phone,
          otp,
        }),
      });

      const data = await res.json();
      console.log("VERIFY RESPONSE:", data);

      if (!res.ok) {
        alert(data.detail || "Invalid OTP");
        return;
      }

      localStorage.setItem("token", data.access_token);
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

          <h1 className="text-4xl font-semibold mb-2">
            Create Account
          </h1>

          <p className="text-gray-400 mb-8">
            Start your journey with us.
          </p>

          {/* ================= FORM ================= */}
          {step === "form" && (
            <>
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
                placeholder="Phone Number"
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-purple-400 outline-none"
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
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
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold
                           hover:shadow-[0_0_25px_#A855F780] disabled:opacity-50"
              >
                {loading ? "Creating..." : "Sign up"}
              </button>
            </>
          )}

          {/* ================= OTP ================= */}
          {step === "otp" && (
            <div className="animate-fadeIn">

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg 
                           focus:ring-2 focus:ring-purple-400 outline-none text-center tracking-widest"
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
                ← Edit details
              </p>
            </div>
          )}

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
        className="w-1/2 flex items-center justify-center relative"
      >
        <div className="absolute w-[300px] h-[300px] bg-purple-500 blur-[120px] opacity-30 rounded-full"></div>

        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>
        </div>
      </motion.div>

    </div>
  );
}