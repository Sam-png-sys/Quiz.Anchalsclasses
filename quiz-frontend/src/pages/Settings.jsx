import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Lock, Shield, Bell, Palette,
  Eye, EyeOff, Check, X, ToggleLeft, ToggleRight,
  Save, ArrowLeft, Key, Globe, Moon, Sun,
  Trash2, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/config";
import { ACCENT_OPTIONS, applyTheme, getStoredAccent, getStoredTheme } from "../utils/theme";
import AdminShell from "../components/AdminShell";
const MotionDiv = motion.div;

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
  { id: "admins",        label: "Admin Settings", icon: Shield },
  { id: "danger",        label: "Danger Zone",   icon: AlertTriangle },
];

export default function Settings() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const decoded  = decodeToken(token);

  const [tab, setTab]       = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");
  const [darkMode, setDarkMode] = useState(getStoredTheme() !== "light");
  const [accent, setAccent] = useState(getStoredAccent());
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showPass, setShowPass] = useState({ current: false, newp: false, confirm: false });
  const [passError, setPassError] = useState("");

  const [profile, setProfile] = useState({
    name:  decoded?.name     || decoded?.username || "",
    email: decoded?.email    || "",
    phone: decoded?.phone    || "",
    bio:   decoded?.bio      || "",
    role:  decoded?.role     || "admin",
  });

  const [passwords, setPasswords] = useState({ current: "", newp: "", confirm: "" });

  const [notifs, setNotifs] = useState({
    newStudent:   true,
    quizAttempt:  true,
    weeklyReport: false,
    systemAlerts: true,
    emailDigest:  false,
  });

  // Admin Settings Tab States
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", phone: "", password: "", creationPassword: "" });
  const [newAdminShowPass, setNewAdminShowPass] = useState(false);
  const [newAdminShowPasscode, setNewAdminShowPasscode] = useState(false);
  const [newAdminError, setNewAdminError] = useState("");
  const [newAdminSaving, setNewAdminSaving] = useState(false);
  const [newAdminSaved, setNewAdminSaved] = useState(false);

  const handleAddAdmin = async () => {
    setNewAdminError("");
    setNewAdminSaved(false);

    if (!newAdmin.name.trim()) return setNewAdminError("Name is required");
    if (!newAdmin.email.trim()) return setNewAdminError("Email is required");
    if (!newAdmin.phone.trim()) return setNewAdminError("Phone number is required");
    if (newAdmin.phone.trim().length !== 10 || !/^\d+$/.test(newAdmin.phone.trim())) {
      return setNewAdminError("Phone number must be exactly 10 digits");
    }
    if (!newAdmin.password) return setNewAdminError("Password is required");
    if (newAdmin.password.length < 8) return setNewAdminError("Password must be at least 8 characters");
    if (!newAdmin.creationPassword) return setNewAdminError("Admin creation passcode is required");

    setNewAdminSaving(true);
    try {
      const res = await fetch(`${API_BASE}/admin/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          password: newAdmin.password,
          creationPassword: newAdmin.creationPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to add admin");
      }

      setNewAdmin({ name: "", email: "", phone: "", password: "", creationPassword: "" });
      setNewAdminSaved(true);
      setTimeout(() => setNewAdminSaved(false), 3000);
    } catch (err) {
      setNewAdminError(err.message || "Something went wrong. Please try again.");
    } finally {
      setNewAdminSaving(false);
    }
  };

  const panelStyle = {
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    boxShadow: "0 18px 36px var(--app-shadow)",
  };

  const flash = () => {
    setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setError("");
    setSaving(true);
    try {
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
  const handleToggleTheme = (nextTheme) => {
    const next = nextTheme === "dark";
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    applyTheme(next ? "dark" : "light", accent);
  };

  const handleAccentChange = (nextAccent) => {
    setAccent(nextAccent);
    localStorage.setItem("accent", nextAccent);
    applyTheme(darkMode ? "dark" : "light", nextAccent);
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
    <AdminShell>

      <div className="max-w-5xl mx-auto w-full px-4 py-8">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>Settings</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--app-text-subtle)" }}>Manage your account and preferences</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible" style={panelStyle}>
              {TABS.map(({ id, label, icon }) => {
                const TabIcon = icon;
                return (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 whitespace-nowrap
                    ${tab === id
                      ? id === "danger"
                        ? "text-red-400 border border-red-500/20"
                        : "border"
                      : ""}`}
                  style={tab === id
                    ? id === "danger"
                      ? { background: "rgba(239,68,68,0.10)" }
                      : { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent-border)" }
                    : { color: "var(--app-text-muted)" }}>
                  <TabIcon size={15} className="flex-shrink-0" />
                  <span className="text-[13px] font-semibold">{label}</span>
                </button>
              );
              })}
            </div>
          </aside>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ──── PROFILE ──── */}
              {tab === "profile" && (
                <MotionDiv key="profile" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">

                  {/* Personal info */}
                  <div className="rounded-2xl p-6" style={panelStyle}>
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
                </MotionDiv>
              )}

              {/* ──── SECURITY ──── */}
              {tab === "security" && (
                <MotionDiv key="security" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="rounded-2xl p-6" style={panelStyle}>
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
                  <div className="rounded-2xl p-6" style={panelStyle}>
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
                </MotionDiv>
              )}

              {/* ──── NOTIFICATIONS ──── */}
              {tab === "notifications" && (
                <MotionDiv key="notifications" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="rounded-2xl p-6" style={panelStyle}>
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
                          className="ml-6 flex-shrink-0 transition-colors"
                          style={{ color: notifs[key] ? "var(--accent)" : "var(--app-text-ghost)" }}>
                          {notifs[key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <SaveBtn saving={saving} saved={saved} onClick={() => flash()} label="Save Preferences" />
                </MotionDiv>
              )}

              {/* ──── APPEARANCE ──── */}
              {tab === "appearance" && (
                <MotionDiv key="appearance" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="rounded-2xl p-6" style={panelStyle}>
                    <SectionTitle>Theme</SectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "dark",  label: "Dark mode",  icon: Moon, preview: "bg-[#080810]", active: darkMode },
                        { id: "light", label: "Light mode", icon: Sun,  preview: "bg-gray-100",  active: !darkMode },
                      ].map(({ id, label, icon, preview, active }) => {
                        const ThemeIcon = icon;
                        return (
                        <button key={id}
                          onClick={() => handleToggleTheme(id)}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 text-left
                            ${active ? "" : ""}`}
                          style={active
                            ? { borderColor: "var(--accent-border)", background: "var(--accent-soft)" }
                            : { borderColor: "var(--app-border)", background: "var(--app-input)" }}>
                          <div className={`w-full h-14 rounded-xl ${preview} mb-3 border border-white/[0.06] flex items-center justify-center`}>
                            <ThemeIcon size={18} style={{ color: active ? "var(--accent)" : "var(--app-text-ghost)" }} />
                          </div>
                          <p className="text-[13px] font-semibold" style={{ color: "var(--app-text)" }}>{label}</p>
                          {active && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
                              <Check size={11} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl p-6" style={panelStyle}>
                    <SectionTitle>Accent Color</SectionTitle>
                    <div className="flex gap-3">
                      {ACCENT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAccentChange(option.id)}
                          className="w-8 h-8 rounded-full transition-all hover:scale-110 border"
                          style={{
                            background: option.color,
                            borderColor: accent === option.id ? "var(--app-text)" : "transparent",
                            boxShadow: accent === option.id ? "0 0 0 3px var(--accent-soft-strong)" : "none",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] mt-3" style={{ color: "var(--app-text-subtle)" }}>Accent color updates apply instantly across the key admin screens.</p>
                  </div>
                </MotionDiv>
              )}

              {/* ──── ADMIN SETTINGS ──── */}
              {tab === "admins" && (
                <MotionDiv key="admins" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
                  <div className="rounded-2xl p-6" style={panelStyle}>
                    <SectionTitle>Add New Admin</SectionTitle>
                    <p className="text-sm -mt-2 mb-6" style={{ color: "var(--app-text-subtle)" }}>
                      Create a new administrator account. You will need to enter the secret admin creation passcode.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Field icon={<User size={14} className="text-white/30" />} label="Full Name">
                        <input
                          value={newAdmin.name}
                          onChange={e => setNewAdmin(p => ({...p, name: e.target.value}))}
                          placeholder="John Doe"
                          className="field-input"
                        />
                      </Field>
                      <Field icon={<Mail size={14} className="text-white/30" />} label="Email Address">
                        <input
                          type="email"
                          value={newAdmin.email}
                          onChange={e => setNewAdmin(p => ({...p, email: e.target.value}))}
                          placeholder="admin@example.com"
                          className="field-input"
                        />
                      </Field>
                      <Field icon={<Phone size={14} className="text-white/30" />} label="Mobile Number">
                        <input
                          type="tel"
                          value={newAdmin.phone}
                          onChange={e => setNewAdmin(p => ({...p, phone: e.target.value}))}
                          placeholder="10-digit mobile number"
                          className="field-input"
                          maxLength={10}
                        />
                      </Field>
                      <Field icon={<Key size={14} className="text-white/30" />} label="Password">
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type={newAdminShowPass ? "text" : "password"}
                            value={newAdmin.password}
                            onChange={e => setNewAdmin(p => ({...p, password: e.target.value}))}
                            placeholder="••••••••"
                            className="flex-1 field-input"
                          />
                          <button
                            onClick={() => setNewAdminShowPass(!newAdminShowPass)}
                            className="text-white/25 hover:text-white transition-colors flex-shrink-0"
                          >
                            {newAdminShowPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </Field>
                      {newAdmin.password && <StrengthBar password={newAdmin.password} />}
                      <Field icon={<Shield size={14} className="text-white/30" />} label="Admin Creation Passcode">
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type={newAdminShowPasscode ? "text" : "password"}
                            value={newAdmin.creationPassword}
                            onChange={e => setNewAdmin(p => ({...p, creationPassword: e.target.value}))}
                            placeholder="Enter the secret passcode"
                            className="flex-1 field-input"
                          />
                          <button
                            onClick={() => setNewAdminShowPasscode(!newAdminShowPasscode)}
                            className="text-white/25 hover:text-white transition-colors flex-shrink-0"
                          >
                            {newAdminShowPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </Field>
                    </div>
                  </div>

                  {newAdminError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <X size={13} className="text-red-400 flex-shrink-0" />
                      <p className="text-[12px] text-red-400">{newAdminError}</p>
                    </div>
                  )}

                  <SaveBtn
                    saving={newAdminSaving}
                    saved={newAdminSaved}
                    onClick={handleAddAdmin}
                    label="Create Admin Account"
                  />
                </MotionDiv>
              )}

              {/* ──── DANGER ZONE ──── */}
              {tab === "danger" && (
                <MotionDiv key="danger" variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
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
                </MotionDiv>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteModal && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => { setDeleteModal(false); setDeleteInput(""); }}>
            <MotionDiv initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="border border-red-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl"
              style={{ background: "var(--app-surface-alt)" }}>
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
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <style>{`
        .field-input {
          width: 100%;
          background: transparent;
          color: var(--app-text);
          font-size: 14px;
          outline: none;
        }
        .field-input::placeholder { color: var(--app-text-ghost); }
      `}</style>
    </AdminShell>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "var(--app-text-subtle)" }}>{children}</h2>;
}

function Field({ icon, label, children }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
      style={{ background: "var(--app-input)", border: "1px solid var(--app-border)" }}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "var(--app-text-subtle)" }}>{label}</label>
        {children}
      </div>
    </div>
  );
}

function SaveBtn({ saving, saved, onClick, label = "Save Changes" }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all duration-300 disabled:opacity-50 active:scale-[0.99]"
      style={saved
        ? { background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.24)", color: "#34d399" }
        : { background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff", boxShadow: "0 18px 32px var(--accent-glow)" }}>
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
