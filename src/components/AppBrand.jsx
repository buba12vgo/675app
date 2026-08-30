const LOGO_SRC = "/logo-675.png";

export function AppBrand({ text, fontSize = 24, markSize = 36, onGoHome }) {
  return (
    <button
      type="button"
      className="app-brand"
      onClick={onGoHome}
      aria-label="675app — Volver a inicio"
      title="Volver a inicio"
    >
      <div className="app-brand__mark" style={{ width: markSize, height: markSize }}>
        <img className="app-brand__logo" src={LOGO_SRC} alt="" width={markSize} height={markSize} decoding="async" />
      </div>
      <span className="app-brand__text" style={{ fontSize, color: text }}>
        675<span style={{ color: "var(--color-accent)" }}>app</span>
      </span>
    </button>
  );
}
