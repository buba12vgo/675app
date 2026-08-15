import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  query,
  where,
  deleteDoc
} from "firebase/firestore";

const THEME = {
  bg: "#0B1120",
  bgDark: "#0B1120",
  cardBg: "#151D2E",
  cardBgElevated: "#1A2438",
  surface: "#1E293B",
  inputBg: "#1A2438",
  inputBorder: "#2D3A52",
  accent: "#3B82F6",
  accentLight: "#60A5FA",
  accentSoft: "rgba(59, 130, 246, 0.14)",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  success: "#10B981",
  error: "#F87171",
  cardShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
};

function IconHome({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19v-8.5z" />
    </svg>
  );
}

function IconCalendar({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

function IconChart({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 19V11M12 19V5M19 19v-7" />
    </svg>
  );
}

function IconUsers({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M15.5 7.5a3 3 0 1 1 0 6M14 19c.3-2.2 2-3.8 4.5-3.8 1.6 0 3 .6 3.9 1.8" />
    </svg>
  );
}

function IconChevronLeft({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function AppBrand({ accent = THEME.accent, text = THEME.text, fontSize = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, userSelect: "none" }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        background: `linear-gradient(135deg, ${accent} 0%, #2563EB 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)"
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ fontWeight: 800, fontSize, letterSpacing: "-0.04em", color: text, lineHeight: 1 }}>
        675<span style={{ color: accent }}>app</span>
      </span>
    </div>
  );
}

function BlurredBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-25%",
          backgroundImage: "url(/bg-basketball.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(56px) saturate(0.25) brightness(0.5) hue-rotate(185deg)",
          transform: "scale(1.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(11,17,32,0.94) 0%, rgba(11,17,32,0.82) 50%, rgba(37,99,235,0.14) 100%)",
        }}
      />
    </div>
  );
}

function TabNav({ tabsMenu, tab, setTab, accent, accentSoft, textMuted, inputBorder, variant = "mobile" }) {
  const isDesktop = variant === "desktop";
  const navStyle = {
    background: isDesktop ? "transparent" : "rgba(26, 36, 56, 0.85)",
    backdropFilter: isDesktop ? "none" : "blur(12px)",
    WebkitBackdropFilter: isDesktop ? "none" : "blur(12px)",
    borderTop: isDesktop ? "none" : `1px solid ${inputBorder}`,
    boxShadow: isDesktop ? "none" : "0 -4px 24px rgba(0,0,0,0.25)",
  };

  return (
    <nav
      className={isDesktop ? "app-nav-desktop" : "app-nav-mobile"}
      style={navStyle}
    >
      {tabsMenu.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`app-nav-btn ${isDesktop ? "app-nav-btn--desktop" : "app-nav-btn--mobile"}`}
            style={{
              background: active ? accentSoft : "transparent",
              color: active ? accent : textMuted,
              fontWeight: active ? 700 : 500,
            }}
            tabIndex={0}
          >
            <Icon size={isDesktop ? 20 : 21} color={active ? accent : textMuted} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const glassCardStyle = {
  background: "rgba(21, 29, 46, 0.78)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function AsistenciaValoracionPanel({
  jugadoras,
  jugadorasLoading,
  asistencias,
  valoraciones,
  setAsistencias,
  setValoraciones,
  accent,
  inputBorder,
  textMuted,
  success,
  error,
  cardBgElevated,
  titulo = "Asistencia y valoración",
  resumenPresentes,
  btnTodasPresentes = "Todas presentes",
  btnTodasAusentes = "Todas ausentes",
}) {
  const presentesCount = jugadoras.filter(j => asistencias[j.id]).length;
  const totalJugadoras = jugadoras.length;
  const verdePresente = success;
  const rojoAusente = error;
  const resumen = resumenPresentes
    ? resumenPresentes(presentesCount, totalJugadoras)
    : (totalJugadoras > 0
      ? `${presentesCount} de ${totalJugadoras} presentes · ${totalJugadoras - presentesCount} ausentes`
      : "Sin jugadoras en plantilla");

  const marcarTodasPresentes = () => {
    setAsistencias(prev => {
      const nuevo = { ...prev };
      jugadoras.forEach(j => { nuevo[j.id] = true; });
      return nuevo;
    });
    setValoraciones(prev => {
      const nuevo = { ...prev };
      jugadoras.forEach(j => {
        if (typeof nuevo[j.id] !== "number") nuevo[j.id] = 3;
      });
      return nuevo;
    });
  };

  const marcarTodasAusentes = () => {
    setAsistencias(prev => {
      const nuevo = { ...prev };
      jugadoras.forEach(j => { nuevo[j.id] = false; });
      return nuevo;
    });
    setValoraciones({});
  };

  const toggleAsistencia = (jugadoraId, presenteActual) => {
    setAsistencias(prev => ({ ...prev, [jugadoraId]: !presenteActual }));
    if (presenteActual) {
      setValoraciones(prev => {
        const nuevo = { ...prev };
        delete nuevo[jugadoraId];
        return nuevo;
      });
    } else {
      setValoraciones(prev => ({
        ...prev,
        [jugadoraId]: typeof prev[jugadoraId] === "number" ? prev[jugadoraId] : 3
      }));
    }
  };

  return (
    <div className="session-asistencia-panel" style={{
      background: cardBgElevated,
      borderRadius: 12,
      padding: "13px 12px 12px",
      boxShadow: "0 2px 7px rgba(0,0,0,0.09)",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minHeight: 0,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        paddingBottom: 4,
        borderBottom: `1px solid ${inputBorder}`,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: accent, fontWeight: 700, fontSize: 16.5, letterSpacing: "0.01em" }}>
            {titulo}
          </div>
          <div style={{ color: "#a09fa3", fontSize: 13.5, marginTop: 2 }}>
            {resumen}
          </div>
        </div>
        {totalJugadoras > 0 && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={marcarTodasPresentes}
              style={{
                background: "rgba(52,199,89,0.14)",
                color: verdePresente,
                border: `1.2px solid rgba(52,199,89,0.45)`,
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {btnTodasPresentes}
            </button>
            <button
              type="button"
              onClick={marcarTodasAusentes}
              style={{
                background: "rgba(255,69,58,0.12)",
                color: rojoAusente,
                border: `1.2px solid rgba(255,69,58,0.4)`,
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {btnTodasAusentes}
            </button>
          </div>
        )}
      </div>
      <div className="session-asistencia-list">
        {jugadorasLoading ? (
          <div style={{ color: "#bbb", fontSize: 15.2, fontStyle: "italic" }}>Cargando jugadoras...</div>
        ) : jugadoras.length === 0 ? (
          <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15 }}>No hay jugadoras.</div>
        ) : (
          jugadoras.map(j => {
            const estaPresente = !!asistencias[j.id];
            const valoracionActual = valoraciones[j.id];
            return (
              <div key={j.id} style={{
                background: estaPresente ? "rgba(52,199,89,0.08)" : "rgba(255,69,58,0.06)",
                borderRadius: 10,
                boxShadow: "0 2px 7px rgba(0,0,0,0.08)",
                borderLeft: `4px solid ${estaPresente ? verdePresente : rojoAusente}`,
                padding: "9px 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <span style={{
                    color: accent,
                    fontWeight: 700,
                    fontSize: 18,
                    width: 32,
                    textAlign: "center",
                    flexShrink: 0
                  }}>{j.dorsal}</span>
                  <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
                    <span style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 16.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block"
                    }}>{j.nombre}</span>
                    {(j.apodo && j.apodo.trim() !== "") && (
                      <span style={{
                        color: "#BFD6FF",
                        fontSize: 13,
                        fontWeight: 500,
                        opacity: .75,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block"
                      }}>"{j.apodo}"</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {estaPresente && (
                    <div style={{ display: "flex", gap: 2 }} aria-label="Valoración del 1 al 5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          aria-label={`Valoración ${n}`}
                          aria-pressed={valoracionActual === n}
                          onClick={() => setValoraciones(prev => ({ ...prev, [j.id]: n }))}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: valoracionActual === n
                              ? `1.5px solid ${accent}`
                              : `1px solid ${inputBorder}`,
                            background: valoracionActual === n ? accent : "#1E1F25",
                            color: valoracionActual === n ? "#fff" : textMuted,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 1
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={estaPresente ? "Marcar ausente" : "Marcar presente"}
                    title={estaPresente ? "Presente — pulsa para marcar ausente" : "Ausente — pulsa para marcar presente"}
                    onClick={() => toggleAsistencia(j.id, estaPresente)}
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: 9,
                      border: "none",
                      background: estaPresente ? verdePresente : rojoAusente,
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: estaPresente
                        ? "0 2px 8px rgba(52,199,89,0.35)"
                        : "0 2px 8px rgba(255,69,58,0.3)",
                    }}
                  >
                    {estaPresente ? "✓" : "✗"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ----------- PlantillaForm extraído a componente estable --------------
function PlantillaForm({
  handleAddJugadora,
  jugadoraNombre,
  setJugadoraNombre,
  jugadoraDorsal,
  setJugadoraDorsal,
  jugadoraApodo,
  setJugadoraApodo,
  addJugadoraLoading,
  accent,
  inputBorder,
  inputBg,
  surface,
  text
}) {
  return (
    <form
      onSubmit={handleAddJugadora}
      style={{
        background: surface,
        padding: "18px 24px",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        border: `1px solid ${inputBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        maxWidth: 560
      }}
      autoComplete="off"
    >
      <div className="plantilla-form-row plantilla-form-row--inputs">
        <input
          type="text"
          placeholder="Nombre"
          value={jugadoraNombre}
          onChange={e => setJugadoraNombre(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
        />
        <input
          type="number"
          placeholder="Dorsal"
          value={jugadoraDorsal}
          onChange={e => setJugadoraDorsal(e.target.value.replace(/^0+/, ""))}
          min={1}
          required
          style={{
            width: 64,
            padding: "10px 10px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500
          }}
        />
        <input
          type="text"
          placeholder="Apodo"
          value={jugadoraApodo}
          onChange={e => setJugadoraApodo(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "11px 0",
          fontWeight: 600,
          fontSize: 16,
          cursor: "pointer",
          marginTop: 5,
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.28)",
          transition: "all .16s",
          letterSpacing: "0.013em"
        }}
        disabled={addJugadoraLoading || !jugadoraNombre.trim() || !jugadoraDorsal.trim()}
        tabIndex={0}
      >
        Añadir Jugadora
      </button>
    </form>
  );
}
// ---------------------------------------------------------------------

/**
 * Utilidad para obtener un array de objetos {date, tipo, ...} para construir
 * una grilla de calendario mensual (lunes a domingo, muestra días del mes actual
 * y los necesarios de los bordes del anterior/siguiente).
 */
function getCalendarMatrix(year, month) {
  // month: 0-11
  // lunes = 1, domingo = 0 JS
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstWeekday = firstDay.getDay();
  if (firstWeekday === 0) firstWeekday = 7; // que el lunes sea 1, domingo 7 (mostrar domingo al final)

  // Backtrack days from prev month
  const daysPrev = firstWeekday - 1;
  const daysInMonth = lastDay.getDate();

  // Días del mes anterior
  let prevMonth = month - 1, prevYear = year;
  if (month === 0) { prevMonth = 11; prevYear--; }
  const prevLastDay = new Date(prevYear, prevMonth + 1, 0);
  const prevLastDate = prevLastDay.getDate();

  let matrix = [];

  for (let d = prevLastDate - daysPrev + 1; d <= prevLastDate; d++) {
    matrix.push({ date: new Date(prevYear, prevMonth, d), otherMonth: true });
  }
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    matrix.push({ date: new Date(year, month, d), otherMonth: false });
  }

  // Días faltantes del mes siguiente
  const restDays = 7 - (matrix.length % 7);
  let nextMonth = month + 1, nextYear = year;
  if (month === 11) { nextMonth = 0; nextYear++; }
  if (restDays < 7) {
    for (let d = 1; d <= restDays; d++) {
      matrix.push({ date: new Date(nextYear, nextMonth, d), otherMonth: true });
    }
  }

  // Devuelve semanas agrupadas
  let semanas = [];
  for (let i = 0; i < matrix.length; i += 7) {
    semanas.push(matrix.slice(i, i + 7));
  }
  return semanas;
}

// Nombres de días comenzando Lunes
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/**
 * Devuelve fecha YYYY-MM-DD en UTC (sin timezone issues, para comparaciones y claves).
 */
function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizarTipoSesion(sesion) {
  return sesion?.tipo === "partido" ? "partido" : "entreno";
}

function getRangoFechasEstadisticas(periodo, desde, hasta) {
  const hoy = new Date();
  if (periodo === "semanal") {
    const day = hoy.getDay();
    const diffToMon = day === 0 ? 6 : day - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diffToMon);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { inicio: formatDateYYYYMMDD(lunes), fin: formatDateYYYYMMDD(domingo) };
  }
  if (periodo === "mensual") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { inicio: formatDateYYYYMMDD(inicio), fin: formatDateYYYYMMDD(hoy) };
  }
  return { inicio: desde || "", fin: hasta || "" };
}

function filtrarSesionesPorPeriodo(sesiones, periodo, desde, hasta) {
  const { inicio, fin } = getRangoFechasEstadisticas(periodo, desde, hasta);
  if (!inicio || !fin) return sesiones;
  return sesiones.filter(s => s.fecha >= inicio && s.fecha <= fin);
}

function calcularStatsPorLista(jugadoraId, sesiones) {
  let presentes = 0;
  let ausencias = 0;
  let sumaNotas = 0;
  let countNotas = 0;
  sesiones.forEach(s => {
    const asist = s.asistencias || {};
    if (typeof asist[jugadoraId] === "undefined") return;
    if (asist[jugadoraId] === false) {
      ausencias++;
      return;
    }
    presentes++;
    const nota = (s.valoraciones || {})[jugadoraId];
    if (typeof nota === "number" && nota >= 1 && nota <= 5) {
      sumaNotas += nota;
      countNotas++;
    }
  });
  return {
    total: sesiones.length,
    presentes,
    ausencias,
    notaMedia: countNotas > 0 ? sumaNotas / countNotas : null,
  };
}

function EstadisticasTablaTipo({
  tipo,
  totalSesiones,
  estadisticas,
  theme,
}) {
  const esPartido = tipo === "partido";
  const {
    accent, accentLight, colorPartido, text, textMuted, textSecondary,
    surface, error, success, inputBorder, cardBgElevated,
  } = theme;
  const color = esPartido ? colorPartido : accent;
  const colorLight = esPartido ? "#A78BFA" : accentLight;
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
        <div style={{ color: textMuted, fontStyle: "italic", fontSize: 14, padding: "8px 4px" }}>
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
        <div className="stats-table-header stats-table-header--tipo" style={{ color: textMuted }}>
          <span>#</span>
          <span>Jugadora</span>
          <span style={{ color: colorLight }} title="Sesiones en el periodo">Ses.</span>
          <span style={{ color: colorLight }} title={esPartido ? "Convocadas" : "Asistencias"}>{labelPresentes}</span>
          <span style={{ color: colorLight }} title={esPartido ? "No convocadas" : "Ausencias"}>{labelAusencias}</span>
          <span style={{ color: colorLight }} title="Nota media">Nota</span>
        </div>
        {estadisticas.map(({ jugadora: j, [statsKey]: stats }) => (
          <div key={j.id} className="stats-table-row stats-table-row--tipo">
            <span style={{ color, fontWeight: 700, fontSize: 15, textAlign: "center" }}>{j.dorsal}</span>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ color: text, fontWeight: 600, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.nombre}</div>
            </div>
            <span style={{ textAlign: "center", color: textMuted, fontWeight: 600, fontSize: 13 }}>{stats.total}</span>
            <span style={{ textAlign: "center", color: success, fontWeight: 700, fontSize: 13 }}>{stats.presentes}</span>
            <span style={{ textAlign: "center", color: stats.ausencias > 0 ? error : textMuted, fontWeight: 700, fontSize: 13 }}>{stats.ausencias}</span>
            <span style={{ textAlign: "center", color: stats.notaMedia !== null ? colorLight : textMuted, fontWeight: 700, fontSize: 13 }}>
              {stats.notaMedia !== null ? stats.notaMedia.toFixed(1) : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calcularEstadisticasJugadoras(jugadoras, sesiones) {
  const entrenos = sesiones.filter(s => normalizarTipoSesion(s) === "entreno");
  const partidos = sesiones.filter(s => normalizarTipoSesion(s) === "partido");
  return jugadoras.map(j => ({
    jugadora: j,
    entrenos: calcularStatsPorLista(j.id, entrenos),
    partidos: calcularStatsPorLista(j.id, partidos),
  }));
}

function resetCamposSesion(setters) {
  const {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista
  } = setters;
  setTematica("");
  setEjercicios("");
  setAsistencias({});
  setValoraciones({});
  setTipoSesion("entreno");
  setRivalPartido("");
  setLocalPartido("casa");
  setSesionVista("datos");
}

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // SaaS state
  const [clubes, setClubes] = useState([]);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [superadminVista, setSuperadminVista] = useState("clubes"); // "clubes" | "equipos"
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos"); // "todos" | "propio"

  // Equipos state
  const [equipos, setEquipos] = useState([]);
  const [equiposLoading, setEquiposLoading] = useState(false);
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState("");
  const [crearEquipoLoading, setCrearEquipoLoading] = useState(false);

  // Equipo activo y tabs
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [tab, setTab] = useState("home");

  // Estado de jugadoras
  const [jugadoras, setJugadoras] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);

  // Formulario plantilla
  const [jugadoraNombre, setJugadoraNombre] = useState("");
  const [jugadoraDorsal, setJugadoraDorsal] = useState("");
  const [jugadoraApodo, setJugadoraApodo] = useState("");
  const [addJugadoraLoading, setAddJugadoraLoading] = useState(false);

  // Sesiones state
  const [fechaSesion, setFechaSesion] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [sesionCargando, setSesionCargando] = useState(false);
  const [sesionDoc, setSesionDoc] = useState(null);
  const [sesionId, setSesionId] = useState(null);
  const [tematica, setTematica] = useState("");
  const [ejercicios, setEjercicios] = useState("");
  const [asistencias, setAsistencias] = useState({});
  const [valoraciones, setValoraciones] = useState({});
  const [guardandoSesion, setGuardandoSesion] = useState(false);
  const [tipoSesion, setTipoSesion] = useState("entreno");
  const [rivalPartido, setRivalPartido] = useState("");
  const [localPartido, setLocalPartido] = useState("casa");
  const [sesionVista, setSesionVista] = useState("datos"); // "datos" | "asistencia" (móvil)

  // Estadísticas — filtros de periodo
  const [statsPeriodo, setStatsPeriodo] = useState("mensual");
  const [statsVista, setStatsVista] = useState("todo"); // "entrenos" | "partidos" | "todo"
  const [statsDesde, setStatsDesde] = useState(() => {
    const d = new Date();
    return formatDateYYYYMMDD(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [statsHasta, setStatsHasta] = useState(() => formatDateYYYYMMDD(new Date()));

  // Calendario sesiones (nuevo estados)
  const [sesionesEquipo, setSesionesEquipo] = useState([]); // [{fecha, ...}]
  const [sesionesLoading, setSesionesLoading] = useState(false);
  const [mesActual, setMesActual] = useState(() => {
    const d = new Date();
    return d.getMonth();
  });
  const [anioActual, setAnioActual] = useState(() => {
    return new Date().getFullYear();
  });
  const [fechaSesionSeleccionada, setFechaSesionSeleccionada] = useState(null); // Si está en panel de sesión, guarda la fecha string "YYYY-MM-DD"

  // Colores
  const bgDark = THEME.bg;
  const accent = THEME.accent;
  const accentSoft = THEME.accentSoft;
  const accentLight = THEME.accentLight;
  const cardBg = THEME.cardBg;
  const cardBgElevated = THEME.cardBgElevated;
  const surface = THEME.surface;
  const cardShadow = THEME.cardShadow;
  const inputBg = THEME.inputBg;
  const inputBorder = THEME.inputBorder;
  const text = THEME.text;
  const textSecondary = THEME.textSecondary;
  const textMuted = THEME.textMuted;
  const success = THEME.success;
  const error = THEME.error;

  const colorPartido = "#8B5CF6";
  const sesionSetters = { setTematica, setEjercicios, setAsistencias, setValoraciones, setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista };

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers }
  ];

  // Escucha auth y datos de usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setErrorMsg("");
      if (u) {
        try {
          const docRef = doc(db, "Usuarios", u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            const nuevoUsuario = { email: u.email, rol: "entrenador", creadoEn: new Date() };
            await setDoc(docRef, nuevoUsuario);
            setUserData(nuevoUsuario);
          }
        } catch (err) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);
  // Escucha clubes para superadmin
  useEffect(() => {
    let unsub;
    if (userData?.rol === "superadmin") {
      setGestionLoading(true);
      const colRef = collection(db, "Clubes");
      unsub = onSnapshot(
        colRef,
        (snapshot) => {
          setClubes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setGestionLoading(false);
        },
        () => setGestionLoading(false)
      );
    } else {
      setClubes([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [userData?.rol]);

  // Reseteos al cambiar de contexto
  useEffect(() => {
    setEquipoActivo(null);
    setTab("home");
  }, [userData?.clubId, userData?.rol]);

  useEffect(() => {
    setJugadoras([]);
    setJugadoraNombre("");
    setJugadoraDorsal("");
    setJugadoraApodo("");
    setAddJugadoraLoading(false);
  }, [equipoActivo]);

  // Fetch de clubes para usuarios sin club
  useEffect(() => {
    const fetchClubes = async () => {
      if (userData?.rol && userData?.rol !== "superadmin") {
        setSelectClubLoading(true);
        try {
          const clubCol = collection(db, "Clubes");
          const snap = await getDocs(clubCol);
          setClubes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          setClubes([]);
        }
        setSelectClubLoading(false);
      }
    };
    if (!userData?.clubId && userData?.rol && userData?.rol !== "superadmin") {
      fetchClubes();
    }
  }, [userData?.rol, userData?.clubId]);

  // Leer equipos según rol y contexto
  useEffect(() => {
    const esSuperadmin = userData?.rol === "superadmin";
    const tieneClub = Boolean(userData?.clubId);

    if (esSuperadmin) {
      const verListaEquipos = superadminVista === "equipos" && !equipoActivo;
      if (!verListaEquipos) {
        setEquipos([]);
        return;
      }
      setEquiposLoading(true);
      const equiposCol = collection(db, "Equipos");
      const q = equiposFiltroSuperadmin === "propio" && tieneClub
        ? query(equiposCol, where("clubId", "==", userData.clubId))
        : equiposCol;
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const lista = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
          setEquipos(lista);
          setEquiposLoading(false);
        },
        () => {
          setEquipos([]);
          setEquiposLoading(false);
        }
      );
      return () => unsub();
    }

    if (tieneClub) {
      setEquiposLoading(true);
      const equiposCol = collection(db, "Equipos");
      const q = query(equiposCol, where("clubId", "==", userData.clubId));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setEquipos(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
          setEquiposLoading(false);
        },
        () => {
          setEquipos([]);
          setEquiposLoading(false);
        }
      );
      return () => unsub();
    }

    setEquipos([]);
  }, [userData?.rol, userData?.clubId, superadminVista, equiposFiltroSuperadmin, equipoActivo]);

  // Escucha en vivo las jugadoras del equipoActivo (SIN ORDERBY PARA EVITAR ERROR DE ÍNDICES)
  useEffect(() => {
    let unsub;
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin") && (tab === "plantilla" || tab === "sesiones" || tab === "players")) {
      setJugadorasLoading(true);
      const jugadorasCol = collection(db, "Jugadoras");
      const q = query(jugadorasCol, where("equipoId", "==", equipoActivo.id));
      
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          docs.sort((a, b) => a.dorsal - b.dorsal);
          setJugadoras(docs);
          setJugadorasLoading(false);
        },
        () => {
          setJugadoras([]);
          setJugadorasLoading(false);
        }
      );
    } else {
      setJugadoras([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, tab]);

  // --- CALENDARIO SESIONES equipoActivo (en vivo) ---
  useEffect(() => {
    let unsub;
    if (equipoActivo && (tab === "sesiones" || tab === "players")) {
      setSesionesLoading(true);
      const sesionesCol = collection(db, "Sesiones");
      const q = query(sesionesCol, where("equipoId", "==", equipoActivo.id));
      unsub = onSnapshot(
        q,
        (snapshot) => {
          setSesionesEquipo(
            snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              fecha: doc.data().fecha, // string "YYYY-MM-DD"
            }))
          );
          setSesionesLoading(false);
        },
        () => {
          setSesionesEquipo([]);
          setSesionesLoading(false);
        }
      );
    } else {
      setSesionesEquipo([]);
      setSesionesLoading(false);
    }
    return () => { if (typeof unsub === "function") unsub(); };
  }, [equipoActivo, tab]);
  // END calendario snapshot

  // Estado y consulta de Sesion para la pestaña 'sesiones' (ahora sólo usada en Panel Sesión, por fecha seleccionada)
  useEffect(() => {
    if (equipoActivo && fechaSesionSeleccionada && tab === "sesiones") {
      setSesionCargando(true);
      setSesionDoc(null);
      setSesionId(null);
      setTematica("");
      setEjercicios("");
      resetCamposSesion(sesionSetters);
      // Buscar sesión por equipoId y fecha seleccionada
      const fetchSesion = async () => {
        try {
          const sesionesCol = collection(db, "Sesiones");
          const qSesion = query(
            sesionesCol,
            where("equipoId", "==", equipoActivo.id),
            where("fecha", "==", fechaSesionSeleccionada)
          );
          const snap = await getDocs(qSesion);
          if (!snap.empty) {
            const docSesion = snap.docs[0];
            setSesionDoc(docSesion.data());
            setSesionId(docSesion.id);
            setTematica(docSesion.data().tematica || "");
            setEjercicios(docSesion.data().ejercicios || "");
            setAsistencias(docSesion.data().asistencias || {});
            setValoraciones(docSesion.data().valoraciones || {});
            setTipoSesion(normalizarTipoSesion(docSesion.data()));
            setRivalPartido(docSesion.data().rival || "");
            setLocalPartido(docSesion.data().local === "fuera" ? "fuera" : "casa");
          } else {
            setSesionDoc(null);
            setSesionId(null);
            resetCamposSesion(sesionSetters);
          }
        } catch (e) {
          setSesionDoc(null);
          setSesionId(null);
          resetCamposSesion(sesionSetters);
        }
        setSesionCargando(false);
      };
      fetchSesion();
    } else {
      setSesionDoc(null);
      setSesionId(null);
      resetCamposSesion(sesionSetters);
      setSesionCargando(false);
    }
  }, [equipoActivo, fechaSesionSeleccionada, tab]);

  // Refiltra asistencias y valoraciones cuando jugadoras cambian pero ya hay sesión cargada
  useEffect(() => {
    if (jugadoras.length && sesionDoc) {
      setAsistencias(prevAsist => {
        let nuevo = {};
        jugadoras.forEach(j => {
          nuevo[j.id] = typeof prevAsist[j.id] !== "undefined" ? prevAsist[j.id] : false;
        });
        return nuevo;
      });
      setValoraciones(prevVal => {
        let nuevo = {};
        jugadoras.forEach(j => {
          const val = prevVal[j.id];
          if (typeof val === "number" && val >= 1 && val <= 5) {
            nuevo[j.id] = val;
          }
        });
        return nuevo;
      });
    }
  }, [jugadoras, sesionDoc]);

  // Actualiza asistencias cuando cambia listado jugadoras y NO hay sesión ya creada
  useEffect(() => {
    if (!sesionDoc && jugadoras.length && fechaSesionSeleccionada && tab === "sesiones") {
      setAsistencias(() => {
        let nuevo = {};
        jugadoras.forEach(j => {
          nuevo[j.id] = false;
        });
        return nuevo;
      });
      setValoraciones({});
    }
  }, [jugadoras, sesionDoc, tab, fechaSesionSeleccionada]);

  useEffect(() => {
    setSesionVista("datos");
  }, [fechaSesionSeleccionada]);

  // Funciones de acción
  const handleSelectClub = async (club) => {
    if (!user) return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, {
        clubId: club.id,
        clubNombre: club.nombre,
      });
      setUserData(prev => ({ ...prev, clubId: club.id, clubNombre: club.nombre }));
    } catch (err) {
      setErrorMsg("No se pudo asignar el club.");
    }
  };

  const handleQuitarMiClub = async () => {
    if (!user || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, { clubId: null, clubNombre: null });
      setUserData(prev => ({ ...prev, clubId: null, clubNombre: null }));
      if (equiposFiltroSuperadmin === "propio") setEquiposFiltroSuperadmin("todos");
    } catch (err) {
      setErrorMsg("No se pudo quitar el club.");
    }
  };

  const getClubNombre = (clubId) => clubes.find(c => c.id === clubId)?.nombre || "Club";

  const handleCrearClub = async (e) => {
    e.preventDefault();
    if (!nuevoClubNombre.trim()) return;
    try {
      await addDoc(collection(db, "Clubes"), { nombre: nuevoClubNombre.trim(), creadoEn: new Date() });
      setNuevoClubNombre("");
    } catch (err) {
      setErrorMsg("Error creando club");
    }
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    if (!nuevoEquipoNombre.trim() || !userData?.clubId) return;
    setCrearEquipoLoading(true);
    try {
      await addDoc(collection(db, "Equipos"), { nombre: nuevoEquipoNombre.trim(), clubId: userData.clubId, creadoEn: new Date() });
      setNuevoEquipoNombre("");
    } catch (err) {
      setErrorMsg("Error creando equipo");
    }
    setCrearEquipoLoading(false);
  };

  const handleAddJugadora = async (e) => {
    e.preventDefault();
    const clubIdEquipo = equipoActivo?.clubId || userData?.clubId;
    if (!equipoActivo || !clubIdEquipo) return;
    if (!jugadoraNombre.trim() || !jugadoraDorsal.trim()) return;
    setAddJugadoraLoading(true);
    setErrorMsg("");
    try {
      await addDoc(collection(db, "Jugadoras"), {
        nombre: jugadoraNombre.trim(),
        dorsal: Number(jugadoraDorsal),
        apodo: jugadoraApodo.trim(),
        equipoId: equipoActivo.id,
        clubId: clubIdEquipo,
        creadoEn: new Date()
      });
      setJugadoraNombre("");
      setJugadoraDorsal("");
      setJugadoraApodo("");
    } catch (err) {
      setErrorMsg("Error al añadir jugadora.");
    }
    setAddJugadoraLoading(false);
  };

  const handleEliminarJugadora = async (jugadoraId) => {
    setErrorMsg("");
    try {
      await deleteDoc(doc(db, "Jugadoras", jugadoraId));
    } catch (err) {
      setErrorMsg("No se pudo eliminar la jugadora.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setEquipoActivo(null);
    setTab("home");
  };

  // Crear sesión si no existe (usada en panel sesión)
  const handleCrearSesion = async (tipo = "entreno") => {
    if (!equipoActivo || !fechaSesionSeleccionada) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      let asist = {};
      jugadoras.forEach(j => {
        asist[j.id] = false;
      });
      const sesionDocRef = doc(db, "Sesiones", `${equipoActivo.id}_${fechaSesionSeleccionada}`);
      await setDoc(sesionDocRef, {
        equipoId: equipoActivo.id,
        fecha: fechaSesionSeleccionada,
        tipo,
        tematica: "",
        ejercicios: "",
        rival: "",
        local: "casa",
        asistencias: asist,
        valoraciones: {},
        creadoEn: new Date(),
      });
      const snap = await getDoc(sesionDocRef);
      if (snap.exists()) {
        setSesionDoc(snap.data());
        setSesionId(snap.id);
        setAsistencias(asist);
        setValoraciones({});
        setTipoSesion(tipo);
        setRivalPartido("");
        setLocalPartido("casa");
        setTematica("");
        setEjercicios("");
      }
    } catch (err) {
      setErrorMsg("Error creando la sesión.");
    }
    setGuardandoSesion(false);
  };

  // Guardar sesión actual
  const handleGuardarSesion = async () => {
    if (!equipoActivo || !fechaSesionSeleccionada) return;
    setGuardandoSesion(true);
    setErrorMsg("");
    try {
      const valoracionesFiltradas = {};
      jugadoras.forEach(j => {
        if (asistencias[j.id] && typeof valoraciones[j.id] === "number") {
          valoracionesFiltradas[j.id] = valoraciones[j.id];
        }
      });
      const sesionDocRef = doc(db, "Sesiones", `${equipoActivo.id}_${fechaSesionSeleccionada}`);
      const payload = {
        equipoId: equipoActivo.id,
        fecha: fechaSesionSeleccionada,
        tipo: tipoSesion,
        asistencias,
        valoraciones: valoracionesFiltradas,
        actualizadoEn: new Date(),
      };
      if (tipoSesion === "partido") {
        payload.rival = rivalPartido.trim();
        payload.local = localPartido;
        payload.tematica = "";
        payload.ejercicios = "";
      } else {
        payload.tematica = tematica;
        payload.ejercicios = ejercicios;
        payload.rival = "";
        payload.local = "casa";
      }
      await setDoc(sesionDocRef, payload, { merge: true });
    } catch (err) {
      setErrorMsg("Error guardando la sesión.");
    }
    setGuardandoSesion(false);
  };

  // --- UI login ---
  if (!user) {
    return (
      <div className="login-page" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
        <BlurredBackground />
        <div className="login-card" style={{ ...glassCardStyle, display: "flex", flexDirection: "column", gap: 18, border: `1px solid ${inputBorder}`, boxShadow: cardShadow }}>
          <AppBrand accent={accent} text={text} fontSize={26} />
          <div style={{ color: textSecondary, fontSize: 16, marginTop: 4, fontWeight: 500 }}>Inicia sesión para continuar</div>
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }} autoComplete="off">
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <button type="submit" style={{ marginTop: 4, padding: "13px 0", background: accent, color: "#fff", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", transition: "all .12s", boxShadow: "0 4px 16px rgba(59,130,246,0.35)", letterSpacing: ".2px" }}>Ingresar</button>
          </form>
          <div style={{ textAlign: "center", color: textMuted, margin: "4px 0", fontSize: 12, fontWeight: 500 }}>— o continúa con —</div>
          <button onClick={handleGoogleLogin} style={{ background: surface, color: text, border: `1px solid ${inputBorder}`, padding: "12px 0", borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <svg width="22" height="22" viewBox="0 0 48 48">
              <g>
                <path fill="#4285F4" d="M45.34 24.49c0-1.59-.14-3.16-.41-4.66H24v8.84h12.06c-.52 2.72-2.18 5.04-4.72 6.59v5.47h7.62c4.47-4.11 7.05-10.16 7.05-16.24z"/>
                <path fill="#34A853" d="M24 47c6.17 0 11.39-2.05 15.18-5.56l-7.62-5.47c-2.12 1.43-4.84 2.26-7.56 2.26-5.8 0-10.72-3.92-12.5-9.2h-7.7v5.75C7.5 42.09 15.17 47 24 47z"/>
                <path fill="#FBBC05" d="M11.5 28.03A13.63 13.63 0 0 1 10 24c0-1.39.24-2.75.5-4.03v-5.75h-7.7A23.77 23.77 0 0 0 0 24c0 3.74.9 7.29 2.5 10.3l7.7-5.75z"/>
                <path fill="#EA4335" d="M24 9.5c3.36 0 6.37 1.15 8.75 3.42l6.56-6.41C35.37 2.05 30.15 0 24 0 15.17 0 7.5 4.91 2.5 13.7l7.7 5.75c1.78-5.28 6.7-9.2 12.5-9.2z"/>
              </g>
            </svg>
            Iniciar sesión con Google
          </button>
          {errorMsg && <div style={{ color: error, marginTop: 8, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, padding: "10px 12px", borderRadius: 10, fontWeight: 500, fontSize: 14, textAlign: "center" }}>{errorMsg}</div>}
        </div>
      </div>
    );
  }

  // --- Generación de contenido para las pestañas ---
  let tabContent = null;
  if (equipoActivo) {
    if (tab === "home") {
      tabContent = (
        <div style={{ color: text, fontSize: 20, fontWeight: 600, textAlign: "center", padding: "38px 0 16px 0" }}>
          Bienvenido al equipo <span style={{ color: accentLight }}>{equipoActivo.nombre}</span>
          <div style={{ marginTop: 16, fontSize: 15, fontWeight: 500, color: textSecondary }}>Aquí iría el Dashboard principal del equipo.</div>
        </div>
      );
    } else if (tab === "sesiones") {
      // --- CALENDARIO VISUAL SESIONES ---
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      // Para lookup rápido de fechas con sesión
      const sesionesPorFecha = {};
      sesionesEquipo.forEach(s => {
        sesionesPorFecha[s.fecha] = s;
      });

      // Pasar view de mes actual y año actual
      const weeksMatrix = getCalendarMatrix(anioActual, mesActual);

      tabContent = (
        <div className="content-block" style={{ display: "flex", flexDirection: "column", gap: 27, width: "100%", alignItems: "center", padding: "13px 0 33px 0" }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 2, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <IconCalendar size={22} color={accent} />
            Gestión de Calendario
          </h2>
          {!fechaSesionSeleccionada && (
            <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: textMuted, marginBottom: -8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: accent, display: "inline-block" }} />
                Entreno
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: colorPartido, display: "inline-block" }} />
                Partido
              </span>
            </div>
          )}
          {/* Panel mensual */}
          {!fechaSesionSeleccionada && (
            <div className="content-wide" style={{
              marginBottom: 6,
              background: cardBgElevated,
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "18px 7px 20px 7px",
              border: `1.1px solid ${inputBorder}`
            }}>
              {/* Controles Mes */}
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 9,
                padding: "2px 10px 2px 10px"
              }}>
                <button
                  onClick={() => {
                    if (mesActual === 0) {
                      setMesActual(11);
                      setAnioActual(anioActual - 1);
                    } else {
                      setMesActual(mesActual - 1);
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: accent,
                    fontWeight: "bold",
                    fontSize: 25,
                    cursor: "pointer",
                    borderRadius: 7,
                    padding: "7px 10px",
                    outline: "none"
                  }}
                  tabIndex={0}
                  aria-label="Mes anterior"
                >{"‹"}</button>
                <span style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18.5,
                  letterSpacing: ".06em"
                }}>
                  {monthNames[mesActual]} {anioActual}
                </span>
                <button
                  onClick={() => {
                    if (mesActual === 11) {
                      setMesActual(0);
                      setAnioActual(anioActual + 1);
                    } else {
                      setMesActual(mesActual + 1);
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: accent,
                    fontWeight: "bold",
                    fontSize: 25,
                    cursor: "pointer",
                    borderRadius: 7,
                    padding: "7px 10px",
                    outline: "none"
                  }}
                  tabIndex={0}
                  aria-label="Mes siguiente"
                >{"›"}</button>
              </div>
              {/* Días del encabezado */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 6,
                  justifyItems: "center",
                  width: "100%",
                  marginBottom: 4
                }}
              >
                {dayNames.map(d => (
                  <div key={d} style={{
                    color: "#888",
                    fontWeight: 700,
                    fontSize: 15.5,
                    letterSpacing: ".02em"
                  }}>{d}</div>
                ))}
              </div>
              {/* Matriz semanas */}
              <div style={{
                display: "grid",
                gridTemplateRows: `repeat(${weeksMatrix.length},1fr)`,
                gridTemplateColumns: "repeat(7,1fr)",
                gap: 5,
                width: "100%",
                margin: "0 auto"
              }}>
                {weeksMatrix.map((semana, widx) =>
                  semana.map(({ date, otherMonth }, didx) => {
                    const ymd = formatDateYYYYMMDD(date);
                    const sesionDia = sesionesPorFecha[ymd];
                    const tieneSesion = !!sesionDia;
                    const esPartido = tieneSesion && normalizarTipoSesion(sesionDia) === "partido";
                    const hoy = formatDateYYYYMMDD(new Date());
                    const colorEvento = esPartido ? colorPartido : accent;
                    return (
                      <button
                        key={widx + "-" + didx}
                        disabled={otherMonth}
                        onClick={() => setFechaSesionSeleccionada(ymd)}
                        style={{
                          background: otherMonth ? "#202125" : "#292A33",
                          color: otherMonth ? "#525463" : "#FFF",
                          filter: ymd === hoy ? "brightness(1.09)" : "none",
                          fontWeight: 700,
                          fontSize: 16.2,
                          width: 44,
                          height: 44,
                          maxWidth: 44,
                          maxHeight: 44,
                          border: `1.7px solid ${tieneSesion ? colorEvento : inputBorder}`,
                          borderRadius: 12,
                          boxShadow: "0 1.3px 3px 0 rgba(59,130,246,0.10)",
                          cursor: otherMonth ? "not-allowed" : "pointer",
                          position: "relative",
                          transition: "border .14s"
                        }}
                        tabIndex={otherMonth ? -1 : 0}
                      >
                        {date.getDate()}
                        {tieneSesion && (
                          <span style={{
                            position: "absolute",
                            left: "50%",
                            bottom: 5,
                            transform: "translateX(-50%)",
                            width: 10,
                            height: 10,
                            borderRadius: 99,
                            background: colorEvento,
                            boxShadow: "0 1px 8px 0 rgba(59,130,246,0.13)",
                            display: "block",
                          }} />
                        )}
                        {ymd === hoy &&
                          <span style={{
                            position: "absolute",
                            top: 2.5, right: 2.5,
                            background: accent,
                            borderRadius: 6, width: 11, height: 5,
                            opacity: 0.88
                          }} title="Hoy" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Panel de sesión (por día) */}
          {fechaSesionSeleccionada && (
            <div className="session-day-panel" style={{
              width: "100%",
              background: surface,
              borderRadius: 16,
              boxShadow: "0 2px 15px 0 rgba(0,0,0,0.10)",
              border: `1px solid ${inputBorder}`,
              margin: "auto",
              padding: "23px 22px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 15,
              alignItems: "stretch",
              position: "relative"
            }}>
              {/* Botón volver */}
              <button
                style={{
                  background: "transparent",
                  color: accent,
                  border: `1.3px solid ${accent}`,
                  borderRadius: 10,
                  fontWeight: "bold",
                  fontSize: 15.7,
                  padding: "9px 18px",
                  marginBottom: 18,
                  width: "fit-content",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.10)",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  marginTop: -4,
                  marginLeft: -2,
                }}
                tabIndex={0}
                onClick={() => {
                  setFechaSesionSeleccionada(null);
                  setSesionDoc(null);
                  setSesionId(null);
                  resetCamposSesion(sesionSetters);
                  setSesionCargando(false);
                  setGuardandoSesion(false);
                  setErrorMsg("");
                }}
              >
                ← Volver al Calendario
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 18.8 }}>
                  {fechaSesionSeleccionada.split("-").reverse().join("/")}
                </div>
                {sesionDoc && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: tipoSesion === "partido" ? "rgba(139,92,246,0.2)" : accentSoft,
                    color: tipoSesion === "partido" ? colorPartido : accentLight,
                    border: `1px solid ${tipoSesion === "partido" ? "rgba(139,92,246,0.45)" : "rgba(59,130,246,0.35)"}`,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em"
                  }}>
                    {tipoSesion === "partido" ? "Partido" : "Entreno"}
                  </span>
                )}
              </div>

              {sesionCargando ? (
                <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>Cargando sesión...</div>
              ) : (
                <>
                  {(!sesionDoc && !guardandoSesion) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", marginTop: 17, width: "100%" }}>
                      <div style={{ color: "#9F9FA7", fontWeight: 500, fontSize: 15, textAlign: "center" }}>
                        No hay evento registrado para esta fecha.<br />Elige qué quieres crear:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
                        <button
                          type="button"
                          style={{
                            background: accent,
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            padding: "14px 20px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(59,130,246,0.28)",
                          }}
                          onClick={() => handleCrearSesion("entreno")}
                          disabled={guardandoSesion}
                        >
                          + Crear Entreno
                        </button>
                        <button
                          type="button"
                          style={{
                            background: colorPartido,
                            color: "#fff",
                            border: "none",
                            borderRadius: 14,
                            padding: "14px 20px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                          }}
                          onClick={() => handleCrearSesion("partido")}
                          disabled={guardandoSesion}
                        >
                          + Crear Partido
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      className="session-form"
                      onSubmit={e => { e.preventDefault(); handleGuardarSesion(); }}
                      autoComplete="off"
                    >
                      <div className="session-subnav">
                        <button
                          type="button"
                          className={`session-subnav-btn${sesionVista === "datos" ? " session-subnav-btn--active" : ""}`}
                          onClick={() => setSesionVista("datos")}
                        >
                          {tipoSesion === "partido" ? "Datos del partido" : "Datos de sesión"}
                        </button>
                        <button
                          type="button"
                          className={`session-subnav-btn${sesionVista === "asistencia" ? " session-subnav-btn--active" : ""}`}
                          onClick={() => setSesionVista("asistencia")}
                        >
                          {tipoSesion === "partido"
                            ? `Convocatoria (${jugadoras.filter(j => asistencias[j.id]).length}/${jugadoras.length})`
                            : `Asistencia (${jugadoras.filter(j => asistencias[j.id]).length}/${jugadoras.length})`}
                        </button>
                      </div>

                      <div className="session-panel-layout">
                        <div className={`session-panel-datos${sesionVista !== "datos" ? " session-panel-section--hidden-mobile" : ""}`}>
                          {tipoSesion === "partido" ? (
                            <div style={{
                              background: "rgba(139,92,246,0.08)",
                              border: `1px solid rgba(139,92,246,0.35)`,
                              borderRadius: 12,
                              padding: "16px 14px",
                            }}>
                              <div style={{ color: colorPartido, fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Información del partido
                              </div>
                              <label style={{ display: "block", color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Rival
                              </label>
                              <input
                                type="text"
                                placeholder="Nombre del equipo rival"
                                value={rivalPartido}
                                onChange={e => setRivalPartido(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  marginBottom: 14,
                                }}
                              />
                              <label style={{ display: "block", color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                Condición
                              </label>
                              <div style={{ display: "flex", gap: 8 }}>
                                {["casa", "fuera"].map(op => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => setLocalPartido(op)}
                                    style={{
                                      flex: 1,
                                      padding: "10px 0",
                                      borderRadius: 9,
                                      border: `1.5px solid ${localPartido === op ? colorPartido : inputBorder}`,
                                      background: localPartido === op ? "rgba(139,92,246,0.22)" : cardBgElevated,
                                      color: localPartido === op ? "#fff" : textMuted,
                                      fontWeight: 700,
                                      fontSize: 14,
                                      cursor: "pointer",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {op === "casa" ? "En casa" : "Fuera"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ color: textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Temática y ejercicios
                              </div>
                              <input
                                type="text"
                                placeholder="Temática"
                                value={tematica}
                                onChange={e => setTematica(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16.5,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  marginBottom: 12,
                                }}
                              />
                              <textarea
                                placeholder="Ejercicios de la sesión"
                                value={ejercicios}
                                onChange={e => setEjercicios(e.target.value)}
                                rows={5}
                                style={{
                                  width: "100%",
                                  padding: "11px 13px",
                                  fontSize: 16.2,
                                  border: `1px solid ${inputBorder}`,
                                  borderRadius: 9,
                                  background: cardBgElevated,
                                  color: text,
                                  outline: "none",
                                  fontWeight: 500,
                                  resize: "vertical",
                                  minHeight: 120,
                                  maxHeight: 220,
                                }}
                              />
                            </>
                          )}
                        </div>

                        <div className={`session-panel-asistencia${sesionVista !== "asistencia" ? " session-panel-section--hidden-mobile" : ""}`}>
                          <AsistenciaValoracionPanel
                            jugadoras={jugadoras}
                            jugadorasLoading={jugadorasLoading}
                            asistencias={asistencias}
                            valoraciones={valoraciones}
                            setAsistencias={setAsistencias}
                            setValoraciones={setValoraciones}
                            accent={tipoSesion === "partido" ? colorPartido : accent}
                            inputBorder={inputBorder}
                            textMuted={textMuted}
                            success={success}
                            error={error}
                            cardBgElevated={cardBgElevated}
                            titulo={tipoSesion === "partido" ? "Convocatoria" : "Asistencia y valoración"}
                            resumenPresentes={tipoSesion === "partido"
                              ? (p, t) => t > 0
                                ? `${p} convocadas · ${t - p} fuera · valoración 1-5 si está convocada`
                                : "Sin jugadoras en plantilla"
                              : undefined}
                            btnTodasPresentes={tipoSesion === "partido" ? "Todas convocadas" : "Todas presentes"}
                            btnTodasAusentes={tipoSesion === "partido" ? "Ninguna convocada" : "Todas ausentes"}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="session-save-btn"
                        disabled={guardandoSesion}
                        style={tipoSesion === "partido" ? { background: colorPartido, boxShadow: "0 4px 16px rgba(139,92,246,0.35)" } : undefined}
                      >
                        Guardar {tipoSesion === "partido" ? "Partido" : "Sesión"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    } else if (tab === "players") {
      const sesionesFiltradas = filtrarSesionesPorPeriodo(sesionesEquipo, statsPeriodo, statsDesde, statsHasta);
      const rango = getRangoFechasEstadisticas(statsPeriodo, statsDesde, statsHasta);
      const estadisticas = calcularEstadisticasJugadoras(jugadoras, sesionesFiltradas);
      const totalEntrenos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "entreno").length;
      const totalPartidos = sesionesFiltradas.filter(s => normalizarTipoSesion(s) === "partido").length;
      tabContent = (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", alignItems: "center", padding: "8px 0 20px 0" }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <IconChart size={22} color={accent} />
              Estadísticas
            </h2>
            <div style={{ color: textSecondary, fontSize: 15, fontWeight: 500 }}>
              Equipo <span style={{ color: accentLight }}>{equipoActivo.nombre}</span>
            </div>
          </div>

          <div className="stats-filters" style={{
            width: "100%",
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            <div style={{ color: textSecondary, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                  onClick={() => setStatsPeriodo(key)}
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
                <input type="date" value={statsDesde} onChange={e => setStatsDesde(e.target.value)} style={{ flex: 1, minWidth: 130, padding: "9px 10px", borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: 14 }} />
                <span style={{ color: textMuted }}>→</span>
                <input type="date" value={statsHasta} onChange={e => setStatsHasta(e.target.value)} style={{ flex: 1, minWidth: 130, padding: "9px 10px", borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: text, fontSize: 14 }} />
              </div>
            )}
            <div style={{ color: textMuted, fontSize: 13 }}>
              {rango.inicio && rango.fin
                ? `${rango.inicio.split("-").reverse().join("/")} — ${rango.fin.split("-").reverse().join("/")} · ${totalEntrenos} entreno${totalEntrenos === 1 ? "" : "s"} · ${totalPartidos} partido${totalPartidos === 1 ? "" : "s"}`
                : "Selecciona un rango de fechas válido"}
            </div>
          </div>

          {(jugadorasLoading || sesionesLoading) ? (
            <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>
              Cargando estadísticas...
            </div>
          ) : jugadoras.length === 0 ? (
            <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5 }}>
              No hay jugadoras en la plantilla.
            </div>
          ) : sesionesFiltradas.length === 0 ? (
            <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5, textAlign: "center", lineHeight: 1.5 }}>
              No hay entrenos ni partidos en el periodo seleccionado.
            </div>
          ) : (
            <>
              <div className="stats-type-nav" style={{
                width: "100%",
                display: "flex",
                gap: 6,
                padding: 4,
                background: cardBgElevated,
                borderRadius: 12,
                border: `1px solid ${inputBorder}`,
              }}>
                {[
                  { key: "entrenos", label: "Entrenos", color: accent },
                  { key: "partidos", label: "Partidos", color: colorPartido },
                  { key: "todo", label: "Todo", color: textSecondary },
                ].map(({ key, label, color: tabColor }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatsVista(key)}
                    className={`stats-type-nav-btn${statsVista === key ? " stats-type-nav-btn--active" : ""}`}
                    style={{
                      flex: 1,
                      border: statsVista === key ? `1px solid ${key === "partidos" ? "rgba(139,92,246,0.45)" : key === "entrenos" ? "rgba(59,130,246,0.35)" : inputBorder}` : "1px solid transparent",
                      background: statsVista === key
                        ? (key === "partidos" ? "rgba(139,92,246,0.18)" : key === "entrenos" ? accentSoft : "rgba(148,163,184,0.12)")
                        : "transparent",
                      color: statsVista === key ? (key === "todo" ? text : tabColor) : textMuted,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="stats-sections" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
                {(statsVista === "entrenos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="entreno"
                    totalSesiones={totalEntrenos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated }}
                  />
                )}
                {(statsVista === "partidos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="partido"
                    totalSesiones={totalPartidos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      );
    } else if (tab === "plantilla") {
      tabContent = (
        <div style={{ display: "flex", flexDirection: "column", gap: 27, width: "100%", alignItems: "center", padding: "13px 0 33px 0" }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <IconUsers size={22} color={accent} />
            Plantilla de Jugadoras
          </h2>
          <PlantillaForm
            handleAddJugadora={handleAddJugadora}
            jugadoraNombre={jugadoraNombre}
            setJugadoraNombre={setJugadoraNombre}
            jugadoraDorsal={jugadoraDorsal}
            setJugadoraDorsal={setJugadoraDorsal}
            jugadoraApodo={jugadoraApodo}
            setJugadoraApodo={setJugadoraApodo}
            addJugadoraLoading={addJugadoraLoading}
            accent={accent}
            inputBorder={inputBorder}
            inputBg={inputBg}
            surface={surface}
            text={text}
          />
          <div className="content-medium" style={{ width: "99%", margin: "0 auto", marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
            {jugadorasLoading ? (
              <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>Cargando jugadoras...</div>
            ) : jugadoras.length === 0 ? (
              <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5 }}>No hay jugadoras en la plantilla.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", marginTop: 4 }}>
                {jugadoras.map(j => (
                  <div key={j.id} style={{ background: surface, borderRadius: 10, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 11px rgba(0,0,0,0.10)", borderLeft: `4px solid ${accent}`, padding: "13px 16px", marginBottom: 1, gap: 17 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 24, width: "100%" }}>
                      <div style={{ color: accent, fontWeight: 700, fontSize: 22, width: 37, textAlign: "center" }}>{j.dorsal}</div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 0 }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: 17.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{j.nombre}</span>
                        {(j.apodo && j.apodo.trim() !== "") && (
                          <span style={{ color: "#BFD6FF", fontSize: 13.5, fontWeight: 500, opacity: .82 }}>"{j.apodo}"</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleEliminarJugadora(j.id)} style={{ background: "rgba(248,113,113,0.1)", color: error, border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 14, fontWeight: 600, padding: "7px 13px", cursor: "pointer", marginLeft: 8, transition: "filter .11s" }} tabIndex={0}>Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // --- Render Principal ---
  const showTeamNav = equipoActivo && (userData?.clubId || userData?.rol === "superadmin");
  const esSuperadmin = userData?.rol === "superadmin";

  const renderEquiposLista = ({ titulo, mostrarClub, permitirCrear }) => (
    <div style={{ color: "#fff", fontSize: 22.5, fontWeight: "bold", textAlign: "center", letterSpacing: "0.04em", textShadow: "0 2px 10px rgba(0,0,0,0.08)", padding: "18px 0 13px 0", width: "100%" }}>
      <span style={{ color: accent, fontSize: 27 }}>{titulo}</span>
      {permitirCrear && userData?.clubId && (
        <form onSubmit={handleCrearEquipo} className="content-medium" style={{ margin: "35px auto 14px auto", width: "96%", display: "flex", alignItems: "center", background: "#22232A", borderRadius: 14, boxShadow: "0 1px 10px 0 rgba(0,0,0,0.10)", border: `1.2px solid ${inputBorder}` }}>
          <input type="text" placeholder="Nuevo nombre de Equipo" value={nuevoEquipoNombre} onChange={e => setNuevoEquipoNombre(e.target.value)} required style={{ flex: 1, padding: "15px 20px", fontSize: 17.5, border: "none", borderRadius: "14px 0 0 14px", background: inputBg, color: "#fff", outline: "none", transition: "box-shadow .16s", fontWeight: 500 }} disabled={crearEquipoLoading} onFocus={e => (e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`)} onBlur={e => (e.target.parentNode.style.boxShadow = "0 1px 10px 0 rgba(0,0,0,0.10)")} />
          <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: "0 14px 14px 0", padding: "15px 22px", fontWeight: "bold", fontSize: 17, cursor: "pointer", minHeight: 53, boxShadow: "0 2px 9px 0 rgba(59,130,246,0.08), 0 1px 1px 0 rgba(0,0,0,0.13)", letterSpacing: 0.3 }} disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()} onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.13)")} onMouseOut={e => (e.currentTarget.style.filter = "none")}>Crear</button>
        </form>
      )}
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div style={{ color: "#aaa", fontSize: 17, fontStyle: "italic", padding: "12px 0", gridColumn: "1 / -1" }}>Cargando equipos...</div>
        ) : equipos.length === 0 ? (
          <div style={{ color: "#757690", fontStyle: "italic", fontSize: 16.5, gridColumn: "1 / -1" }}>
            {permitirCrear ? "No hay equipos aún. ¡Crea el primero!" : "No hay equipos registrados."}
          </div>
        ) : (
          equipos.map(equipo => (
            <div key={equipo.id} style={{ background: "#242530", borderRadius: 14, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)", padding: "16px 20px", color: "#fff", display: "flex", alignItems: "center", fontSize: 17.5, fontWeight: 600, borderLeft: `4.5px solid ${equipo.clubId === userData?.clubId ? accent : "#64748B"}`, justifyContent: "space-between", borderBottom: `1.2px solid #232230`, transition: "background .13s, border .13s" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0, width: "100%" }}>
                  <span style={{ color: accent, fontWeight: "bold", fontSize: 18, flexShrink: 0 }}>●</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{equipo.nombre}</span>
                </div>
                {mostrarClub && (
                  <span style={{ color: textMuted, fontSize: 13, fontWeight: 500, paddingLeft: 29 }}>{getClubNombre(equipo.clubId)}</span>
                )}
              </div>
              <button style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 21px", fontWeight: "bold", fontSize: 16, cursor: "pointer", marginLeft: 14, flexShrink: 0, transition: "filter .16s", boxShadow: "0 2px 8px rgba(59,130,246,0.10)", letterSpacing: "0.015em" }} onMouseOver={e => e.currentTarget.style.filter = "brightness(1.11)"} onMouseOut={e => e.currentTarget.style.filter = "none"} onClick={() => setEquipoActivo(equipo)}>Entrar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTeamLayout = () => (
    <div className="app-team-layout">
      <TabNav tabsMenu={tabsMenu} tab={tab} setTab={setTab} accent={accent} accentSoft={accentSoft} textMuted={textMuted} inputBorder={inputBorder} variant="desktop" />
      <div className="app-team-content">
        {tabContent}
        <TabNav tabsMenu={tabsMenu} tab={tab} setTab={setTab} accent={accent} accentSoft={accentSoft} textMuted={textMuted} inputBorder={inputBorder} variant="mobile" />
      </div>
    </div>
  );
  return (
    <div className="app-shell" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <BlurredBackground />
      {/* Header */}
      <header className="app-header">
        <div className="app-header-bar" style={{ ...glassCardStyle, borderRadius: 16, boxShadow: cardShadow, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", border: `1px solid ${inputBorder}` }}>
          <AppBrand accent={accent} text={text} fontSize={22} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {equipoActivo && (userData?.clubId || esSuperadmin) && (
              <button onClick={() => setEquipoActivo(null)} style={{ background: surface, color: textSecondary, border: `1px solid ${inputBorder}`, borderRadius: 10, padding: "8px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "all .16s", display: "flex", alignItems: "center", gap: 4 }} tabIndex={0}>
                <IconChevronLeft color={textSecondary} />
                Equipos
              </button>
            )}
            <button onClick={handleLogout} style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)", transition: "filter .17s", outline: 0 }} tabIndex={0}>Salir</button>
          </div>
        </div>
        <div className="app-header-meta" style={{ color: textMuted, fontWeight: 500, fontSize: 13, textAlign: "right", letterSpacing: ".02em" }}>
          Rol:&nbsp;<span style={{ color: accentLight, fontWeight: 600 }}>{userData?.rol ?? "N/A"}</span>
        </div>
      </header>
      <main className="app-main">
        <div className={`app-card${showTeamNav ? " app-card--with-nav" : ""}`} style={{ ...glassCardStyle, boxShadow: cardShadow, border: `1px solid ${inputBorder}`, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
          {esSuperadmin ? (
            equipoActivo ? (
              renderTeamLayout()
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}`, width: "100%", maxWidth: 420 }}>
                  {[
                    { key: "clubes", label: "Clubes" },
                    { key: "equipos", label: "Equipos" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSuperadminVista(key)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 9,
                        border: superadminVista === key ? `1px solid rgba(59,130,246,0.35)` : "1px solid transparent",
                        background: superadminVista === key ? accentSoft : "transparent",
                        color: superadminVista === key ? accentLight : textMuted,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {superadminVista === "clubes" ? (
                  <>
                    <h2 style={{ color: accent, fontWeight: "bold", marginBottom: 16, fontSize: 30, letterSpacing: 0.7, textAlign: "center", textShadow: "0 4px 18px rgba(59,130,246,0.13)" }}>Panel de Gestión de Clubes</h2>
                    <div style={{ width: "97%", marginBottom: 22, padding: "14px 18px", background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}` }}>
                      {userData?.clubId ? (
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ color: textSecondary, fontSize: 14 }}>
                            Mi club: <span style={{ color: accentLight, fontWeight: 700 }}>{userData.clubNombre}</span>
                          </div>
                          <button type="button" onClick={handleQuitarMiClub} style={{ background: "transparent", color: textMuted, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: textMuted, fontSize: 14, lineHeight: 1.5 }}>
                          Asigna un club como propio para crear y gestionar tus equipos.
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleCrearClub} className="content-wide" style={{ display: "flex", gap: 0, width: "96%", marginBottom: 30, alignItems: "center", background: "#22232A", borderRadius: 14, boxShadow: "0 1px 10px 0 rgba(0,0,0,0.10)", border: `1.2px solid ${inputBorder}` }}>
                      <input type="text" placeholder="Nuevo nombre de Club" value={nuevoClubNombre} onChange={e => setNuevoClubNombre(e.target.value)} required style={{ flex: 1, padding: "15px 20px", fontSize: 17.5, border: "none", borderRadius: "14px 0 0 14px", background: inputBg, color: "#fff", outline: "none", transition: "box-shadow .16s", fontWeight: 500 }} disabled={gestionLoading} onFocus={e => (e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`)} onBlur={e => (e.target.parentNode.style.boxShadow = "0 1px 10px 0 rgba(0,0,0,0.10)")} />
                      <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: "0 14px 14px 0", padding: "15px 22px", fontWeight: "bold", fontSize: 17, cursor: "pointer", minHeight: 53, boxShadow: "0 2px 9px 0 rgba(59,130,246,0.08), 0 1px 1px 0 rgba(0,0,0,0.13)", letterSpacing: 0.3 }} disabled={gestionLoading || !nuevoClubNombre.trim()} onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.13)")} onMouseOut={e => (e.currentTarget.style.filter = "none")}>Crear</button>
                    </form>
                    <div style={{ width: "97%", marginTop: 8, marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 9, letterSpacing: ".03em" }}>Clubes registrados:</div>
                      {gestionLoading ? (
                        <div style={{ color: "#aaa", padding: "18px 0 0 6px", fontSize: 17 }}>Cargando...</div>
                      ) : clubes.length === 0 ? (
                        <div style={{ color: "#757690", fontStyle: "italic", padding: "10px 0 0 5px", fontSize: 16.5 }}>No hay clubes registrados.</div>
                      ) : (
                        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 0 }} className="responsive-grid-list">
                          {clubes.map(club => (
                            <div key={club.id} style={{ width: "100%", background: "#242530", borderRadius: 14, boxShadow: "0 2px 16px 0 rgba(0,0,0,0.13)", padding: "16px 20px", color: "#fff", fontSize: 18.5, fontWeight: 600, letterSpacing: "0.03em", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderLeft: `5px solid ${userData?.clubId === club.id ? accent : "#64748B"}`, borderBottom: `1.2px solid #242530`, transition: "background .13s, border .13s" }}>
                              <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                                <span style={{ color: accent, marginRight: 15, fontWeight: "bold", fontSize: 21 }}>●</span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{club.nombre}</span>
                                {userData?.clubId === club.id && (
                                  <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: accentLight, background: accentSoft, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>MI CLUB</span>
                                )}
                              </div>
                              {userData?.clubId !== club.id && (
                                <button type="button" onClick={() => handleSelectClub(club)} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
                                  Mi club
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 8, width: "100%" }}>
                      {[
                        { key: "todos", label: "Todos los equipos" },
                        ...(userData?.clubId ? [{ key: "propio", label: `Mi club (${userData.clubNombre})` }] : []),
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEquiposFiltroSuperadmin(key)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 9,
                            border: `1px solid ${equiposFiltroSuperadmin === key ? accent : inputBorder}`,
                            background: equiposFiltroSuperadmin === key ? accentSoft : "transparent",
                            color: equiposFiltroSuperadmin === key ? accentLight : textMuted,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {!userData?.clubId && (
                      <div style={{ color: textMuted, fontSize: 14, textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>
                        Puedes entrar en cualquier equipo. Para crear los tuyos, asigna un club en la pestaña Clubes.
                      </div>
                    )}
                    {renderEquiposLista({
                      titulo: equiposFiltroSuperadmin === "propio" ? `Equipos de ${userData.clubNombre}` : "Todos los equipos",
                      mostrarClub: equiposFiltroSuperadmin === "todos",
                      permitirCrear: equiposFiltroSuperadmin === "propio",
                    })}
                  </>
                )}
              </>
            )
          ) : (
            <>
              {userData?.clubId ? (
                equipoActivo ? (
                  renderTeamLayout()
                ) : (
                  renderEquiposLista({
                    titulo: <>Equipos del Club: <span style={{ color: "#fff" }}>{userData.clubNombre}</span></>,
                    mostrarClub: false,
                    permitirCrear: true,
                  })
                )
              ) : (
                <div style={{ color: "#fff", fontSize: 23, textAlign: "center", fontWeight: "bolder", marginTop: 65, letterSpacing: "0.04em", textShadow: "0 2px 10px rgba(0,0,0,0.09)", padding: "24px 0" }}>
                  <div>Paso 1:<br /><span style={{ color: accent }}>Selecciona tu Club</span> para empezar</div>
                  <div style={{ marginTop: 35, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                    {selectClubLoading ? (
                      <div style={{ color: "#aaa", fontSize: 18, fontStyle: "italic" }}>Cargando clubes...</div>
                    ) : clubes.length === 0 ? (
                      <div style={{ color: "#757690", fontStyle: "italic", fontSize: 16.5 }}>No hay clubes disponibles.</div>
                    ) : (
                      <div className="content-medium responsive-grid-list" style={{ width: "98%" }}>
                        {clubes.map(club => (
                          <div key={club.id} style={{ background: "#242530", borderRadius: 14, boxShadow: "0 2px 11px 0 rgba(0,0,0,0.13)", padding: "17px 20px", color: "#fff", display: "flex", alignItems: "center", fontSize: 17.5, fontWeight: 600, borderLeft: `4.5px solid ${accent}`, justifyContent: "space-between", marginBottom: 4, borderBottom: `1.2px solid #232230`, transition: "background .13s, border .13s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: accent, marginRight: 12, fontWeight: "bold", fontSize: 18 }}>●</span>{club.nombre}</div>
                            <button style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 21px", fontWeight: "bold", fontSize: 16, cursor: "pointer", marginLeft: 14, transition: "filter .16s", boxShadow: "0 2px 8px rgba(59,130,246,0.10)", letterSpacing: "0.015em" }} onMouseOver={e => e.currentTarget.style.filter = "brightness(1.11)"} onMouseOut={e => e.currentTarget.style.filter = "none"} onClick={() => handleSelectClub(club)}>Seleccionar</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {errorMsg && <div style={{ color: error, background: "rgba(248,113,113,0.1)", border: `1px solid rgba(248,113,113,0.25)`, marginTop: 28, fontSize: 14, padding: "12px 16px", borderRadius: 12, width: "98%", textAlign: "center", fontWeight: 600 }}>{errorMsg}</div>}
        </div>
      </main>
    </div>
  );
}

export default App;