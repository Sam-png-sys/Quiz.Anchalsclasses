import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User, ChevronDown, Bell, Shield } from "lucide-react";

// Decode JWT to get user info without any library
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Get user from token
  const token = localStorage.getItem("token");
  const user  = decodeToken(token);

  const userName  = user?.name  || user?.username || user?.email?.split("@")[0] || "Admin";
  const userEmail = user?.email || "";
  const userRole  = user?.role  || "Administrator";
  const initial   = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  
  return (
    <header
      className="h-16 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50"
      style={{
        background: "color-mix(in srgb, var(--app-surface) 94%, transparent)",
        borderBottom: "1px solid var(--app-border)",
        color: "var(--app-text)",
      }}
    >

      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 14px 24px var(--accent-glow)" }}
        >
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--app-text)" }}>Dr. Anchal</span>
          <span className="text-[15px] font-light tracking-tight" style={{ color: "var(--app-text-muted)" }}> Classes</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ color: "var(--app-text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--app-hover)"; e.currentTarget.style.color = "var(--app-text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--app-text-muted)"; }}
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2" style={{ background: "var(--accent)", boxShadow: "0 0 0 2px var(--app-surface)" }} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl transition-all group"
            style={{ color: "var(--app-text)" }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", boxShadow: "0 12px 24px var(--accent-glow)" }}
            >
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold leading-none" style={{ color: "var(--app-text)" }}>{userName}</p>
              <p className="text-[11px] mt-0.5 leading-none capitalize" style={{ color: "var(--app-text-muted)" }}>{userRole}</p>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} style={{ color: "var(--app-text-subtle)" }} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-strong)", boxShadow: "0 24px 48px var(--app-shadow)" }}
            >

              {/* User info */}
              <div className="px-4 py-4" style={{ borderBottom: "1px solid var(--app-border)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
                  >
                    {initial}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--app-text)" }}>{userName}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--app-text-muted)" }}>{userEmail}</p>
                    <span
                      className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: "var(--accent)", background: "var(--accent-soft)", borderColor: "var(--accent-border)" }}
                    >
                      <Shield size={8} /> {userRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <MenuItem icon={<Settings size={15} />} label="Settings"       sub="Manage preferences"      onClick={() => { navigate("/settings"); setMenuOpen(false); }} />
                <MenuItem icon={<Bell size={15} />}     label="Notifications"  sub="Configure alerts"        onClick={() => { setMenuOpen(false); alert("Coming soon"); }} badge="3" />
              </div>

              <div className="p-2 pt-0 mt-1" style={{ borderTop: "1px solid var(--app-border)" }}>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left">
                  <LogOut size={15} />
                  <div>
                    <p className="text-[13px] font-semibold">Sign out</p>
                    <p className="text-[11px] text-red-400/60">End your session</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, sub, onClick, badge }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
      style={{ color: "var(--app-text-muted)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all" style={{ background: "var(--app-hover)" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: "var(--app-text)" }}>{label}</p>
        <p className="text-[11px]" style={{ color: "var(--app-text-subtle)" }}>{sub}</p>
      </div>
      {badge && (
        <span
          className="text-[10px] font-bold border px-1.5 py-0.5 rounded-full"
          style={{ background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent-border)" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
