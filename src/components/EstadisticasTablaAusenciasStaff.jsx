import { useMemo, useState } from "react";
import { marcaRolPlantilla } from "../lib/plantillaRoles.js";
import { ordenarFilasEstadisticas } from "../lib/ordenarEstadisticas.js";

export function EstadisticasTablaAusenciasStaff({
  tipo,
  totalSesiones,
  estadisticas,
  theme,
  onSelectJugadora,
}) {
  const esPartido = tipo === "partido";
  const esFisico = tipo === "fisico";
  const {
    accent,
    accentLight,
    colorPartido,
    colorPartidoLight,
    text,
    textMuted,
    error,
    inputBorder,
    cardBgElevated,
  } = theme;
  const color = esPartido || esFisico ? colorPartido : accent;
  const colorLight = esPartido || esFisico ? colorPartidoLight : accentLight;
  const tituloTipo = esPartido ? "partidos" : esFisico ? "físicos" : "entrenos";
  const statsKey = esPartido ? "partidos" : esFisico ? "fisicos" : "entrenos";
  const columnasMotivo = esPartido
    ? [
        { key: "noConvocado", label: "No conv." },
        { key: "lesionado", label: "Lesion." },
      ]
    : [
        { key: "justificada", label: "Just." },
        { key: "noJustificada", label: "No just." },
        { key: "salud", label: "Salud" },
      ];

  const [sortKey, setSortKey] = useState("ausencias");
  const [sortDir, setSortDir] = useState("desc");

  const filas = useMemo(
    () => ordenarFilasEstadisticas(estadisticas, { sortKey, sortDir, statsKey }),
    [estadisticas, sortKey, sortDir, statsKey]
  );

  if (!estadisticas?.length || totalSesiones === 0) return null;

  const toggleSort = (key, defaultDir = "desc") => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(defaultDir);
  };

  const SortBtn = ({ colKey, label, align = "center", defaultDir = "desc" }) => {
    const activo = sortKey === colKey;
    return (
      <button
        type="button"
        className={`stats-table-sort${activo ? " stats-table-sort--active" : ""}${align === "center" ? " stats-table-sort--center" : ""}`}
        onClick={() => toggleSort(colKey, defaultDir)}
      >
        <span className="stats-table-sort__label">{label}</span>
        <span className="stats-table-sort__icon" aria-hidden="true">
          {activo ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    );
  };

  return (
    <div className="stats-section tactical-card">
      <div className="stats-section-header" style={{ borderLeftColor: color }}>
        <span className="stats-section-dot" style={{ background: color }} />
        <span className="stats-section-header__title">Ausencias de entrenadores</span>
        <span className="stats-section-header__meta">{tituloTipo}</span>
      </div>
      <div className="stats-table stats-table--tipo stats-table--staff" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className={`stats-table-header stats-table-header--tipo stats-table-header--staff${esPartido ? " stats-table-header--staff-partido" : ""}`} role="row">
          <SortBtn colKey="nombre" label="Nombre" align="start" defaultDir="asc" />
          <SortBtn colKey="ausencias" label="Aus." />
          {columnasMotivo.map((col) => (
            <SortBtn key={col.key} colKey={col.key} label={col.label} />
          ))}
        </div>
        {filas.map((row) => {
          const j = row.jugadora;
          const stats = row[statsKey] || {};
          return (
            <button
              key={j.id}
              type="button"
              className={`stats-table-row stats-table-row--tipo stats-table-row--clickable stats-table-row--staff${esPartido ? " stats-table-row--staff-partido" : ""}`}
              title={`Ver ausencias de ${j.nombre}`}
              onClick={() => onSelectJugadora?.(j.id)}
              style={{
                background: cardBgElevated,
                border: `1px solid ${inputBorder}`,
                color: text,
              }}
            >
              <div style={{ minWidth: 0, overflow: "hidden", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: colorLight, fontWeight: 800, fontSize: 11, letterSpacing: "0.06em" }}>
                  {marcaRolPlantilla(j.rolPlantilla)}
                </span>
                <span className="stats-table-row__nombre">{j.nombre}</span>
              </div>
              <span style={{ textAlign: "center", color: stats.ausencias > 0 ? error : textMuted, fontWeight: 700, fontSize: 13 }}>
                {stats.ausencias}
              </span>
              {columnasMotivo.map((col) => (
                <span key={col.key} style={{ textAlign: "center", color: textMuted, fontWeight: 600, fontSize: 13 }}>
                  {stats[col.key] || 0}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
