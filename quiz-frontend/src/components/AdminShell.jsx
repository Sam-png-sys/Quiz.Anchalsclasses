import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Users, BarChart3,
  PanelLeftClose, PanelLeftOpen, BookOpen, Zap, GraduationCapIcon,
} from "lucide-react";
import Navbar from "../pages/Navbar";

const SIDEBAR_STORAGE_KEY = "admin_sidebar_collapsed";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "Create Quiz", path: "/create-quiz" },
  { icon: BookOpen, label: "All Quizzes", path: "/quizzes" },
  { icon: Users, label: "Students", path: "/students" },
  { icon: GraduationCapIcon, label: "Courses", path: "/courses" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

function isActivePath(pathname, itemPath) {
  if (itemPath === "/dashboard") return pathname === "/dashboard";
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function AdminShell({ children, contentRef = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? "false" : "true");
  }, [sidebarOpen]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--app-bg)", color: "var(--app-text)" }}>
      <Navbar />

      <div className="md:hidden px-3 py-3 border-b" style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = isActivePath(location.pathname, path);
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={active
                  ? {
                      background: "var(--accent-soft)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-border)",
                    }
                  : {
                      background: "var(--app-input)",
                      color: "var(--app-text-muted)",
                      border: "1px solid var(--app-border)",
                    }}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside
          className="hidden md:flex md:flex-col md:h-[calc(100vh-64px)] md:sticky md:top-16 flex-shrink-0 transition-all duration-300"
          style={{
            width: sidebarOpen ? 220 : 68,
            background: "var(--app-surface)",
            borderRight: "1px solid var(--app-border)",
          }}
        >
          <div className={`flex ${sidebarOpen ? "justify-end pr-3" : "justify-center"} pt-4 pb-2`}>
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "var(--app-text-subtle)" }}
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-2 flex-1 pt-2">
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
              const active = isActivePath(location.pathname, path);
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  title={!sidebarOpen ? label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${!sidebarOpen ? "justify-center" : ""}`}
                  style={active
                    ? {
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        boxShadow: "0 0 20px var(--accent-glow)",
                      }
                    : {
                        color: "var(--app-text-muted)",
                      }}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {sidebarOpen && <span className="text-[13px] font-semibold whitespace-nowrap">{label}</span>}
                  {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                </button>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div
              className="p-3 m-3 rounded-2xl mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent-soft), color-mix(in srgb, var(--accent-strong) 18%, transparent))",
                border: "1px solid var(--accent-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={13} style={{ color: "var(--accent)" }} />
                <span className="text-[11px] font-bold" style={{ color: "var(--accent)" }}>Pro Admin</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--app-text-subtle)" }}>Full access to all features.</p>
            </div>
          )}
        </aside>

        <div ref={contentRef} className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
