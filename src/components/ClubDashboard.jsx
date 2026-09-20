import { useMemo, useState } from "react";
import { IconChart } from "./icons.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { EntityLogoMark } from "./EntityLogoMark.jsx";
import { formatGeneroEquipo, formatTipoCanasta } from "../lib/appUtils.js";
import {
  agregarKpis,
  balancePartidos,
  calcularKpisEquipos,
  formatearNota,
  formatearPct,
} from "../lib/dashboardKpis.js";

const PERIODOS = [
  { key: "mensual", label: "Este mes" },
  { key: "semanal", label: "Esta semana" },
  { key: "todo", label: "Todo" },
];

function KpiStat({ label, value }) {
  return (
    <div className="dash-kpi">
      <div className="dash-kpi__value">{value}</div>
      <div className="dash-kpi__label">{label}</div>
    </div>
  );
}

function ResumenStrip({ kpis, titulo }) {
  return (
    <section className="tactical-card dash-summary">
      <h3 className="dash-summary__title">{titulo}</h3>
      <div className="dash-kpi-grid">
        <KpiStat label="Jugadoras" value={kpis.jugadoras} />
        <KpiStat label="Sesiones" value={kpis.sesiones} />
        <KpiStat label="Partidos" value={kpis.partidos} />
        <KpiStat label="Absentismo" value={formatearPct(kpis.absentismoPct)} />
        <KpiStat label="Asistencia" value={formatearPct(kpis.asistenciaPct)} />
        <KpiStat label="Balance" value={balancePartidos(kpis)} />
      </div>
    </section>
  );
}

export function ClubDashboard({
  titulo,
  lead,
  equipos = [],
  equiposLoading = false,
  jugadoras = [],
  sesiones = [],
  loading = false,
  clubes = [],
  mostrarFiltroClub = false,
  getClubNombre,
  getEquipoLogo,
  onEntrarEquipo,
  accentLight,
  accentSoft,
  accentBorder,
}) {
  const [periodo, setPeriodo] = useState("mensual");
  const [clubFiltro, setClubFiltro] = useState("");

  const equiposVisibles = useMemo(() => {
    if (!mostrarFiltroClub || !clubFiltro) return equipos;
    return equipos.filter((equipo) => equipo.clubId === clubFiltro);
  }, [equipos, mostrarFiltroClub, clubFiltro]);

  const filas = useMemo(
    () => calcularKpisEquipos({ equipos: equiposVisibles, jugadoras, sesiones, periodo }),
    [equiposVisibles, jugadoras, sesiones, periodo]
  );
  const totales = useMemo(() => agregarKpis(filas), [filas]);

  return (
    <div className="club-dashboard tactical-page">
      <h2 className="tactical-title">
        <IconChart size={22} />
        {titulo}
      </h2>
      {lead ? <p className="tactical-lead">{lead}</p> : null}

      <div className="stats-filters tactical-card">
        <div className="field-label">Periodo</div>
        <div className="chip-row">
          {PERIODOS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`chip${periodo === key ? " chip--active" : ""}`}
              onClick={() => setPeriodo(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {mostrarFiltroClub && clubes.length > 0 ? (
          <>
            <div className="field-label">Club</div>
            <select
              className="field-input"
              value={clubFiltro}
              onChange={(e) => setClubFiltro(e.target.value)}
              aria-label="Filtrar por club"
            >
              <option value="">Todos los clubes</option>
              {clubes.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.nombre}
                </option>
              ))}
            </select>
          </>
        ) : null}
      </div>

      {equiposLoading || loading ? (
        <EmptyState title="Cargando dashboard…" />
      ) : equiposVisibles.length === 0 ? (
        <EmptyState title="No hay equipos para mostrar." hint="Crea un equipo o cambia el filtro de club." />
      ) : (
        <>
          <ResumenStrip
            kpis={totales}
            titulo={clubFiltro && getClubNombre ? `Resumen · ${getClubNombre(clubFiltro)}` : "Resumen"}
          />
          <div className="dash-team-grid">
            {filas.map(({ equipo, kpis }) => (
              <article key={equipo.id} className="tactical-card dash-team-card">
                <header className="dash-team-card__header">
                  <EntityLogoMark
                    logoUrl={getEquipoLogo?.(equipo)}
                    nombre={equipo.nombre}
                    accentLight={accentLight}
                    accentSoft={accentSoft}
                    accentBorder={accentBorder}
                    className="team-context-logo"
                  />
                  <div className="dash-team-card__titles">
                    <h3 className="dash-team-card__name">{equipo.nombre}</h3>
                    <p className="dash-team-card__meta">
                      {formatTipoCanasta(equipo.tipoCanasta)} · {formatGeneroEquipo(equipo.genero)}
                      {mostrarFiltroClub && getClubNombre?.(equipo.clubId)
                        ? ` · ${getClubNombre(equipo.clubId)}`
                        : ""}
                    </p>
                  </div>
                </header>
                <div className="dash-kpi-grid dash-kpi-grid--team">
                  <KpiStat label="Jugadoras" value={kpis.jugadoras} />
                  <KpiStat label="Sesiones" value={kpis.sesiones} />
                  <KpiStat label="Partidos" value={kpis.partidos} />
                  <KpiStat label="Entrenos" value={kpis.entrenos} />
                  <KpiStat label="Absentismo" value={formatearPct(kpis.absentismoPct)} />
                  <KpiStat label="Balance" value={balancePartidos(kpis)} />
                  <KpiStat label="Nota media" value={formatearNota(kpis.notaMedia)} />
                  <KpiStat label="Staff" value={kpis.staff} />
                </div>
                {onEntrarEquipo ? (
                  <button type="button" className="btn-primary btn-primary--block dash-team-card__enter" onClick={() => onEntrarEquipo(equipo)}>
                    Ver equipo
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
