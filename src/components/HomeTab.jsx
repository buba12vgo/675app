import { formatTipoCanasta, formatGeneroEquipo } from "../lib/appUtils.js";
import { HomeEventCard } from "./HomeEventCard.jsx";

export function HomeTab({
  equipoActivo,
  sesionesLoading,
  proximoEntreno,
  proximoPartido,
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
  onOpenCalendar,
  onScheduleEntreno,
  onSchedulePartido,
  guardandoSesion,
}) {
  return (
    <div className="home-dashboard" style={{ margin: "0 auto", padding: "16px 0 8px" }}>
      <div className="home-dashboard__intro">
        <div className="home-dashboard__title" style={{ color: text }}>
          {equipoActivo.nombre}
        </div>
        <div className="home-dashboard__meta">
          {formatTipoCanasta(equipoActivo.tipoCanasta)} · {formatGeneroEquipo(equipoActivo.genero)}
        </div>
        <div className="home-dashboard__lead">
          Resumen del equipo
        </div>
      </div>

      {sesionesLoading ? (
        <div className="empty-state" style={{ textAlign: "center" }}>
          <p className="empty-state__title">Cargando calendario…</p>
        </div>
      ) : (
        <div className="home-dashboard__cards">
          <HomeEventCard
            tipo="entreno"
            sesion={proximoEntreno}
            hoyStr={hoyStr}
            mananaStr={mananaStr}
            accent={accent}
            accentLight={accentLight}
            accentSoft={accentSoft}
            accentBorder={accentBorder}
            colorPartido={colorPartido}
            colorPartidoLight={colorPartidoLight}
            colorPartidoSoft={colorPartidoSoft}
            colorPartidoBorder={colorPartidoBorder}
            text={text}
            textMuted={textMuted}
            textSecondary={textSecondary}
            success={success}
            onOpen={onOpenCalendar}
            onSchedule={proximoEntreno ? undefined : onScheduleEntreno}
            scheduling={guardandoSesion}
          />
          <HomeEventCard
            tipo="partido"
            sesion={proximoPartido}
            hoyStr={hoyStr}
            mananaStr={mananaStr}
            accent={accent}
            accentLight={accentLight}
            accentSoft={accentSoft}
            accentBorder={accentBorder}
            colorPartido={colorPartido}
            colorPartidoLight={colorPartidoLight}
            colorPartidoSoft={colorPartidoSoft}
            colorPartidoBorder={colorPartidoBorder}
            text={text}
            textMuted={textMuted}
            textSecondary={textSecondary}
            success={success}
            onOpen={onOpenCalendar}
            onSchedule={proximoPartido ? undefined : onSchedulePartido}
            scheduling={guardandoSesion}
          />
        </div>
      )}
    </div>
  );
}
