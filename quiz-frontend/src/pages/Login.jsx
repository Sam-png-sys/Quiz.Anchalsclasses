import { useState } from "react";

export default function Login() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
  });

  const sendOTP = async () => {
    await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setStep(2);
  };

  const verifyOTP = async () => {
    const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "/dashboard";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A]">

      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500 blur-[120px] opacity-20 rounded-full"></div>

      <div className="relative bg-[#111827]/60 backdrop-blur-xl p-8 rounded-2xl w-96 border border-gray-800 shadow-2xl">

        <h1 className="mb-6 text-3xl font-bold text-center text-cyan-400">
          Welcome Back
        </h1>

        {step === 1 ? (
          <>
            <input
              placeholder="Email"
              className="w-full p-3 mb-4 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-6 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
              onClick={sendOTP}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg font-semibold
                         hover:shadow-[0_0_25px_#00E5FF80]"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Enter OTP"
              className="w-full p-3 mb-6 text-xl tracking-widest text-center bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
            />

            <button
              onClick={verifyOTP}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-cyan-400 text-black rounded-lg font-semibold
                         hover:shadow-[0_0_25px_#00FFAA80]"
            >
              Verify & Login
            </button>
          </>
        )}

        {/* Switch */}
        <p className="mt-6 text-center text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}