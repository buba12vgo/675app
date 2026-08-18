import { IconSun, IconMoon } from "./icons.jsx";

export function ThemeToggleButton({ colorMode, onToggle }) {
  const isDark = colorMode === "dark";
  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  );
}
