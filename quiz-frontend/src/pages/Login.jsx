import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE } from "../utils/config";

export default function Login() {
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

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
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Invalid OTP");
        return;
      }

      // Always save token
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
    <div className="h-screen w-full flex" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>

      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center"
      >
        <div className="w-[380px]">

          <h1 className="text-4xl font-semibold mb-2" style={{ color: "var(--app-text)" }}>Welcome back</h1>
          <p className="mb-8" style={{ color: "var(--app-text-muted)" }}>
            Please enter your details.
          </p>

          {/* ================= FORM ================= */}
          {step === "form" && (
            <>
              <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg outline-none"
                style={{
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  color: "var(--app-text)",
                  boxShadow: "0 0 0 0 transparent",
                }}
              />

              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg outline-none"
                style={{
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  color: "var(--app-text)",
                }}
              />

              {/* Forgot password */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
                  color: "#fff",
                  boxShadow: "0 18px 32px var(--accent-glow)",
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </>
          )}

          {/* ================= OTP STEP ================= */}
          {step === "otp" && (
            <div>
              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 mb-6 rounded-lg outline-none text-center tracking-widest"
                style={{
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  color: "var(--app-text)",
                }}
              />

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
                  color: "#fff",
                }}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p
                className="text-sm mt-4 text-center cursor-pointer"
                style={{ color: "var(--app-text-muted)" }}
                onClick={() => setStep("form")}
              >
                ← Go back
              </p>
            </div>
          )}

          <p className="text-sm mt-6 text-center" style={{ color: "var(--app-text-muted)" }}>
            Admin access is managed internally. Use your assigned login credentials.
          </p>

        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center relative"
      >
        <div
          className="absolute w-[300px] h-[300px] blur-[120px] opacity-30 rounded-full"
          style={{ background: "var(--accent)" }}
        />

        <div
          className="relative w-64 h-64 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent))" }}
        >
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>
        </div>
      </motion.div>

    </div>
  );
}
