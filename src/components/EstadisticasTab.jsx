import { useEffect, useState } from "react";
import { IconChart } from "./icons.jsx";
import { EstadisticasTablaTipo } from "./EstadisticasTablaTipo.jsx";
import { FichaJugadoraStats } from "./FichaJugadoraStats.jsx";

export function EstadisticasTab({
  equipoActivo,
  text,
  textSecondary,
  textMuted,
  accent,
  accentLight,
  accentSoft,
  colorPartido,
  colorPartidoLight,
  inputBorder,
  inputBg,
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
  jugadorasLoading,
  sesionesLoading,
  jugadoras,
  sesionesFiltradas,
  statsVista,
  onStatsVistaChange,
  estadisticas,
  equipoLabels,
  onGoToPlantilla,
}) {
  const [fichaId, setFichaId] = useState(null);

  useEffect(() => {
    setFichaId(null);
  }, [equipoActivo?.id]);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
        alignItems: "center",
        padding: "8px 0 20px 0",
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <h2
          style={{
            color: text,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.02em",
            margin: "0 0 6px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <IconChart size={22} color={accent} />
          Estadísticas
        </h2>
        <div style={{ color: textSecondary, fontSize: 15, fontWeight: 500 }}>
          Equipo <span style={{ color: accentLight }}>{equipoActivo.nombre}</span>
        </div>
      </div>

      <div
        className="stats-filters"
        style={{
          width: "100%",
          background: cardBgElevated,
          border: `1px solid ${inputBorder}`,
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            color: textSecondary,
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Periodo
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { key: "semanal", label: "Semanal" },
            { key: "mensual", label: "Mensual" },
            { key: "rango", label: "Personalizado" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onStatsPeriodoChange(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                border: `1px solid ${statsPeriodo === key ? accent : inputBorder}`,
                background: statsPeriodo === key ? accentSoft : "transparent",
                color: statsPeriodo === key ? accentLight : textMuted,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {statsPeriodo === "rango" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="date"
              value={statsDesde}
              onChange={(e) => onStatsDesdeChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: 130,
                padding: "9px 10px",
                borderRadius: 9,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: 14,
              }}
            />
            <span style={{ color: textMuted }}>→</span>
            <input
              type="date"
              value={statsHasta}
              onChange={(e) => onStatsHastaChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: 130,
                padding: "9px 10px",
                borderRadius: 9,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: text,
                fontSize: 14,
              }}
            />
          </div>
        )}
        <div style={{ color: textMuted, fontSize: 13 }}>
          {rango.inicio && rango.fin
            ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")} · ${totalEntrenos} entreno${totalEntrenos === 1 ? "" : "s"} · ${totalPartidos} partido${totalPartidos === 1 ? "" : "s"}`
            : "Selecciona un rango de fechas válido"}
        </div>
      </div>

      {jugadorasLoading || sesionesLoading ? (
        <div
          style={{
            color: textMuted,
            fontSize: 16,
            fontStyle: "italic",
            padding: "12px 0",
            fontWeight: 500,
          }}
        >
          Cargando estadísticas...
        </div>
      ) : jugadoras.length === 0 ? (
        <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15.5, textAlign: "center" }}>
          {equipoLabels.noHayJugadoresPlantilla}{" "}
          <button
            type="button"
            onClick={onGoToPlantilla}
            style={{
              background: "transparent",
              border: "none",
              color: accent,
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Ir a Plantilla
          </button>
        </div>
      ) : sesionesFiltradas.length === 0 ? (
        <div
          style={{
            color: textMuted,
            fontStyle: "italic",
            fontSize: 15.5,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          No hay entrenos ni partidos en el periodo seleccionado.
        </div>
      ) : ficha ? (
        <FichaJugadoraStats
          jugadora={ficha.jugadora}
          entrenos={ficha.entrenos}
          partidos={ficha.partidos}
          rango={rango}
          onBack={() => setFichaId(null)}
          labels={equipoLabels}
          accent={accent}
          accentLight={accentLight}
          colorPartido={colorPartido}
          colorPartidoLight={colorPartidoLight}
          text={text}
          textMuted={textMuted}
          textSecondary={textSecondary}
          success={success}
          error={error}
          inputBorder={inputBorder}
          cardBgElevated={cardBgElevated}
        />
      ) : (
        <>
          <div
            className="stats-type-nav"
            style={{
              width: "100%",
              display: "flex",
              gap: 6,
              padding: 4,
              background: cardBgElevated,
              borderRadius: 12,
              border: `1px solid ${inputBorder}`,
            }}
          >
            {[
              { key: "entrenos", label: "Entrenos", color: accent },
              { key: "partidos", label: "Partidos", color: colorPartido },
              { key: "todo", label: "Todo", color: textSecondary },
            ].map(({ key, label, color: tabColor }) => (
              <button
                key={key}
                type="button"
                onClick={() => onStatsVistaChange(key)}
                className={`stats-type-nav-btn${statsVista === key ? " stats-type-nav-btn--active" : ""}`}
                style={{
                  flex: 1,
                  border:
                    statsVista === key
                      ? `1px solid ${key === "partidos" ? "rgba(139,92,246,0.45)" : key === "entrenos" ? "rgba(100, 116, 139, 0.35)" : inputBorder}`
                      : "1px solid transparent",
                  background:
                    statsVista === key
                      ? key === "partidos"
                        ? "rgba(139,92,246,0.18)"
                        : key === "entrenos"
                          ? accentSoft
                          : "rgba(148,163,184,0.12)"
                      : "transparent",
                  color: statsVista === key ? (key === "todo" ? text : tabColor) : textMuted,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="stats-sections"
            style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}
          >
            {(statsVista === "entrenos" || statsVista === "todo") && (
              <EstadisticasTablaTipo
                tipo="entreno"
                totalSesiones={totalEntrenos}
                estadisticas={estadisticas}
                theme={statsTheme}
                labels={equipoLabels}
                onSelectJugadora={setFichaId}
              />
            )}
            {(statsVista === "partidos" || statsVista === "todo") && (
              <EstadisticasTablaTipo
                tipo="partido"
                totalSesiones={totalPartidos}
                estadisticas={estadisticas}
                theme={statsTheme}
                labels={equipoLabels}
                onSelectJugadora={setFichaId}
              />
            )}
            <p className="stats-ficha-hint" style={{ color: textMuted }}>
              Pulsa una {equipoLabels.jugador.toLowerCase()} para ver su ficha.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
