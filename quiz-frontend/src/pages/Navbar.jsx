import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, ChevronDown, Bell, Shield } from "lucide-react";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = decodeToken(token);

  const userName = user?.name || user?.email?.split("@")[0] || "Admin";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-[#0c0c18] flex items-center justify-between px-6 border-b border-white/[0.06]">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <Shield size={18} />
        <span className="font-bold">Dr. Anchal Classes</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* 🔔 Notifications */}
        <button onClick={() => navigate("/notifications")}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/[0.06]">
          <Bell size={18} />
        </button>

        {/* User */}
        <div ref={menuRef} className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2">

            <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center">
              {initial}
            </div>

            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#13131f] rounded-xl border border-white/[0.06]">

              {/*  SETTINGS */}
              <button
                onClick={() => {
                  navigate("/settings");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-white/[0.05]"
              >
                 Settings
              </button>

              {/*  PROFILE REMOVED */}

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}