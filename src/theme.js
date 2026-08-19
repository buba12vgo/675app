export const STORAGE_THEME_KEY = "theme";

export const THEMES = {
  dark: {
    bg: "#0B1120",
    bgDark: "#0B1120",
    cardBg: "#151D2E",
    cardBgElevated: "#1A2438",
    surface: "#1E293B",
    inputBg: "#1A2438",
    inputBorder: "#2D3A52",
    accent: "#64748B",
    accentDark: "#475569",
    accentLight: "#CBD5E1",
    accentSoft: "rgba(100, 116, 139, 0.16)",
    accentBorder: "rgba(100, 116, 139, 0.38)",
    accentShadow: "rgba(100, 116, 139, 0.28)",
    accentBgSubtle: "rgba(100, 116, 139, 0.10)",
    tableHeader: "#E2E8F0",
    tableHeaderAccent: "#CBD5E1",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    success: "#10B981",
    error: "#F87171",
    cardShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    glass: "rgba(21, 29, 46, 0.78)",
    colorPartido: "#8B5CF6",
    colorPartidoLight: "#C4B5FD",
    colorPartidoSoft: "rgba(139, 92, 246, 0.18)",
    colorPartidoBorder: "rgba(139, 92, 246, 0.45)",
    onAccent: "#FFFFFF",
  },
  light: {
    bg: "#F8FAFC",
    bgDark: "#F1F5F9",
    cardBg: "#FFFFFF",
    cardBgElevated: "#F1F5F9",
    surface: "#E2E8F0",
    inputBg: "#FFFFFF",
    inputBorder: "#CBD5E1",
    accent: "#64748B",
    accentDark: "#475569",
    accentLight: "#334155",
    accentSoft: "rgba(100, 116, 139, 0.12)",
    accentBorder: "rgba(100, 116, 139, 0.28)",
    accentShadow: "rgba(100, 116, 139, 0.16)",
    accentBgSubtle: "rgba(100, 116, 139, 0.08)",
    tableHeader: "#334155",
    tableHeaderAccent: "#64748B",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    success: "#059669",
    error: "#DC2626",
    cardShadow: "0 8px 32px rgba(15, 23, 42, 0.08)",
    glass: "rgba(255, 255, 255, 0.82)",
    colorPartido: "#7C3AED",
    colorPartidoLight: "#5B21B6",
    colorPartidoSoft: "rgba(124, 58, 237, 0.12)",
    colorPartidoBorder: "rgba(91, 33, 182, 0.35)",
    onAccent: "#FFFFFF",
  },
};

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function applyThemeToDocument(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function persistTheme(theme) {
  try {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function getGlassCardStyle(theme) {
  return {
    background: THEMES[theme].glass,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };
}
