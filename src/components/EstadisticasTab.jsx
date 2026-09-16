import { IconChart } from "./icons.jsx";
import { EstadisticasTablaTipo } from "./EstadisticasTablaTipo.jsx";
import { FichaJugadoraStats } from "./FichaJugadoraStats.jsx";
import { EmptyState } from "./EmptyState.jsx";

export function EstadisticasTab({
  equipoActivo,
  text,
  textSecondary,
  textMuted,
  accent,
  accentLight,
  accentSoft: _accentSoft,
  colorPartido,
  colorPartidoLight,
  colorFisico,
  colorFisicoLight,
  inputBorder,
  inputBg: _inputBg,
  cardBgElevated,
  surface,
  error,
  success,
  tableHeader,
  tableHeaderAccent,
  statsPeriodo,
  onStatsPeriodoChange,
  statsDesde,
  onStatsDesdeChange,
  statsHasta,
  onStatsHastaChange,
  rango,
  totalEntrenos,
  totalPartidos,
  totalFisicos = 0,
  jugadorasLoading,
  sesionesLoading,
  jugadoras,
  sesionesFiltradas,
  statsVista,
  onStatsVistaChange,
  estadisticas,
  equipoLabels,
  onGoToPlantilla,
  fichaId,
  onFichaIdChange,
}) {
  const ficha = fichaId ? (estadisticas || []).find((row) => row.jugadora.id === fichaId) : null;

  const statsTheme = {
    accent,
    accentLight,
    colorPartido,
    colorPartidoLight,
    text,
    textMuted,
    textSecondary,
    surface,
    error,
    success,
    inputBorder,
    cardBgElevated,
    tableHeader,
    tableHeaderAccent,
  };

  return (
    <div className="tactical-page">
      <div>
        <h2 className="tactical-title">
          <IconChart size={22} />
          Estadísticas
        </h2>
        <p className="tactical-lead">
          Equipo <strong>{equipoActivo.nombre}</strong>
        </p>
      </div>

      <div className="stats-filters tactical-card">
        <div className="field-label">Periodo</div>
        <div className="chip-row">
          {[
            { key: "todo", label: "Todo" },
            { key: "semanal", label: "Semanal" },
            { key: "mensual", label: "Mensual" },
            { key: "rango", label: "Personalizado" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onStatsPeriodoChange(key)}
              className={`chip${statsPeriodo === key ? " chip--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        {statsPeriodo === "rango" && (
          <div className="chip-row" style={{ alignItems: "center" }}>
            <input
              className="field-input"
              type="date"
              value={statsDesde}
              onChange={(e) => onStatsDesdeChange(e.target.value)}
              style={{ flex: 1, minWidth: 130 }}
            />
            <span style={{ color: "var(--color-text-muted)" }}>→</span>
            <input
              className="field-input"
              type="date"
              value={statsHasta}
              onChange={(e) => onStatsHastaChange(e.target.value)}
              style={{ flex: 1, minWidth: 130 }}
            />
          </div>
        )}
        <div className="tactical-lead" style={{ textAlign: "left" }}>
          {statsPeriodo === "todo"
            ? `Todas las sesiones · ${totalEntrenos} entreno${totalEntrenos === 1 ? "" : "s"} · ${totalPartidos} partido${totalPartidos === 1 ? "" : "s"} · ${totalFisicos} físico${totalFisicos === 1 ? "" : "s"}`
            : rango.inicio && rango.fin
            ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")} · ${totalEntrenos} entreno${totalEntrenos === 1 ? "" : "s"} · ${totalPartidos} partido${totalPartidos === 1 ? "" : "s"} · ${totalFisicos} físico${totalFisicos === 1 ? "" : "s"}`
            : "Selecciona un rango de fechas válido"}
        </div>
      </div>

      {jugadorasLoading || sesionesLoading ? (
        <EmptyState title="Cargando estadísticas…" />
      ) : jugadoras.length === 0 ? (
        <p className="tactical-lead">
          {equipoLabels.noHayJugadoresPlantilla}{" "}
          <button type="button" className="link-accent" onClick={onGoToPlantilla}>
            Ir a Plantilla
          </button>
        </p>
      ) : ficha ? (
        <FichaJugadoraStats
          jugadora={ficha.jugadora}
          entrenos={ficha.entrenos}
          partidos={ficha.partidos}
          fisicos={ficha.fisicos}
          rango={rango}
          onBack={() => onFichaIdChange(null)}
          labels={equipoLabels}
          generoEquipo={equipoActivo.genero}
          accent={accent}
          accentLight={accentLight}
          colorPartido={colorPartido}
          colorPartidoLight={colorPartidoLight}
          colorFisico={colorFisico}
          colorFisicoLight={colorFisicoLight}
          text={text}
          textMuted={textMuted}
          textSecondary={textSecondary}
          success={success}
          error={error}
          inputBorder={inputBorder}
          cardBgElevated={cardBgElevated}
        />
      ) : sesionesFiltradas.length === 0 ? (
        <EmptyState
          title="No hay sesiones en el periodo seleccionado."
          hint="Prueba otro rango o programa una sesión en el calendario."
        />
      ) : (
        <>
          <div className="stats-type-nav">
            {[
              { key: "entrenos", label: "Entrenos" },
              { key: "partidos", label: "Partidos" },
              { key: "fisicos", label: "Físicos" },
              { key: "todo", label: "Todo" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onStatsVistaChange(key)}
                className={`stats-type-nav-btn stats-type-nav-btn--${key}${statsVista === key ? " stats-type-nav-btn--active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="stats-sections">
            {(statsVista === "entrenos" || statsVista === "todo") && (
              <EstadisticasTablaTipo
                tipo="entreno"
                totalSesiones={totalEntrenos}
                estadisticas={estadisticas}
                theme={statsTheme}
                labels={equipoLabels}
                onSelectJugadora={onFichaIdChange}
              />
            )}
            {(statsVista === "partidos" || statsVista === "todo") && (
              <EstadisticasTablaTipo
                tipo="partido"
                totalSesiones={totalPartidos}
                estadisticas={estadisticas}
                theme={statsTheme}
                labels={equipoLabels}
                onSelectJugadora={onFichaIdChange}
              />
            )}
            {(statsVista === "fisicos" || statsVista === "todo") && (
              <EstadisticasTablaTipo
                tipo="fisico"
                totalSesiones={totalFisicos}
                estadisticas={estadisticas}
                theme={{ ...statsTheme, colorPartido: colorFisico, colorPartidoLight: colorFisicoLight }}
                labels={equipoLabels}
                onSelectJugadora={onFichaIdChange}
              />
            )}
            <p className="stats-ficha-hint">
              Pulsa una {equipoLabels.jugador.toLowerCase()} para ver su ficha.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
