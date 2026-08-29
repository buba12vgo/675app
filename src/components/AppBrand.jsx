import { IconBasketball } from "./icons.jsx";

export function AppBrand({ text, fontSize = 24, onGoHome }) {
  return (
    <button
      type="button"
      className="app-brand"
      onClick={onGoHome}
      aria-label="Volver a inicio"
      title="Volver a inicio"
    >
      <div className="app-brand__mark">
        <IconBasketball size={18} color="#fff" />
      </div>
      <span className="app-brand__text" style={{ fontSize, color: text }}>
        675<span style={{ color: "var(--color-accent)" }}>app</span>
      </span>
    </button>
  );
}
