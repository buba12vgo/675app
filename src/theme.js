export const STORAGE_THEME_KEY = "theme";

/**
 * La paleta vive en src/index.css. Estas claves leen esas variables
 * para que los estilos en línea no dupliquen hex ni se desvíen
 * (violeta de partido, aviso, sombra).
 */
export const THEME_CSS_VARS = {
  bg: "--color-bg",
  bgDark: "--color-bg-dark",
  cardBg: "--color-card",
  cardBgElevated: "--color-card-elevated",
  surface: "--color-surface",
  inputBg: "--color-input-bg",
  inputBorder: "--color-border",
  accent: "--color-accent",
  accentDark: "--color-accent-dark",
  accentLight: "--color-accent-strong",
  accentSoft: "--color-accent-soft",
  accentBorder: "--color-accent-border",
  accentShadow: "--color-accent-shadow",
  accentBgSubtle: "--color-accent-bg-subtle",
  tableHeader: "--color-table-header",
  tableHeaderAccent: "--color-table-header-accent",
  text: "--color-text",
  textSecondary: "--color-text-secondary",
  textMuted: "--color-text-muted",
  success: "--color-success",
  error: "--color-aviso",
  cardShadow: "--shadow-card",
  glass: "--color-glass",
  colorPartido: "--color-partido",
  colorPartidoLight: "--color-partido-light",
  colorPartidoSoft: "--color-partido-soft",
  colorPartidoBorder: "--color-partido-border",
  colorFisico: "--color-fisico",
  colorFisicoLight: "--color-fisico-light",
  colorFisicoSoft: "--color-fisico-soft",
  colorFisicoBorder: "--color-fisico-border",
  onAccent: "--color-on-accent",
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

export function getThemeColors(mode) {
  if (mode === "dark" || mode === "light") applyThemeToDocument(mode);
  const style = getComputedStyle(document.documentElement);
  const theme = {};
  for (const [key, cssVar] of Object.entries(THEME_CSS_VARS)) {
    theme[key] = style.getPropertyValue(cssVar).trim();
  }
  return theme;
}

/** Conserva el alfa hex (#RRGGBBAA) y sigue valiendo si el acento llega como rgb() o var(). */
export function withAccentAlpha(accent, hexByte) {
  const byte = String(hexByte).toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(accent)) return `${accent}${byte}`;
  const percent = Math.round((Number.parseInt(byte, 16) / 255) * 1000) / 10;
  return `color-mix(in srgb, ${accent} ${percent}%, transparent)`;
}

export function getGlassCardStyle() {
  return {
    background: "var(--color-glass)",
    backdropFilter: "blur(var(--blur-glass))",
    WebkitBackdropFilter: "blur(var(--blur-glass))",
  };
}
