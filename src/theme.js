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
    accent: "#C2410C",
    accentDark: "#9A3412",
    accentLight: "#F0B27A",
    accentSoft: "rgba(194, 65, 12, 0.20)",
    accentBorder: "rgba(240, 178, 122, 0.38)",
    accentShadow: "rgba(194, 65, 12, 0.35)",
    accentBgSubtle: "rgba(194, 65, 12, 0.12)",
    tableHeader: "#E2E8F0",
    tableHeaderAccent: "#F0B27A",
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
    bg: "#F7F3ED",
    bgDark: "#F1EBE3",
    cardBg: "#FFFCF8",
    cardBgElevated: "#F4EDE4",
    surface: "#EDE4D8",
    inputBg: "#FFFCF8",
    inputBorder: "#E0D3C4",
    accent: "#B45309",
    accentDark: "#92400E",
    accentLight: "#9A3412",
    accentSoft: "rgba(180, 83, 9, 0.12)",
    accentBorder: "rgba(180, 83, 9, 0.30)",
    accentShadow: "rgba(180, 83, 9, 0.22)",
    accentBgSubtle: "rgba(180, 83, 9, 0.08)",
    tableHeader: "#9A3412",
    tableHeaderAccent: "#B45309",
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
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };
}
