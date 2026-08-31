import { formatTipoCanasta, formatGeneroEquipo } from "../lib/appUtils.js";
import { HomeEventCard } from "./HomeEventCard.jsx";

export function HomeTab({
  equipoActivo,
  sesionesLoading,
  proximoEntreno,
  proximoPartido,
  proximoFisico,
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
  colorFisico,
  colorFisicoLight,
  colorFisicoSoft,
  colorFisicoBorder,
  text,
  textMuted,
  textSecondary,
  success,
  onOpenCalendar,
  onScheduleEntreno,
  onSchedulePartido,
  onScheduleFisico,
  canScheduleEntreno = true,
  canSchedulePartido = true,
  canScheduleFisico = true,
  guardandoSesion,
}) {
  const colorProps = {
    accent,
    accentLight,
    accentSoft,
    accentBorder,
    colorPartido,
    colorPartidoLight,
    colorPartidoSoft,
    colorPartidoBorder,
    colorFisico,
    colorFisicoLight,
    colorFisicoSoft,
    colorFisicoBorder,
    text,
    textMuted,
    textSecondary,
    success,
  };

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
            {...colorProps}
            onOpen={(fecha) => onOpenCalendar(fecha, "entreno")}
            onSchedule={proximoEntreno || !canScheduleEntreno ? undefined : onScheduleEntreno}
            scheduling={guardandoSesion}
          />
          <HomeEventCard
            tipo="partido"
            sesion={proximoPartido}
            hoyStr={hoyStr}
            mananaStr={mananaStr}
            {...colorProps}
            onOpen={(fecha) => onOpenCalendar(fecha, "partido")}
            onSchedule={proximoPartido || !canSchedulePartido ? undefined : onSchedulePartido}
            scheduling={guardandoSesion}
          />
          <HomeEventCard
            tipo="fisico"
            sesion={proximoFisico}
            hoyStr={hoyStr}
            mananaStr={mananaStr}
            {...colorProps}
            onOpen={(fecha) => onOpenCalendar(fecha, "fisico")}
            onSchedule={proximoFisico || !canScheduleFisico ? undefined : onScheduleFisico}
            scheduling={guardandoSesion}
          />
        </div>
      )}
    </div>
  );
}
