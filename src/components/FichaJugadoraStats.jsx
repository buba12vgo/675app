import { IconChevronLeft } from "./icons.jsx";
import {
  MOTIVOS_AUSENCIA_ENTRENO,
  motivosAusenciaParaTipo,
} from "../lib/motivosAusencia.js";
import { combinarStatsJugadora, porcentajeAsistencia } from "../lib/appUtils.js";
import { esStaffPlantilla, etiquetaRolPlantilla, marcaRolPlantilla } from "../lib/plantillaRoles.js";

function Metric({ label, value, color, muted }) {
  return (
    <div className="stats-ficha-metric">
      <div className="stats-ficha-metric__label" style={{ color: muted }}>{label}</div>
      <div className="stats-ficha-metric__value" style={{ color }}>{value}</div>
    </div>
  );
}

function valorMotivo(stats, motivoId) {
  return {
    justificada: stats.justificada || 0,
    no_justificada: stats.noJustificada || 0,
    salud: stats.salud || 0,
    doblaje: stats.doblaje || 0,
    no_convocado: stats.noConvocado || 0,
    lesionado: stats.lesionado || 0,
  }[motivoId] || 0;
}

function BloqueTipo({
  titulo,
  color,
  colorLight,
  stats,
  labelPresentes,
  labelAusencias,
  motivos,
  soloAusencias = false,
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
        {soloAusencias ? null : (
          <Metric label={labelPresentes} value={stats.presentes} color={success} muted={textMuted} />
        )}
        <Metric label={labelAusencias} value={stats.ausencias} color={stats.ausencias ? error : textMuted} muted={textMuted} />
        {soloAusencias ? null : (
          <Metric label="% asistencia" value={pct === null ? "—" : `${pct}%`} color={colorLight} muted={textMuted} />
        )}
        {soloAusencias ? null : (
          <Metric
            label="Nota media"
            value={stats.notaMedia !== null ? stats.notaMedia.toFixed(1) : "—"}
            color={stats.notaMedia !== null ? colorLight : textMuted}
            muted={textMuted}
          />
        )}
      </div>
      <div className="stats-ficha-ausencias">
        <div className="stats-ficha-ausencias__title" style={{ color: textSecondary }}>
          Tipo de ausencia
        </div>
        <div className="stats-ficha-ausencias__grid">
          {motivos.map((motivo) => {
            const value = valorMotivo(stats, motivo.id);
            const esDoblaje = motivo.id === "doblaje";
            return (
              <div key={motivo.id} className="stats-ficha-ausencia" style={{ borderColor: inputBorder }}>
                <span className="stats-ficha-ausencia__label" style={{ color: textMuted }}>{motivo.label}</span>
                <span
                  className="stats-ficha-ausencia__value"
                  style={{ color: value ? (esDoblaje ? textSecondary : error) : textMuted }}
                >
                  {value}
                </span>
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
  fisicos,
  rango,
  onBack,
  labels,
  generoEquipo = "femenino",
  accent,
  accentLight,
  colorPartido,
  colorPartidoLight,
  colorFisico,
  colorFisicoLight,
  text,
  textMuted,
  textSecondary,
  success,
  error,
  inputBorder,
  cardBgElevated,
}) {
  const total = combinarStatsJugadora(entrenos, partidos, fisicos);
  const periodo = rango?.inicio && rango?.fin
    ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")}`
    : "Todas las sesiones";
  const motivosEntreno = MOTIVOS_AUSENCIA_ENTRENO;
  const motivosPartido = motivosAusenciaParaTipo("partido", generoEquipo);
  const motivosResumen = [...motivosEntreno, ...motivosPartido];
  const labelNoConvocado = generoEquipo === "masculino" ? "No convocado" : "No convocada";
  const soloAusencias = esStaffPlantilla(jugadora);

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
          {soloAusencias ? marcaRolPlantilla(jugadora.rolPlantilla) : jugadora.dorsal}
        </div>
        <div className="stats-ficha-hero__info">
          <div className="stats-ficha-hero__kicker" style={{ color: textMuted }}>
            {soloAusencias ? etiquetaRolPlantilla(jugadora.rolPlantilla) : labels.fichaTitulo}
          </div>
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
        motivos={motivosResumen}
        soloAusencias={soloAusencias}
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
        motivos={motivosEntreno}
        soloAusencias={soloAusencias}
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
        labelAusencias={labelNoConvocado}
        motivos={motivosPartido}
        soloAusencias={soloAusencias}
        text={text}
        textMuted={textMuted}
        textSecondary={textSecondary}
        success={success}
        error={error}
        inputBorder={inputBorder}
        cardBgElevated={cardBgElevated}
      />
      <BloqueTipo
        titulo="Físicos"
        color={colorFisico || accent}
        colorLight={colorFisicoLight || accentLight}
        stats={fisicos || {}}
        labelPresentes="Asistencias"
        labelAusencias="Ausencias"
        motivos={motivosEntreno}
        soloAusencias={soloAusencias}
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
