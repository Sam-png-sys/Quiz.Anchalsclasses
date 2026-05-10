export const ACCENT_OPTIONS = [
  { id: "violet", label: "Violet", colors: ["#7c3aed", "#9333ea"] },
  { id: "cyan", label: "Cyan", colors: ["#0891b2", "#0e7490"] },
  { id: "rose", label: "Rose", colors: ["#db2777", "#9d174d"] },
  { id: "amber", label: "Amber", colors: ["#d97706", "#b45309"] },
  { id: "emerald", label: "Emerald", colors: ["#059669", "#047857"] },
  { id: "indigo", label: "Indigo", colors: ["#4f46e5", "#3730a3"] },
];

export const APP_THEMES = {
  dark: {
    background: "#0a0a12",
    backgroundAlt: "#0f0a1e",
    surface: "rgba(255,255,255,0.04)",
    surfaceStrong: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    borderSoft: "rgba(255,255,255,0.05)",
    text: "#ffffff",
    textMuted: "#9ca3af",
    textSubtle: "#6b7280",
    textGhost: "#4b5563",
    danger: "#ef4444",
    success: "#10b981",
  },
  light: {
    background: "#f4f7fb",
    backgroundAlt: "#e8eef8",
    surface: "#ffffff",
    surfaceStrong: "#f8fafc",
    border: "rgba(15,23,42,0.08)",
    borderSoft: "rgba(15,23,42,0.05)",
    text: "#0f172a",
    textMuted: "#475569",
    textSubtle: "#64748b",
    textGhost: "#94a3b8",
    danger: "#dc2626",
    success: "#059669",
  },
};

export function getAccentOption(accentId) {
  return ACCENT_OPTIONS.find((option) => option.id === accentId) || ACCENT_OPTIONS[0];
}
