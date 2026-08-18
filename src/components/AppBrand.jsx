import { THEMES } from "../theme.js";

const THEME = THEMES.dark;

export function AppBrand({ accent = THEME.accent, text = THEME.text, fontSize = 24, onGoHome }) {
  return (
    <button
      type="button"
      className="app-brand"
      onClick={onGoHome}
      aria-label="Volver a inicio"
      title="Volver a inicio"
    >
      <div className="app-brand__mark" style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${THEME.accentDark} 100%)`,
        boxShadow: `0 4px 14px ${THEME.accentShadow}`,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="app-brand__text" style={{ fontSize, color: text }}>
        675<span style={{ color: accent }}>app</span>
      </span>
    </button>
  );
}
