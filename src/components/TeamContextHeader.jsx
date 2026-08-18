import { ClubInitialsMark } from "./ClubInitialsMark.jsx";
import { IconChevronLeft } from "./icons.jsx";

export function TeamContextHeader({
  clubNombre,
  equipoNombre,
  equipoMeta,
  onCambiarEquipo,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  textSecondary,
  textMuted,
  variant = "sidebar",
}) {
  return (
    <div className={`team-context-header team-context-header--${variant}`}>
      <div className="team-context-brand">
        <ClubInitialsMark
          clubNombre={clubNombre}
          accentLight={accentLight}
          accentSoft={accentSoft}
          accentBorder={accentBorder}
        />
        <div className="team-context-text">
          <div className="team-context-club" style={{ color: textSecondary }}>{clubNombre}</div>
          <div className="team-context-team" style={{ color: text }}>{equipoNombre}</div>
          {equipoMeta && (
            <div className="team-context-meta" style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>
              {equipoMeta}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        className="team-context-back"
        onClick={onCambiarEquipo}
        style={{ color: textMuted, borderColor: accentBorder }}
      >
        <IconChevronLeft size={16} color={textMuted} />
        <span>Cambiar equipo</span>
      </button>
    </div>
  );
}
