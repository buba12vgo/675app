export function CrearEquipoCard({ onClick, accent, accentLight, accentSoft, textMuted, inputBorder }) {
  return (
    <button
      type="button"
      className="entity-list-card crear-equipo-card"
      onClick={onClick}
      style={{ borderLeftColor: accent, borderColor: inputBorder }}
      aria-label="Crear equipo"
    >
      <span className="crear-equipo-card__icon" style={{ color: accentLight, background: accentSoft, borderColor: `${accent}44` }}>
        +
      </span>
      <span className="crear-equipo-card__label" style={{ color: accentLight }}>
        Crear equipo
      </span>
      <span className="crear-equipo-card__hint" style={{ color: textMuted }}>
        Añadir uno nuevo al club
      </span>
    </button>
  );
}
