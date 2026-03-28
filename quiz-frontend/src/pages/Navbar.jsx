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
    <header className="h-16 bg-[#0c0c18]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-50">

      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <span className="text-[15px] font-bold text-white tracking-tight">Dr. Anchal</span>
          <span className="text-[15px] font-light text-white/40 tracking-tight"> Classes</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full ring-2 ring-[#0c0c18]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-cyan-500/20">
              {initial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-white leading-none">{userName}</p>
              <p className="text-[11px] text-white/40 mt-0.5 leading-none capitalize">{userRole}</p>
            </div>
            <ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#13131f] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

              {/* User info */}
              <div className="px-4 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                    {initial}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{userName}</p>
                    <p className="text-[12px] text-white/40 mt-0.5">{userEmail}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                      <Shield size={8} /> {userRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <MenuItem icon={<User size={15} />}     label="My Profile"     sub="View and edit profile"   onClick={() => { setMenuOpen(false); alert("Coming soon"); }} />
                <MenuItem icon={<Settings size={15} />} label="Settings"       sub="Manage preferences"      onClick={() => { setMenuOpen(false); alert("Coming soon"); }} />
                <MenuItem icon={<Bell size={15} />}     label="Notifications"  sub="Configure alerts"        onClick={() => { setMenuOpen(false); alert("Coming soon"); }} badge="3" />
              </div>

              <div className="p-2 pt-0 border-t border-white/[0.06] mt-1">
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
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all text-left group">
      <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center flex-shrink-0 transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white">{label}</p>
        <p className="text-[11px] text-white/35">{sub}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-cyan-400/15 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
