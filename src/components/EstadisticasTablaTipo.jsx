import { useMemo, useState } from "react";
import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";
import { ordenarFilasEstadisticas } from "../lib/ordenarEstadisticas.js";

const SORT_COLUMNS = [
  { key: "dorsal", label: "#", title: "Dorsal", align: "start", defaultDir: "asc" },
  { key: "nombre", align: "start", defaultDir: "asc" },
  { key: "total", label: "Ses.", title: "Sesiones en el periodo", align: "center", defaultDir: "desc" },
  { key: "presentes", align: "center", defaultDir: "desc" },
  { key: "ausencias", align: "center", defaultDir: "desc" },
  { key: "notaMedia", label: "Nota", title: "Nota media", align: "center", defaultDir: "desc" },
];

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
  const esFisico = tipo === "fisico";
  const {
    accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary,
    error, success, inputBorder, cardBgElevated,
  } = theme;
  const color = esPartido || esFisico ? colorPartido : accent;
  const colorLight = esPartido || esFisico ? colorPartidoLight : accentLight;
  const titulo = esPartido ? "Partidos" : esFisico ? "Físicos" : "Entrenos";
  const statsKey = esPartido ? "partidos" : esFisico ? "fisicos" : "entrenos";
  const labelPresentes = esPartido ? "Conv." : "Asist.";
  const labelAusencias = esPartido ? "No conv." : "Aus.";
  const nombrePlural = esPartido ? "partidos" : esFisico ? "físicos" : "entrenos";
  const nombreSingular = esPartido ? "partido" : esFisico ? "físico" : "entreno";

  const [sortKey, setSortKey] = useState("dorsal");
  const [sortDir, setSortDir] = useState("asc");

  const filas = useMemo(
    () => ordenarFilasEstadisticas(estadisticas, { sortKey, sortDir, statsKey }),
    [estadisticas, sortKey, sortDir, statsKey]
  );

  const toggleSort = (col) => {
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(col.key);
    setSortDir(col.defaultDir);
  };

  const columnMeta = (col) => {
    if (col.key === "nombre") {
      return { label: playerLabels.statsColumnaJugador, title: playerLabels.statsColumnaJugador };
    }
    if (col.key === "presentes") {
      return {
        label: labelPresentes,
        title: esPartido ? "Convocadas" : "Asistencias",
      };
    }
    if (col.key === "ausencias") {
      return {
        label: labelAusencias,
        title: esPartido ? "No convocadas" : "Ausencias",
      };
    }
    return { label: col.label, title: col.title };
  };

  if (totalSesiones === 0) {
    return (
      <div className="stats-section" style={{ width: "100%" }}>
        <div className="stats-section-header" style={{ borderLeftColor: color }}>
          <span className="stats-section-dot" style={{ background: color }} />
          <span style={{ color: text, fontWeight: 700, fontSize: 15 }}>{titulo}</span>
          <span style={{ color: textMuted, fontSize: 13 }}>0 en el periodo</span>
        </div>
        <div className="empty-state-text" style={{ padding: "8px 4px" }}>
          No hay {nombrePlural} en el periodo seleccionado.
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
          {totalSesiones} {totalSesiones === 1 ? nombreSingular : nombrePlural} en el periodo
        </span>
      </div>
      <div className="stats-table stats-table--tipo" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="stats-table-header stats-table-header--tipo" role="row">
          {SORT_COLUMNS.map((col) => {
            const meta = columnMeta(col);
            const activo = sortKey === col.key;
            const ariaSort = !activo ? "none" : sortDir === "asc" ? "ascending" : "descending";
            return (
              <button
                key={col.key}
                type="button"
                className={`stats-table-sort${activo ? " stats-table-sort--active" : ""}${col.align === "center" ? " stats-table-sort--center" : ""}`}
                title={`${meta.title} — pulsa para ordenar`}
                aria-sort={ariaSort}
                onClick={() => toggleSort(col)}
              >
                <span className="stats-table-sort__label">{meta.label}</span>
                <span className="stats-table-sort__icon" aria-hidden="true">
                  {activo ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                </span>
              </button>
            );
          })}
        </div>
        {filas.map(({ jugadora: j, [statsKey]: stats }) => (
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
                esPartido
                  ? (stats.ausencias > 0 || (stats.lesionado || 0) > 0 || (stats.noConvocado || 0) > 0
                    ? `No convocado/a ${stats.noConvocado || 0} · Lesionado/a ${stats.lesionado || 0}`
                    : "No convocadas")
                  : (stats.ausencias > 0
                    ? `Justificada ${stats.justificada || 0} · No justificada ${stats.noJustificada || 0} · Salud ${stats.salud || 0}${(stats.doblaje || 0) > 0 ? ` · Doblaje ${stats.doblaje}` : ""}`
                    : ((stats.doblaje || 0) > 0
                      ? `Doblaje ${stats.doblaje} (no cuenta como ausencia)`
                      : "Ausencias"))
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
