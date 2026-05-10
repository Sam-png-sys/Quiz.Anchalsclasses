import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

const MotionDiv = motion.div;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);

      await apiRequest("/auth/forgot-password", "POST", {
        identifier,
      });

      setResolvedEmail(identifier.trim());
      setStep(2);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleReset = async () => {
    try {
      setLoading(true);

      await apiRequest("/auth/reset-password", "POST", {
        email: resolvedEmail || identifier.trim(),
        otp,
        password,
      });

      alert("Password reset successful.");
      window.location.href = "/login";
    } catch {
      alert("Invalid OTP or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>

      {/* LEFT SIDE */}
      <MotionDiv
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center"
      >
        <div className="w-[380px]">

          <h1 className="text-4xl font-semibold mb-2">
            Forgot Password
          </h1>
          <p className="mb-8" style={{ color: "var(--app-text-muted)" }}>
            Reset your password via OTP
          </p>

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <>
              <input
                placeholder="Enter Email ID or Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 mb-6 rounded-lg outline-none"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
              />

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff", boxShadow: "0 18px 32px var(--accent-glow)" }}
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
                className="w-full p-3 mb-4 rounded-lg outline-none text-center tracking-widest"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
              />

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 rounded-lg outline-none"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", color: "var(--app-text)" }}
              />

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff" }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p
                className="text-sm mt-4 text-center cursor-pointer"
                style={{ color: "var(--app-text-muted)" }}
                onClick={() => setStep(1)}
              >
                ← Go back
              </p>
            </div>
          )}

          <p className="text-sm mt-6 text-center" style={{ color: "var(--app-text-muted)" }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "var(--accent)" }}>
              Login
            </Link>
          </p>

        </div>
      </MotionDiv>

      {/* RIGHT SIDE (SAME AS LOGIN) */}
      <MotionDiv
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center relative"
      >
        <div className="absolute w-[300px] h-[300px] blur-[120px] opacity-30 rounded-full" style={{ background: "var(--accent)" }}></div>

        <div className="relative w-64 h-64 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-strong), var(--accent))" }}>
          <div className="absolute bottom-0 w-full h-1/2 bg-white/10 backdrop-blur-2xl rounded-b-full"></div>
        </div>
      </MotionDiv>
    </div>
  );
}
