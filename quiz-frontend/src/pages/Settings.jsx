import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Lock, Shield, Bell, Palette,
  Eye, EyeOff, Check, X, ToggleLeft, ToggleRight,
  Save, ArrowLeft, Key, Globe, Moon, Sun,
  Camera, Trash2, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { API_BASE } from "../utils/config";

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "security",      label: "Security",      icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "danger",        label: "Danger Zone",   icon: AlertTriangle },
];

export default function Settings() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const decoded  = decodeToken(token);
  const fileRef  = useRef(null);

  const [tab, setTab]       = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showPass, setShowPass] = useState({ current: false, newp: false, confirm: false });
  const [passError, setPassError] = useState("");

  const [profile, setProfile] = useState({
    name:          decoded?.name     || decoded?.username || "",
    email:         decoded?.email    || "",
    phone:         decoded?.phone    || "",
    bio:           decoded?.bio      || "",
    role:          decoded?.role     || "admin",
    avatarPreview: null,
    avatarFile:    null,
  });

  const [passwords, setPasswords] = useState({ current: "", newp: "", confirm: "" });

  const [notifs, setNotifs] = useState({
    newStudent:   true,
    quizAttempt:  true,
    weeklyReport: false,
    systemAlerts: true,
    emailDigest:  false,
  });

  const initial = profile.name?.charAt(0)?.toUpperCase() || "A";

  const flash = () => {
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(p => ({ ...p, avatarFile: file, avatarPreview: reader.result }));
    reader.readAsDataURL(file);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setError("");
    setSaving(true);
    try {
      let avatarUrl = null;

      // Upload avatar to Cloudinary first if a new file was picked
      if (profile.avatarFile) {
        const formData = new FormData();
        formData.append("file", profile.avatarFile);
        const upRes = await fetch(`${API_BASE}/admin/upload-avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!upRes.ok) throw new Error("Avatar upload failed");
        const upData = await upRes.json();
        avatarUrl = upData.url;
      }

      // Save profile fields
      const res = await fetch(`${API_BASE}/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:   profile.name,
          email:  profile.email,
          phone:  profile.phone,
          bio:    profile.bio,
          ...(avatarUrl && { avatarUrl }),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to save profile");
      }

      flash();
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPassError("");
    if (!passwords.current)          return setPassError("Enter your current password");
    if (passwords.newp.length < 8)   return setPassError("New password must be at least 8 characters");
    if (passwords.newp !== passwords.confirm) return setPassError("Passwords do not match");

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newp,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        return setPassError(d.detail || "Wrong current password");
      }

      setPasswords({ current: "", newp: "", confirm: "" });
      flash();
    } catch {
      setPassError("Server error — try again");
    } finally {
      setSaving(false);
    }
  };

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    try {
      await fetch(`${API_BASE}/admin/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      navigate("/login");
    } catch {
      alert("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-sm text-white/35 mt-0.5">Manage your account and preferences</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 whitespace-nowrap
                    ${tab === id
                      ? id === "danger"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-white/40 hover:text-white hover:bg-white/[0.05]"}`}>
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="text-[13px] font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ──── PROFILE ──── */}
              {tab === "profile" && (
                <motion.div key="profile" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">

                  {/* Avatar */}
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Profile Photo</SectionTitle>
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-lg shadow-cyan-500/20 select-none">
                          {profile.avatarPreview
                            ? <img src={profile.avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            : initial}
                        </div>
                        <button onClick={() => fileRef.current?.click()}
                          className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[#0c0c18] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-cyan-400 transition-all shadow-lg">
                          <Camera size={13} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-white">{profile.name || "Admin"}</p>
                        <p className="text-[12px] text-white/35 mt-0.5 capitalize">{profile.role}</p>
                        <div className="flex gap-2 mt-3">
                          <PillBtn color="cyan" onClick={() => fileRef.current?.click()}>Change photo</PillBtn>
                          {profile.avatarPreview && (
                            <PillBtn color="red" onClick={() => setProfile(p => ({ ...p, avatarFile: null, avatarPreview: null }))}>Remove</PillBtn>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal info */}
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Personal Information</SectionTitle>
                    <div className="flex flex-col gap-3">
                      <Field icon={<User size={14} className="text-white/30" />} label="Full Name">
                        <input value={profile.name}
                          onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                          placeholder="Your full name" className="field-input" />
                      </Field>
                      <Field icon={<Mail size={14} className="text-white/30" />} label="Email Address">
                        <input type="email" value={profile.email}
                          onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                          placeholder="you@example.com" className="field-input" />
                      </Field>
                      <Field icon={<Phone size={14} className="text-white/30" />} label="Mobile Number">
                        <input type="tel" value={profile.phone}
                          onChange={e => setProfile(p => ({...p, phone: e.target.value}))}
                          placeholder="+91 98765 43210" className="field-input" />
                      </Field>
                      <Field icon={<Globe size={14} className="text-white/30" />} label="Bio">
                        <textarea rows={2} value={profile.bio}
                          onChange={e => setProfile(p => ({...p, bio: e.target.value}))}
                          placeholder="A short bio about yourself..." className="field-input resize-none" />
                      </Field>
                    </div>
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <X size={13} className="text-red-400 flex-shrink-0" />
                      <p className="text-[12px] text-red-400">{error}</p>
                    </div>
                  )}

                  <SaveBtn saving={saving} saved={saved} onClick={handleSaveProfile} />
                </motion.div>
              )}

              {/* ──── SECURITY ──── */}
              {tab === "security" && (
                <motion.div key="security" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Change Password</SectionTitle>
                    <div className="flex flex-col gap-3">
                      {[
                        { key: "current", label: "Current Password" },
                        { key: "newp",    label: "New Password" },
                        { key: "confirm", label: "Confirm New Password" },
                      ].map(({ key, label }) => (
                        <Field key={key} icon={<Key size={14} className="text-white/30" />} label={label}>
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type={showPass[key] ? "text" : "password"}
                              value={passwords[key]}
                              onChange={e => setPasswords(p => ({...p, [key]: e.target.value}))}
                              placeholder="••••••••"
                              className="flex-1 field-input" />
                            <button onClick={() => setShowPass(p => ({...p, [key]: !p[key]}))}
                              className="text-white/25 hover:text-white transition-colors flex-shrink-0">
                              {showPass[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                      ))}

                      {passwords.newp && <StrengthBar password={passwords.newp} />}

                      {passError && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <X size={13} className="text-red-400 flex-shrink-0" />
                          <p className="text-[12px] text-red-400">{passError}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Active Sessions</SectionTitle>
                    {[
                      { device: "Chrome — Windows", location: "Aurangabad, IN", time: "Now",        current: true },
                      { device: "Safari — iPhone",  location: "Aurangabad, IN", time: "2 days ago", current: false },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.current ? "bg-emerald-400" : "bg-white/15"}`} />
                          <div>
                            <p className="text-[13px] font-semibold text-white">{s.device}</p>
                            <p className="text-[11px] text-white/30 mt-0.5">{s.location} · {s.time}</p>
                          </div>
                        </div>
                        {s.current
                          ? <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">Current</span>
                          : <button className="text-[11px] font-semibold text-red-400/60 hover:text-red-400 transition-colors">Revoke</button>}
                      </div>
                    ))}
                  </div>

                  <SaveBtn saving={saving} saved={saved} onClick={handleChangePassword} label="Update Password" />
                </motion.div>
              )}

              {/* ──── NOTIFICATIONS ──── */}
              {tab === "notifications" && (
                <motion.div key="notifications" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Notification Preferences</SectionTitle>
                    {[
                      { key: "newStudent",   label: "New student registered",   sub: "Get notified when a new student signs up" },
                      { key: "quizAttempt",  label: "Quiz attempt completed",    sub: "When any student completes a quiz" },
                      { key: "weeklyReport", label: "Weekly performance report", sub: "Summary of all activity sent every Monday" },
                      { key: "systemAlerts", label: "System alerts",             sub: "Critical server or application alerts" },
                      { key: "emailDigest",  label: "Email digest",              sub: "Daily summary delivered to your email" },
                    ].map(({ key, label, sub }) => (
                      <div key={key} className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
                        <div>
                          <p className="text-[13px] font-semibold text-white">{label}</p>
                          <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
                        </div>
                        <button onClick={() => setNotifs(n => ({...n, [key]: !n[key]}))}
                          className={`ml-6 flex-shrink-0 transition-colors ${notifs[key] ? "text-cyan-400" : "text-white/20"}`}>
                          {notifs[key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <SaveBtn saving={saving} saved={saved} onClick={() => flash()} label="Save Preferences" />
                </motion.div>
              )}

              {/* ──── APPEARANCE ──── */}
              {tab === "appearance" && (
                <motion.div key="appearance" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Theme</SectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "dark",  label: "Dark mode",  icon: Moon, preview: "bg-[#080810]", active: darkMode },
                        { id: "light", label: "Light mode", icon: Sun,  preview: "bg-gray-100",  active: !darkMode },
                      ].map(({ id, label, icon: Icon, preview, active }) => (
                        <button key={id}
                          onClick={() => { if ((id === "dark" && !darkMode) || (id === "light" && darkMode)) handleToggleDark(); }}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left
                            ${active ? "border-cyan-500/40 bg-cyan-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"}`}>
                          <div className={`w-full h-14 rounded-xl ${preview} mb-3 border border-white/[0.06] flex items-center justify-center`}>
                            <Icon size={18} className={active ? "text-cyan-400" : "text-white/20"} />
                          </div>
                          <p className="text-[13px] font-semibold text-white">{label}</p>
                          {active && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                              <Check size={11} className="text-[#080810]" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0c0c18] border border-white/[0.06] rounded-2xl p-6">
                    <SectionTitle>Accent Color</SectionTitle>
                    <div className="flex gap-3">
                      {[
                        { cls: "bg-cyan-400",   active: true },
                        { cls: "bg-purple-500" },
                        { cls: "bg-green-400" },
                        { cls: "bg-amber-400" },
                        { cls: "bg-pink-500" },
                        { cls: "bg-red-400" },
                      ].map(({ cls, active }, i) => (
                        <button key={i}
                          className={`w-8 h-8 rounded-full ${cls} transition-all hover:scale-110 ${active ? "ring-2 ring-offset-2 ring-offset-[#0c0c18] ring-cyan-400" : ""}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-white/20 mt-3">Color theming coming in next update</p>
                  </div>
                </motion.div>
              )}

              {/* ──── DANGER ZONE ──── */}
              {tab === "danger" && (
                <motion.div key="danger" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="bg-[#0c0c18] border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <AlertTriangle size={15} className="text-red-400" />
                      <span className="text-[13px] font-bold text-red-400 uppercase tracking-widest">Danger Zone</span>
                    </div>
                    {[
                      { label: "Sign out all devices", sub: "Revoke all active sessions immediately.",    btn: "Sign out all",   col: "amber", fn: () => alert("Coming soon") },
                      { label: "Export my data",        sub: "Download your account data as JSON.",       btn: "Export",         col: "blue",  fn: () => alert("Coming soon") },
                      { label: "Delete account",        sub: "Permanently delete your account and all data. Cannot be undone.", btn: "Delete account", col: "red", fn: () => setDeleteModal(true) },
                    ].map(({ label, sub, btn, col, fn }) => {
                      const styles = {
                        amber: "text-amber-400 bg-amber-400/10 border-amber-400/20 hover:bg-amber-400/15",
                        blue:  "text-blue-400  bg-blue-400/10  border-blue-400/20  hover:bg-blue-400/15",
                        red:   "text-red-400   bg-red-400/10   border-red-400/20   hover:bg-red-400/15",
                      };
                      return (
                        <div key={label} className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
                          <div className="flex-1 pr-6">
                            <p className="text-[13px] font-semibold text-white">{label}</p>
                            <p className="text-[11px] text-white/30 mt-0.5 leading-relaxed">{sub}</p>
                          </div>
                          <button onClick={fn}
                            className={`flex-shrink-0 text-[12px] font-bold px-4 py-2 rounded-xl border transition-all ${styles[col]}`}>
                            {btn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => { setDeleteModal(false); setDeleteInput(""); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#13131f] border border-red-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
              <p className="text-[13px] text-white/40 leading-relaxed mb-6">
                This permanently deletes your account, all quizzes, questions and student records.{" "}
                <span className="text-red-400 font-semibold">This cannot be undone.</span>
              </p>
              <div className="mb-5">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest block mb-2">
                  Type <span className="text-red-400">DELETE</span> to confirm
                </label>
                <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-white text-sm outline-none focus:border-red-500/40 placeholder:text-white/20 transition-all" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteModal(false); setDeleteInput(""); }}
                  className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 hover:text-white text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleteInput !== "DELETE"}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .field-input {
          width: 100%;
          background: transparent;
          color: white;
          font-size: 14px;
          outline: none;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-[11px] font-bold text-white/35 uppercase tracking-widest mb-5">{children}</h2>;
}

function Field({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] focus-within:border-cyan-500/30 focus-within:bg-cyan-500/[0.03] transition-all duration-200">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-white/25 uppercase tracking-widest block mb-1">{label}</label>
        {children}
      </div>
    </div>
  );
}

function PillBtn({ children, color, onClick }) {
  const styles = {
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 hover:bg-cyan-400/15",
    red:  "text-red-400  bg-red-400/10  border-red-400/20  hover:bg-red-400/15",
  };
  return (
    <button onClick={onClick} className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${styles[color]}`}>
      {children}
    </button>
  );
}

function SaveBtn({ saving, saved, onClick, label = "Save Changes" }) {
  return (
    <button onClick={onClick} disabled={saving}
      className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all duration-300 disabled:opacity-50
        ${saved
          ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
          : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99]"}`}>
      {saved ? <><Check size={16} /> Saved!</> : saving ? "Saving..." : <><Save size={16} /> {label}</>}
    </button>
  );
}

function StrengthBar({ password }) {
  const checks = [
    { label: "8+ chars",  pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number",    pass: /\d/.test(password) },
    { label: "Special",   pass: /[!@#$%^&*]/.test(password) },
  ];
  const score  = checks.filter(c => c.pass).length;
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-amber-400", "bg-emerald-400"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const txtCls = ["", "text-red-400", "text-amber-400", "text-amber-300", "text-emerald-400"];

  return (
    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
      <div className="flex gap-1 mb-2.5">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-white/[0.06]"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {checks.map(({ label, pass }) => (
            <span key={label} className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${pass ? "text-emerald-400" : "text-white/20"}`}>
              <Check size={9} /> {label}
            </span>
          ))}
        </div>
        {score > 0 && <span className={`text-[11px] font-bold ${txtCls[score]}`}>{labels[score]}</span>}
      </div>
    </div>
  );
}
