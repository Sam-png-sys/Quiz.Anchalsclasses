export const THEME_STORAGE_KEY = "theme";
export const ACCENT_STORAGE_KEY = "accent";

export const ACCENT_OPTIONS = [
  { id: "cyan", label: "Cyan", color: "#22d3ee", strong: "#2563eb", rgb: "34 211 238" },
  { id: "purple", label: "Purple", color: "#8b5cf6", strong: "#6d28d9", rgb: "139 92 246" },
  { id: "green", label: "Green", color: "#34d399", strong: "#059669", rgb: "52 211 153" },
  { id: "amber", label: "Amber", color: "#f59e0b", strong: "#d97706", rgb: "245 158 11" },
  { id: "pink", label: "Pink", color: "#ec4899", strong: "#db2777", rgb: "236 72 153" },
  { id: "red", label: "Red", color: "#f87171", strong: "#dc2626", rgb: "248 113 113" },
];

const THEME_PALETTES = {
  dark: {
    bg: "#080810",
    surface: "#0c0c18",
    surfaceAlt: "#13131f",
    input: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)",
    borderStrong: "rgba(255,255,255,0.12)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.62)",
    subtle: "rgba(255,255,255,0.35)",
    ghost: "rgba(255,255,255,0.18)",
    hover: "rgba(255,255,255,0.06)",
    overlay: "rgba(2,6,23,0.72)",
    shadow: "rgba(15,23,42,0.45)",
  },
  light: {
    bg: "#f4f7fb",
    surface: "#ffffff",
    surfaceAlt: "#eef4ff",
    input: "#f8fafc",
    border: "rgba(15,23,42,0.08)",
    borderStrong: "rgba(15,23,42,0.14)",
    text: "#0f172a",
    muted: "rgba(15,23,42,0.66)",
    subtle: "rgba(15,23,42,0.45)",
    ghost: "rgba(15,23,42,0.22)",
    hover: "rgba(15,23,42,0.05)",
    overlay: "rgba(15,23,42,0.45)",
    shadow: "rgba(15,23,42,0.10)",
  },
};

export function getStoredTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function getStoredAccent() {
  if (typeof window === "undefined") return "cyan";
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  return ACCENT_OPTIONS.some((option) => option.id === stored) ? stored : "cyan";
}

export function getAccentOption(accentId = "cyan") {
  return ACCENT_OPTIONS.find((option) => option.id === accentId) || ACCENT_OPTIONS[0];
}

export function applyTheme(theme = getStoredTheme(), accentId = getStoredAccent()) {
  if (typeof document === "undefined") return;

  const palette = THEME_PALETTES[theme] || THEME_PALETTES.dark;
  const accent = getAccentOption(accentId);
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.dataset.accent = accent.id;

  root.style.setProperty("--app-bg", palette.bg);
  root.style.setProperty("--app-surface", palette.surface);
  root.style.setProperty("--app-surface-alt", palette.surfaceAlt);
  root.style.setProperty("--app-input", palette.input);
  root.style.setProperty("--app-border", palette.border);
  root.style.setProperty("--app-border-strong", palette.borderStrong);
  root.style.setProperty("--app-text", palette.text);
  root.style.setProperty("--app-text-muted", palette.muted);
  root.style.setProperty("--app-text-subtle", palette.subtle);
  root.style.setProperty("--app-text-ghost", palette.ghost);
  root.style.setProperty("--app-hover", palette.hover);
  root.style.setProperty("--app-overlay", palette.overlay);
  root.style.setProperty("--app-shadow", palette.shadow);

  root.style.setProperty("--accent", accent.color);
  root.style.setProperty("--accent-strong", accent.strong);
  root.style.setProperty("--accent-rgb", accent.rgb);
  root.style.setProperty("--accent-soft", `rgba(${accent.rgb} / 0.12)`);
  root.style.setProperty("--accent-soft-strong", `rgba(${accent.rgb} / 0.18)`);
  root.style.setProperty("--accent-border", `rgba(${accent.rgb} / 0.28)`);
  root.style.setProperty("--accent-glow", `rgba(${accent.rgb} / 0.22)`);
}
