import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";

export function EstadisticasTablaTipo({
  tipo,
  totalSesiones,
  estadisticas,
  theme,
  labels,
  onSelectJugadora,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const esPartido = tipo === "partido";
  const {
    accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary,
    error, success, inputBorder, cardBgElevated,
  } = theme;
  const color = esPartido ? colorPartido : accent;
  const colorLight = esPartido ? colorPartidoLight : accentLight;
  const titulo = esPartido ? "Partidos" : "Entrenos";
  const statsKey = esPartido ? "partidos" : "entrenos";
  const labelPresentes = esPartido ? "Conv." : "Asist.";
  const labelAusencias = esPartido ? "No conv." : "Aus.";

  if (totalSesiones === 0) {
    return (
      <div className="stats-section" style={{ width: "100%" }}>
        <div className="stats-section-header" style={{ borderLeftColor: color }}>
          <span className="stats-section-dot" style={{ background: color }} />
          <span style={{ color: text, fontWeight: 700, fontSize: 15 }}>{titulo}</span>
          <span style={{ color: textMuted, fontSize: 13 }}>0 en el periodo</span>
        </div>
        <div className="empty-state-text" style={{ padding: "8px 4px" }}>
          No hay {esPartido ? "partidos" : "entrenos"} en el periodo seleccionado.
        </div>
      </div>
    );
  }

  return (
    <div className="stats-section" style={{ width: "100%" }}>
      <div className="stats-section-header" style={{ borderLeftColor: color }}>
        <span className="stats-section-dot" style={{ background: color }} />
        <span style={{ color: text, fontWeight: 700, fontSize: 15 }}>{titulo}</span>
        <span style={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>
          {totalSesiones} {esPartido ? (totalSesiones === 1 ? "partido" : "partidos") : (totalSesiones === 1 ? "entreno" : "entrenos")} en el periodo
        </span>
      </div>
      <div className="stats-table stats-table--tipo" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="stats-table-header stats-table-header--tipo">
          <span>#</span>
          <span>{playerLabels.statsColumnaJugador}</span>
          <span title="Sesiones en el periodo">Ses.</span>
          <span title={esPartido ? "Convocadas" : "Asistencias"}>{labelPresentes}</span>
          <span title={esPartido ? "No convocadas" : "Ausencias"}>{labelAusencias}</span>
          <span title="Nota media">Nota</span>
        </div>
        {estadisticas.map(({ jugadora: j, [statsKey]: stats }) => (
          <button
            key={j.id}
            type="button"
            className="stats-table-row stats-table-row--tipo stats-table-row--clickable"
            title={`Ver ficha de ${j.nombre}`}
            onClick={() => onSelectJugadora?.(j.id)}
            style={{
              background: cardBgElevated,
              border: `1px solid ${inputBorder}`,
              color: text,
            }}
          >
            <span style={{ color, fontWeight: 700, fontSize: 15, textAlign: "center" }}>{j.dorsal}</span>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div className="stats-table-row__nombre">{j.nombre}</div>
            </div>
            <span style={{ textAlign: "center", color: textMuted, fontWeight: 600, fontSize: 13 }}>{stats.total}</span>
            <span style={{ textAlign: "center", color: success, fontWeight: 700, fontSize: 13 }}>{stats.presentes}</span>
            <span
              style={{ textAlign: "center", color: stats.ausencias > 0 ? error : textMuted, fontWeight: 700, fontSize: 13 }}
              title={
                stats.ausencias > 0
                  ? `Justificada ${stats.justificada || 0} · No justificada ${stats.noJustificada || 0} · Salud ${stats.salud || 0}`
                  : (esPartido ? "No convocadas" : "Ausencias")
              }
            >
              {stats.ausencias}
            </span>
            <span style={{ textAlign: "center", color: stats.notaMedia !== null ? colorLight : textMuted, fontWeight: 700, fontSize: 13 }}>
              {stats.notaMedia !== null ? stats.notaMedia.toFixed(1) : "—"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
