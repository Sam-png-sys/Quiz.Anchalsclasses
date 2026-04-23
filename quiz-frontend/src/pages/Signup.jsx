import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "../utils/config";

export default function Signup() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [signupEmail, setSignupEmail] = useState(""); // 🔥 NEW

  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= SIGNUP =================
  const handleSignup = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          role: "admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Signup failed");
        return;
      }

      // 🔥 FIX: LOCK EMAIL
      setSignupEmail(form.email.trim());

      setStep("otp");

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerify = async () => {
  try {
    setLoading(true);

    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: signupEmail,
        otp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Invalid OTP");
      return;
    }

    // 🔥 NEW FLOW
    alert("Signup successful! Please login.");

    window.location.href = "/login";

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

          {/* FORM */}
          {step === "form" && (
            <>
              <input
                placeholder="Full Name"
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                placeholder="Phone Number"
                className="w-full p-3 mb-4 bg-[#111827] border border-gray-700 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 mb-6 bg-[#111827] border border-gray-700 rounded-lg"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
              >
                {loading ? "Creating..." : "Sign up"}
              </button>
            </>
          )}

          {/* OTP */}
          {step === "otp" && (
            <div>

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 mb-4 bg-[#111827] rounded-lg text-center"
              />

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 bg-green-500 rounded-lg"
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
            <Link to="/login" className="text-purple-400">
              Login
            </Link>
          </p>

        </div>
      </motion.div>

      {/* RIGHT SIDE SAME */}
      <motion.div className="w-1/2 flex items-center justify-center relative">
        <div className="absolute w-[300px] h-[300px] bg-purple-500 blur-[120px] opacity-30 rounded-full"></div>
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>
        </div>
      </motion.div>

    </div>
  );
}
