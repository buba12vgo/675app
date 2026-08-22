import { IconChevronLeft } from "./icons.jsx";
import { MOTIVOS_AUSENCIA } from "../lib/motivosAusencia.js";
import { combinarStatsJugadora, porcentajeAsistencia } from "../lib/appUtils.js";

function Metric({ label, value, color, muted }) {
  return (
    <div className="stats-ficha-metric">
      <div className="stats-ficha-metric__label" style={{ color: muted }}>{label}</div>
      <div className="stats-ficha-metric__value" style={{ color }}>{value}</div>
    </div>
  );
}

function BloqueTipo({
  titulo,
  color,
  colorLight,
  stats,
  labelPresentes,
  labelAusencias,
  text,
  textMuted,
  textSecondary,
  success,
  error,
  inputBorder,
  cardBgElevated,
}) {
  const pct = porcentajeAsistencia(stats);
  return (
    <section
      className="stats-ficha-bloque"
      style={{
        border: `1px solid ${inputBorder}`,
        background: cardBgElevated,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <h3 className="stats-ficha-bloque__title" style={{ color }}>{titulo}</h3>
      <div className="stats-ficha-metrics">
        <Metric label="Sesiones" value={stats.total} color={text} muted={textMuted} />
        <Metric label={labelPresentes} value={stats.presentes} color={success} muted={textMuted} />
        <Metric label={labelAusencias} value={stats.ausencias} color={stats.ausencias ? error : textMuted} muted={textMuted} />
        <Metric label="% asistencia" value={pct === null ? "—" : `${pct}%`} color={colorLight} muted={textMuted} />
        <Metric
          label="Nota media"
          value={stats.notaMedia !== null ? stats.notaMedia.toFixed(1) : "—"}
          color={stats.notaMedia !== null ? colorLight : textMuted}
          muted={textMuted}
        />
      </div>
      <div className="stats-ficha-ausencias">
        <div className="stats-ficha-ausencias__title" style={{ color: textSecondary }}>
          Tipo de ausencia
        </div>
        <div className="stats-ficha-ausencias__grid">
          {MOTIVOS_AUSENCIA.map((motivo) => {
            const value = {
              justificada: stats.justificada || 0,
              no_justificada: stats.noJustificada || 0,
              salud: stats.salud || 0,
            }[motivo.id] || 0;
            return (
              <div key={motivo.id} className="stats-ficha-ausencia" style={{ borderColor: inputBorder }}>
                <span className="stats-ficha-ausencia__label" style={{ color: textMuted }}>{motivo.label}</span>
                <span className="stats-ficha-ausencia__value" style={{ color: value ? error : textMuted }}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FichaJugadoraStats({
  jugadora,
  entrenos,
  partidos,
  rango,
  onBack,
  labels,
  accent,
  accentLight,
  colorPartido,
  colorPartidoLight,
  text,
  textMuted,
  textSecondary,
  success,
  error,
  inputBorder,
  cardBgElevated,
}) {
  const total = combinarStatsJugadora(entrenos, partidos);
  const periodo = rango?.inicio && rango?.fin
    ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")}`
    : "";

  return (
    <div className="stats-ficha">
      <button
        type="button"
        className="user-options-back"
        onClick={onBack}
        style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
      >
        <IconChevronLeft size={16} color={textMuted} />
        <span>Volver a estadísticas</span>
      </button>

      <header className="stats-ficha-hero" style={{ borderColor: inputBorder, background: cardBgElevated }}>
        <div className="stats-ficha-dorsal" style={{ background: accent, color: "#fff" }}>
          {jugadora.dorsal}
        </div>
        <div className="stats-ficha-hero__info">
          <div className="stats-ficha-hero__kicker" style={{ color: textMuted }}>{labels.fichaTitulo}</div>
          <h2 className="stats-ficha-hero__name" style={{ color: text }}>{jugadora.nombre}</h2>
          {jugadora.apodo?.trim() ? (
            <div className="stats-ficha-hero__apodo" style={{ color: textSecondary }}>"{jugadora.apodo}"</div>
          ) : null}
          {periodo ? (
            <div className="stats-ficha-hero__periodo" style={{ color: textMuted }}>{periodo}</div>
          ) : null}
        </div>
      </header>

      <BloqueTipo
        titulo="Resumen"
        color={textSecondary}
        colorLight={accentLight}
        stats={total}
        labelPresentes="Asist. / Conv."
        labelAusencias="Ausencias"
        text={text}
        textMuted={textMuted}
        textSecondary={textSecondary}
        success={success}
        error={error}
        inputBorder={inputBorder}
        cardBgElevated={cardBgElevated}
      />
      <BloqueTipo
        titulo="Entrenos"
        color={accent}
        colorLight={accentLight}
        stats={entrenos}
        labelPresentes="Asistencias"
        labelAusencias="Ausencias"
        text={text}
        textMuted={textMuted}
        textSecondary={textSecondary}
        success={success}
        error={error}
        inputBorder={inputBorder}
        cardBgElevated={cardBgElevated}
      />
      <BloqueTipo
        titulo="Partidos"
        color={colorPartido}
        colorLight={colorPartidoLight}
        stats={partidos}
        labelPresentes="Convocatorias"
        labelAusencias="No convocada"
        text={text}
        textMuted={textMuted}
        textSecondary={textSecondary}
        success={success}
        error={error}
        inputBorder={inputBorder}
        cardBgElevated={cardBgElevated}
      />
    </div>
  );
}
