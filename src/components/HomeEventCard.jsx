import {
  formatearFechaCorta,
  etiquetaDiaRelativo,
  getMetricasEvento,
} from "../lib/appUtils.js";
import { IconCalendar } from "./icons.jsx";

function getIconoClimaDecorativo(fechaStr) {
  const iconos = ["☀️", "⛅", "🌤️", "🌥️", "💨"];
  const hash = (fechaStr || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return iconos[hash % iconos.length];
}

export function HomeEventCard({
  tipo,
  sesion,
  hoyStr,
  mananaStr,
  accent,
  accentLight,
  accentSoft,
  accentBorder,
  colorPartido,
  colorPartidoLight,
  colorPartidoSoft,
  colorPartidoBorder,
  text,
  textMuted,
  textSecondary,
  success,
  onOpen,
  onSchedule,
  scheduling = false,
}) {
  const esPartido = tipo === "partido";
  const color = esPartido ? colorPartido : accent;
  const colorLight = esPartido ? colorPartidoLight : accentLight;
  const colorSoft = esPartido ? colorPartidoSoft : accentSoft;
  const colorBorder = esPartido ? colorPartidoBorder : accentBorder;
  const titulo = esPartido ? "Próximo partido" : "Próximo entreno";
  const metricas = sesion ? getMetricasEvento(sesion) : null;
  const metricaLabel = esPartido ? "Convocadas" : "Confirmadas";
  const metricaTexto = metricas?.total
    ? `${metricaLabel}: ${metricas.confirmadas}/${metricas.total}`
    : `${metricaLabel}: sin datos`;

  return (
    <article className={`home-event-card home-event-card--${tipo}`} style={{ borderLeftColor: color }}>
      <div className="home-event-card__top">
        <div className="home-event-card__title-wrap">
          <IconCalendar size={17} color={colorLight} />
          <span className="home-event-card__title" style={{ color: colorLight }}>{titulo}</span>
        </div>
        {sesion && (
          <div className="home-event-card__badges">
            <span className="home-event-card__badge" style={{ background: colorSoft, color: colorLight, borderColor: colorBorder }}>
              {etiquetaDiaRelativo(sesion.fecha, hoyStr, mananaStr)}
            </span>
            <span className="home-event-card__weather" title="Previsión orientativa">{getIconoClimaDecorativo(sesion.fecha)}</span>
          </div>
        )}
      </div>

      {sesion ? (
        <>
          <div className="home-event-card__body">
            <h3 className="home-event-card__headline" style={{ color: text }}>
              {esPartido
                ? `vs ${sesion.rival?.trim() || "Rival por confirmar"}`
                : (sesion.tematica?.trim() || "Entrenamiento")}
            </h3>
            <p className="home-event-card__meta" style={{ color: textMuted }}>
              {formatearFechaCorta(sesion.fecha)}
              {esPartido
                ? (sesion.local === "fuera" ? " · Fuera" : " · En casa")
                : (sesion.ejercicios?.trim() ? ` · ${sesion.ejercicios.trim().slice(0, 48)}${sesion.ejercicios.trim().length > 48 ? "…" : ""}` : "")}
            </p>
          </div>
          <div className="home-event-card__footer">
            <div className="home-event-card__metrics">
              <span className="home-event-card__metric" style={{ color: textSecondary }}>
                {metricaTexto}
              </span>
              {metricas?.total > 0 && (
                <span className="home-event-card__metric" style={{ color: success }}>
                  {Math.round((metricas.confirmadas / metricas.total) * 100)}% lista
                </span>
              )}
            </div>
            <button
              type="button"
              className="home-event-card__action"
              onClick={() => onOpen(sesion.fecha)}
              style={{ color: colorLight, borderColor: colorBorder }}
            >
              Ver en calendario
            </button>
          </div>
        </>
      ) : (
        <div className="home-event-card__empty-wrap">
          <p className="home-event-card__empty" style={{ color: textMuted }}>
            {esPartido ? "No hay partidos programados." : "No hay entreno programado para hoy ni para mañana."}
          </p>
          {onSchedule && (
            <button
              type="button"
              className="home-event-card__schedule-btn"
              onClick={onSchedule}
              disabled={scheduling}
              style={{
                color: "#fff",
                background: color,
                borderColor: color,
                opacity: scheduling ? 0.75 : 1,
                cursor: scheduling ? "wait" : "pointer",
              }}
            >
              {scheduling
                ? "Programando…"
                : (esPartido ? "+ Programar partido" : "+ Programar entrenamiento")}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
