import React, { useState, useEffect, useMemo } from "react";
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
import {
  THEMES,
  STORAGE_THEME_KEY,
  applyThemeToDocument,
  getStoredTheme,
  persistTheme,
  getGlassCardStyle,
} from "./theme.js";

const THEME = THEMES.dark;

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

function IconDevicePhone({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

function IconDeviceTablet({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <path d="M10.5 18h3" />
    </svg>
  );
}

function IconDeviceMonitor({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

const DEVICE_PREVIEW_OPTIONS = [
  { id: "mobile", label: "Vista móvil (375px)", Icon: IconDevicePhone },
  { id: "tablet", label: "Vista tablet (768px)", Icon: IconDeviceTablet },
  { id: "desktop", label: "Vista PC (1200px)", Icon: IconDeviceMonitor },
];

function DevicePreviewControl({ mode, onChange }) {
  return (
    <div className="device-preview-control" role="group" aria-label="Previsualización de dispositivo">
      {DEVICE_PREVIEW_OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`device-preview-control__btn${mode === id ? " device-preview-control__btn--active" : ""}`}
          aria-label={label}
          aria-pressed={mode === id}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

function IconSun({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.5 12h2M17.5 12h2M6.1 6.1l1.4 1.4M16.5 16.5l1.4 1.4M6.1 17.9l1.4-1.4M16.5 7.5l1.4-1.4" />
    </svg>
  );
}

function IconMoon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />
    </svg>
  );
}

function ThemeToggleButton({ colorMode, onToggle }) {
  const isDark = colorMode === "dark";
  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  );
}

function IconSettings({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M19.4 19.4l-1.4-1.4M6 6L4.6 4.6M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
    </svg>
  );
}

function formatRolLabel(rol) {
  if (!rol) return "N/A";
  return rol.charAt(0).toUpperCase() + rol.slice(1);
}

function AppBrand({ accent = THEME.accent, text = THEME.text, fontSize = 24, onGoHome }) {
  return (
    <button
      type="button"
      className="app-brand"
      onClick={onGoHome}
      aria-label="Volver a inicio"
      title="Volver a inicio"
    >
      <div className="app-brand__mark" style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${THEME.accentDark} 100%)`,
        boxShadow: `0 4px 14px ${THEME.accentShadow}`,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 12h10M12 7v10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="app-brand__text" style={{ fontSize, color: text }}>
        675<span style={{ color: accent }}>app</span>
      </span>
    </button>
  );
}

function BlurredBackground({ isDark = true }) {
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
          filter: isDark
            ? "blur(56px) saturate(0.25) brightness(0.5) hue-rotate(185deg)"
            : "blur(56px) saturate(0.45) brightness(0.92) hue-rotate(185deg)",
          transform: "scale(1.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "linear-gradient(160deg, rgba(11,17,32,0.94) 0%, rgba(11,17,32,0.82) 50%, rgba(42,101,112,0.14) 100%)"
            : "linear-gradient(160deg, rgba(248,250,252,0.94) 0%, rgba(241,245,249,0.88) 50%, rgba(42,101,112,0.10) 100%)",
        }}
      />
    </div>
  );
}


function getClubInitials(nombre) {
  return (nombre || "C")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase();
}

function ClubInitialsMark({ clubNombre, accentLight, accentSoft, accentBorder, className = "team-context-logo" }) {
  return (
    <div
      className={className}
      aria-hidden={!clubNombre}
      style={{
        background: accentSoft,
        color: accentLight,
        border: `1px solid ${accentBorder}`,
      }}
    >
      {getClubInitials(clubNombre)}
    </div>
  );
}

function UserOptionsPanel({
  userNombre,
  onNombreChange,
  onSubmit,
  saving,
  email,
  accent,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  return (
    <div className="user-options-panel content-medium" style={{ width: "96%", margin: "0 auto", padding: "8px 0 24px" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 26, textAlign: "center", marginBottom: 8 }}>Opciones</h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 24, fontSize: 14 }}>
        Personaliza tu perfil en la app.
      </p>
      <form
        onSubmit={onSubmit}
        className="user-options-form"
        style={{
          background: cardBgElevated,
          border: `1px solid ${inputBorder}`,
          borderRadius: 16,
          padding: "20px 18px",
        }}
      >
        <label htmlFor="user-nombre" style={{ display: "block", color: text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
          Tu nombre
        </label>
        <input
          id="user-nombre"
          type="text"
          value={userNombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Ej. Buba"
          maxLength={80}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: text,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {email && (
          <div style={{ marginTop: 14, fontSize: 13, color: textMuted }}>
            Cuenta: {email}
          </div>
        )}
        <button
          type="submit"
          disabled={saving || !userNombre.trim()}
          style={{
            marginTop: 18,
            width: "100%",
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 16px",
            fontWeight: 700,
            fontSize: 15,
            cursor: saving ? "wait" : "pointer",
            opacity: saving || !userNombre.trim() ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {saving ? "Guardando…" : "Guardar nombre"}
        </button>
      </form>
    </div>
  );
}

function TeamContextHeader({
  clubNombre,
  equipoNombre,
  onCambiarEquipo,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  textSecondary,
  textMuted,
  variant = "sidebar",
}) {
  return (
    <div className={`team-context-header team-context-header--${variant}`}>
      <div className="team-context-brand">
        <ClubInitialsMark
          clubNombre={clubNombre}
          accentLight={accentLight}
          accentSoft={accentSoft}
          accentBorder={accentBorder}
        />
        <div className="team-context-text">
          <div className="team-context-club" style={{ color: textSecondary }}>{clubNombre}</div>
          <div className="team-context-team" style={{ color: text }}>{equipoNombre}</div>
        </div>
      </div>
      <button
        type="button"
        className="team-context-back"
        onClick={onCambiarEquipo}
        style={{ color: textMuted, borderColor: accentBorder }}
      >
        <IconChevronLeft size={16} color={textMuted} />
        <span>Cambiar equipo</span>
      </button>
    </div>
  );
}

function TabNav({ tabsMenu, tab, setTab, accent, accentSoft, textMuted, variant = "mobile" }) {
  const isDesktop = variant === "desktop";

  const handleTabClick = (key) => {
    setTab(key);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={isDesktop ? "app-nav-desktop" : "app-nav-mobile"}
      style={isDesktop ? { background: "transparent" } : undefined}
    >
      {tabsMenu.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTabClick(key)}
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
  textSecondary,
  success,
  error,
  cardBgElevated,
  titulo = "Asistencia y valoración",
  resumenPresentes,
  btnTodasPresentes = "Todas presentes",
  btnTodasAusentes = "Todas ausentes",
  equipoActivoId,
  jugadorasClub = [],
  jugadorasClubLoading = false,
  getNombreEquipo,
  busquedaJugadoraClub = "",
  setBusquedaJugadoraClub,
  onAgregarJugadoraExterna,
  onQuitarJugadoraExterna,
  onGoToPlantilla,
  text,
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

  const idsEnSesion = useMemo(() => new Set(jugadoras.map(j => j.id)), [jugadoras]);
  const resultadosBusqueda = useMemo(() => {
    if (!equipoActivoId || !getNombreEquipo || !busquedaJugadoraClub.trim()) return [];
    return filtrarJugadorasClubBusqueda(jugadorasClub, {
      equipoActivoId,
      idsEnSesion,
      busqueda: busquedaJugadoraClub,
      getNombreEquipo,
    });
  }, [jugadorasClub, equipoActivoId, idsEnSesion, busquedaJugadoraClub, getNombreEquipo]);

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
          <div style={{ color: textMuted, fontSize: 13.5, marginTop: 2 }}>
            {resumen}
            {totalJugadoras === 0 && onGoToPlantilla && (
              <>
                {" "}
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
              </>
            )}
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
      {equipoActivoId && setBusquedaJugadoraClub && onAgregarJugadoraExterna && (
        <div className="session-club-search" style={{ flexShrink: 0 }}>
          <input
            type="search"
            value={busquedaJugadoraClub}
            onChange={e => setBusquedaJugadoraClub(e.target.value)}
            placeholder="Buscar jugadora de otro equipo del club…"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: `1px solid ${inputBorder}`,
              borderRadius: 9,
              background: cardBgElevated,
              color: "#fff",
              outline: "none",
              fontWeight: 500,
            }}
          />
          {jugadorasClubLoading && busquedaJugadoraClub.trim() && (
            <div style={{ color: textMuted, fontSize: 13, marginTop: 8, fontStyle: "italic" }}>
              Cargando jugadoras del club…
            </div>
          )}
          {!jugadorasClubLoading && busquedaJugadoraClub.trim() && resultadosBusqueda.length === 0 && (
            <div style={{ color: textMuted, fontSize: 13, marginTop: 8, fontStyle: "italic" }}>
              No hay coincidencias en otros equipos.
            </div>
          )}
          {resultadosBusqueda.length > 0 && (
            <div className="session-club-search-results" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {resultadosBusqueda.map(j => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => onAgregarJugadoraExterna(j.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 11px",
                    borderRadius: 9,
                    border: `1px solid ${inputBorder}`,
                    background: "rgba(42, 101, 112, 0.08)",
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ color: accent, fontWeight: 700, marginRight: 8 }}>#{j.dorsal}</span>
                  <span style={{ fontWeight: 600 }}>{j.nombre}</span>
                  <span style={{ color: textMuted, fontSize: 12.5, marginLeft: 8 }}>
                    {getNombreEquipo(j.equipoId)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="session-asistencia-list">
        {jugadorasLoading ? (
          <div style={{ color: "#bbb", fontSize: 15.2, fontStyle: "italic" }}>Cargando jugadoras...</div>
        ) : jugadoras.length === 0 ? (
          <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15, textAlign: "center", lineHeight: 1.5 }}>
            No hay jugadoras en la plantilla.
            {onGoToPlantilla && (
              <>
                {" "}
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
                  Añadir en Plantilla
                </button>
              </>
            )}
          </div>
        ) : (
          jugadoras.map(j => {
            const estaPresente = !!asistencias[j.id];
            const valoracionActual = valoraciones[j.id];
            const esExterna = equipoActivoId && j.equipoId !== equipoActivoId;
            return (
              <div
                key={j.id}
                className={`asistencia-row${estaPresente ? " asistencia-row--presente" : " asistencia-row--ausente"}`}
              >
                <div className="asistencia-row__main">
                  <span className="asistencia-row__dorsal" style={{ color: accent }}>{j.dorsal}</span>
                  <div className="asistencia-row__info">
                    <span className="asistencia-row__nombre">{j.nombre}</span>
                    {(j.apodo && j.apodo.trim() !== "") && (
                      <span className="asistencia-row__apodo">"{j.apodo}"</span>
                    )}
                    {esExterna && getNombreEquipo && (
                      <span className="asistencia-row__equipo" style={{ color: textSecondary }}>
                        {getNombreEquipo(j.equipoId)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="asistencia-row__controls">
                  {estaPresente && (
                    <div className="asistencia-rating-group" aria-label="Valoración del 1 al 5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          className={`asistencia-rating-btn${valoracionActual === n ? " asistencia-rating-btn--active" : ""}`}
                          aria-label={`Valoración ${n}`}
                          aria-pressed={valoracionActual === n}
                          onClick={() => setValoraciones(prev => ({ ...prev, [j.id]: n }))}
                          style={{
                            borderColor: valoracionActual === n ? accent : inputBorder,
                            background: valoracionActual === n ? accent : "transparent",
                            color: valoracionActual === n ? "#fff" : textMuted,
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="asistencia-action-group">
                    {esExterna && onQuitarJugadoraExterna && (
                      <button
                        type="button"
                        className="asistencia-remove-btn"
                        aria-label="Quitar jugadora de la sesión"
                        title="Quitar de esta sesión"
                        onClick={() => onQuitarJugadoraExterna(j.id)}
                        style={{ borderColor: inputBorder, color: textMuted }}
                      >
                        ×
                      </button>
                    )}
                    <button
                      type="button"
                      className="asistencia-toggle-btn"
                      aria-label={estaPresente ? "Marcar ausente" : "Marcar presente"}
                      title={estaPresente ? "Presente — pulsa para marcar ausente" : "Ausente — pulsa para marcar presente"}
                      onClick={() => toggleAsistencia(j.id, estaPresente)}
                      style={{
                        background: estaPresente ? verdePresente : rojoAusente,
                        boxShadow: estaPresente
                          ? "0 2px 8px rgba(52,199,89,0.35)"
                          : "0 2px 8px rgba(255,69,58,0.3)",
                      }}
                    >
                      {estaPresente ? "✓" : "✗"}
                    </button>
                  </div>
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
  accentShadow,
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
          boxShadow: `0 4px 14px ${accentShadow}`,
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

function formatearFechaCorta(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
}

function etiquetaDiaRelativo(fechaStr, hoyStr, mananaStr) {
  if (fechaStr === hoyStr) return "Hoy";
  if (fechaStr === mananaStr) return "Mañana";
  return formatearFechaCorta(fechaStr);
}

function getProximosEventosInicio(sesiones, hoy = new Date()) {
  const hoyStr = formatDateYYYYMMDD(hoy);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const mananaStr = formatDateYYYYMMDD(manana);

  const futuras = [...sesiones]
    .filter(s => s.fecha && s.fecha >= hoyStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const proximoEntreno = futuras.find(
    s => normalizarTipoSesion(s) === "entreno" && (s.fecha === hoyStr || s.fecha === mananaStr)
  ) || null;

  const proximoPartido = futuras.find(s => normalizarTipoSesion(s) === "partido") || null;

  return { proximoEntreno, proximoPartido, hoyStr, mananaStr };
}

function getIconoClimaDecorativo(fechaStr) {
  const iconos = ["☀️", "⛅", "🌤️", "🌥️", "💨"];
  const hash = (fechaStr || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return iconos[hash % iconos.length];
}

function getMetricasEvento(sesion) {
  const asist = sesion?.asistencias || {};
  const entries = Object.entries(asist);
  const total = entries.length;
  const confirmadas = entries.filter(([, presente]) => presente === true).length;
  return { confirmadas, total };
}

function HomeEventCard({
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
        <p className="home-event-card__empty" style={{ color: textMuted }}>
          {esPartido ? "No hay partidos programados." : "No hay entreno programado para hoy ni para mañana."}
        </p>
      )}
    </article>
  );
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
    accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary,
    surface, error, success, inputBorder, cardBgElevated,
  } = theme;
  const color = esPartido ? colorPartido : accent;
  const colorLight = esPartido ? colorPartidoLight : accentLight;
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
        <div className="stats-table-header stats-table-header--tipo">
          <span>#</span>
          <span>Jugadora</span>
          <span title="Sesiones en el periodo">Ses.</span>
          <span title={esPartido ? "Convocadas" : "Asistencias"}>{labelPresentes}</span>
          <span title={esPartido ? "No convocadas" : "Ausencias"}>{labelAusencias}</span>
          <span title="Nota media">Nota</span>
        </div>
        {estadisticas.map(({ jugadora: j, [statsKey]: stats }) => (
          <div
            key={j.id}
            className="stats-table-row stats-table-row--tipo"
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

function normalizarTextoBusqueda(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function combinarJugadorasSesion(jugadoras, jugadorasClub, jugadorasExternasIds) {
  const map = new Map(jugadoras.map(j => [j.id, j]));
  jugadorasExternasIds.forEach(id => {
    const j = jugadorasClub.find(x => x.id === id);
    if (j && !map.has(j.id)) map.set(j.id, j);
  });
  return Array.from(map.values()).sort((a, b) => a.dorsal - b.dorsal);
}

function filtrarJugadorasClubBusqueda(jugadorasClub, { equipoActivoId, idsEnSesion, busqueda, getNombreEquipo }) {
  const q = normalizarTextoBusqueda(busqueda.trim());
  if (!q) return [];
  return jugadorasClub
    .filter(j => j.equipoId !== equipoActivoId)
    .filter(j => !idsEnSesion.has(j.id))
    .filter(j => {
      const nombreEquipo = getNombreEquipo(j.equipoId);
      const haystack = `${j.nombre} ${j.apodo || ""} ${j.dorsal} ${nombreEquipo}`;
      return normalizarTextoBusqueda(haystack).includes(q);
    })
    .slice(0, 8);
}

function resetCamposSesion(setters) {
  const {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
    setJugadorasExternasIds, setBusquedaJugadoraClub,
  } = setters;
  setTematica("");
  setEjercicios("");
  setAsistencias({});
  setValoraciones({});
  setTipoSesion("entreno");
  setRivalPartido("");
  setLocalPartido("casa");
  setSesionVista("datos");
  if (setJugadorasExternasIds) setJugadorasExternasIds([]);
  if (setBusquedaJugadoraClub) setBusquedaJugadoraClub("");
}

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // SaaS state
  const [clubes, setClubes] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [superadminVista, setSuperadminVista] = useState("clubes"); // "clubes" | "equipos"
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos"); // "todos" | "propio"
  const [userNombreInput, setUserNombreInput] = useState("");
  const [savingUserNombre, setSavingUserNombre] = useState(false);
  const [showOpcionesPanel, setShowOpcionesPanel] = useState(false);

  // Equipos state
  const [equipos, setEquipos] = useState([]);
  const [equiposLoading, setEquiposLoading] = useState(false);
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState("");
  const [crearEquipoLoading, setCrearEquipoLoading] = useState(false);

  // Equipo activo y tabs
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [tab, setTab] = useState("home");
  const [devicePreview, setDevicePreview] = useState("mobile");
  const [colorMode, setColorMode] = useState(() => getStoredTheme());

  useEffect(() => {
    applyThemeToDocument(colorMode);
    persistTheme(colorMode);
  }, [colorMode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      try {
        if (localStorage.getItem(STORAGE_THEME_KEY)) return;
      } catch {
        /* ignore */
      }
      setColorMode(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleColorMode = () => {
    setColorMode(prev => (prev === "dark" ? "light" : "dark"));
  };

  const theme = THEMES[colorMode];
  const glassCardStyle = getGlassCardStyle(colorMode);
  const isDarkMode = colorMode === "dark";

  // Estado de jugadoras
  const [jugadoras, setJugadoras] = useState([]);
  const [jugadorasLoading, setJugadorasLoading] = useState(false);
  const [jugadorasClub, setJugadorasClub] = useState([]);
  const [jugadorasClubLoading, setJugadorasClubLoading] = useState(false);
  const [equiposClub, setEquiposClub] = useState([]);
  const [jugadorasExternasIds, setJugadorasExternasIds] = useState([]);
  const [busquedaJugadoraClub, setBusquedaJugadoraClub] = useState("");

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
  const bgDark = theme.bg;
  const accent = theme.accent;
  const accentSoft = theme.accentSoft;
  const accentLight = theme.accentLight;
  const accentShadow = theme.accentShadow;
  const accentBorder = theme.accentBorder;
  const accentBgSubtle = theme.accentBgSubtle;
  const tableHeader = theme.tableHeader;
  const tableHeaderAccent = theme.tableHeaderAccent;
  const cardBg = theme.cardBg;
  const cardBgElevated = theme.cardBgElevated;
  const surface = theme.surface;
  const cardShadow = theme.cardShadow;
  const inputBg = theme.inputBg;
  const inputBorder = theme.inputBorder;
  const text = theme.text;
  const textSecondary = theme.textSecondary;
  const textMuted = theme.textMuted;
  const success = theme.success;
  const error = theme.error;
  const colorPartido = theme.colorPartido;
  const colorPartidoLight = theme.colorPartidoLight;
  const colorPartidoSoft = theme.colorPartidoSoft;
  const colorPartidoBorder = theme.colorPartidoBorder;
  const onAccent = theme.onAccent;
  const sesionSetters = {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
    setJugadorasExternasIds, setBusquedaJugadoraClub,
  };

  const getNombreEquipoById = (equipoId) => equiposClub.find(e => e.id === equipoId)?.nombre || "Otro equipo";

  const jugadorasSesion = useMemo(
    () => combinarJugadorasSesion(jugadoras, jugadorasClub, jugadorasExternasIds),
    [jugadoras, jugadorasClub, jugadorasExternasIds]
  );

  const handleAgregarJugadoraExterna = (jugadoraId) => {
    setJugadorasExternasIds(prev => (prev.includes(jugadoraId) ? prev : [...prev, jugadoraId]));
    setAsistencias(prev => ({ ...prev, [jugadoraId]: false }));
    setBusquedaJugadoraClub("");
  };

  const handleQuitarJugadoraExterna = (jugadoraId) => {
    setJugadorasExternasIds(prev => prev.filter(id => id !== jugadoraId));
    setAsistencias(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
    setValoraciones(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
  };

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers },
    { key: "opciones", label: "Opciones", Icon: IconSettings },
  ];

  useEffect(() => {
    setUserNombreInput(userData?.nombre || "");
  }, [userData?.nombre]);

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

  const resolvedClubId = equipoActivo?.clubId || userData?.clubId || null;

  useEffect(() => {
    if (!resolvedClubId) {
      setActiveClub(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "Clubes", resolvedClubId),
      (snap) => {
        setActiveClub(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
      () => setActiveClub(null)
    );

    return () => unsub();
  }, [resolvedClubId]);

  // Reseteos al cambiar de contexto
  useEffect(() => {
    setEquipoActivo(null);
    setTab("home");
    setShowOpcionesPanel(false);
  }, [userData?.clubId, userData?.rol]);

  useEffect(() => {
    setJugadoras([]);
    setJugadoraNombre("");
    setJugadoraDorsal("");
    setJugadoraApodo("");
    setAddJugadoraLoading(false);
    setJugadorasExternasIds([]);
    setBusquedaJugadoraClub("");
    setJugadorasClub([]);
    setEquiposClub([]);
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
  }, [equipoActivo, userData?.clubId, userData?.rol, tab]);

  // Jugadoras y equipos del club (para convocar de otros equipos en sesiones)
  useEffect(() => {
    const clubId = equipoActivo?.clubId || userData?.clubId;
    if (!equipoActivo || !clubId || tab !== "sesiones") {
      setJugadorasClub([]);
      setEquiposClub([]);
      setJugadorasClubLoading(false);
      return;
    }

    setJugadorasClubLoading(true);
    const equiposCol = collection(db, "Equipos");
    const qEquipos = query(equiposCol, where("clubId", "==", clubId));
    const unsubEquipos = onSnapshot(
      qEquipos,
      (snapshot) => {
        setEquiposClub(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      () => setEquiposClub([])
    );

    const jugadorasCol = collection(db, "Jugadoras");
    const qJugadoras = query(jugadorasCol, where("clubId", "==", clubId));
    const unsubJugadoras = onSnapshot(
      qJugadoras,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => a.dorsal - b.dorsal);
        setJugadorasClub(docs);
        setJugadorasClubLoading(false);
      },
      () => {
        setJugadorasClub([]);
        setJugadorasClubLoading(false);
      }
    );

    return () => {
      unsubEquipos();
      unsubJugadoras();
    };
  }, [equipoActivo, userData?.clubId, tab]);

  // --- CALENDARIO SESIONES equipoActivo (en vivo) ---
  useEffect(() => {
    let unsub;
    if (equipoActivo && (tab === "sesiones" || tab === "players" || tab === "home")) {
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
            setJugadorasExternasIds(docSesion.data().jugadorasExternas || []);
            setBusquedaJugadoraClub("");
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

  // Refiltra asistencias y valoraciones cuando cambia la lista de la sesión
  useEffect(() => {
    if (!sesionDoc) return;
    const lista = combinarJugadorasSesion(jugadoras, jugadorasClub, jugadorasExternasIds);
    if (!lista.length) return;

    setAsistencias(prevAsist => {
      const nuevo = {};
      lista.forEach(j => {
        nuevo[j.id] = typeof prevAsist[j.id] !== "undefined" ? prevAsist[j.id] : false;
      });
      return nuevo;
    });
    setValoraciones(prevVal => {
      const nuevo = {};
      lista.forEach(j => {
        const val = prevVal[j.id];
        if (typeof val === "number" && val >= 1 && val <= 5) {
          nuevo[j.id] = val;
        }
      });
      return nuevo;
    });
  }, [jugadoras, jugadorasClub, jugadorasExternasIds, sesionDoc]);

  // Actualiza asistencias cuando cambia listado y NO hay sesión ya creada
  useEffect(() => {
    if (!sesionDoc && jugadorasSesion.length && fechaSesionSeleccionada && tab === "sesiones") {
      setAsistencias(() => {
        const nuevo = {};
        jugadorasSesion.forEach(j => {
          nuevo[j.id] = false;
        });
        return nuevo;
      });
      setValoraciones({});
    }
  }, [jugadorasSesion, sesionDoc, tab, fechaSesionSeleccionada]);

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

  const getClubNombre = (clubId) => {
    const fromList = clubes.find(c => c.id === clubId)?.nombre;
    if (fromList) return fromList;
    if (activeClub?.id === clubId && activeClub?.nombre) return activeClub.nombre;
    return "Club";
  };

  const handleGoHome = () => {
    setShowOpcionesPanel(false);
    if (equipoActivo) {
      setTab("home");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenOpciones = () => {
    setErrorMsg("");
    if (equipoActivo) {
      setTab("opciones");
    } else {
      setShowOpcionesPanel(true);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveUserNombre = async (e) => {
    e.preventDefault();
    if (!user || !userNombreInput.trim()) return;
    setSavingUserNombre(true);
    setErrorMsg("");
    try {
      const nombre = userNombreInput.trim();
      await updateDoc(doc(db, "Usuarios", user.uid), { nombre });
      setUserData(prev => ({ ...prev, nombre }));
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para guardar tu nombre."
        : "No se pudo guardar tu nombre.");
    } finally {
      setSavingUserNombre(false);
    }
  };

  const userOptionsProps = {
    userNombre: userNombreInput,
    onNombreChange: setUserNombreInput,
    onSubmit: handleSaveUserNombre,
    saving: savingUserNombre,
    email: user?.email,
    accent,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
  };

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
      jugadorasSesion.forEach(j => {
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
        jugadorasExternas: jugadorasExternasIds,
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
      jugadorasSesion.forEach(j => {
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
        jugadorasExternas: jugadorasExternasIds,
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
        <BlurredBackground isDark={isDarkMode} />
        <div className="login-page__toolbar">
          <ThemeToggleButton colorMode={colorMode} onToggle={toggleColorMode} />
        </div>
        <div className="login-card" style={{ ...glassCardStyle, display: "flex", flexDirection: "column", gap: 18, border: `1px solid ${inputBorder}`, boxShadow: cardShadow }}>
          <AppBrand accent={accent} text={text} fontSize={26} />
          <div style={{ color: textSecondary, fontSize: 16, marginTop: 4, fontWeight: 500 }}>Inicia sesión para continuar</div>
          <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }} autoComplete="off">
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ padding: "13px 16px", fontSize: 15, background: inputBg, color: text, border: `1px solid ${inputBorder}`, borderRadius: 12, outline: "none", transition: "border .18s" }} onFocus={e => (e.target.style.border = `1.5px solid ${accent}`)} onBlur={e => (e.target.style.border = `1px solid ${inputBorder}`)} />
            <button type="submit" style={{ marginTop: 4, padding: "13px 0", background: accent, color: "#fff", fontWeight: 600, fontSize: 16, border: "none", borderRadius: 12, cursor: "pointer", transition: "all .12s", boxShadow: "0 4px 16px rgba(42, 101, 112, 0.35)", letterSpacing: ".2px" }}>Ingresar</button>
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
      const { proximoEntreno, proximoPartido, hoyStr, mananaStr } = getProximosEventosInicio(sesionesEquipo);
      const abrirEnCalendario = (fecha) => {
        if (!fecha) return;
        const [y, m] = fecha.split("-").map(Number);
        setAnioActual(y);
        setMesActual(m - 1);
        setFechaSesionSeleccionada(fecha);
        setTab("sesiones");
      };

      tabContent = (
        <div className="home-dashboard" style={{ margin: "0 auto", padding: "16px 0 8px" }}>
          <div className="home-dashboard__intro">
            <div style={{ color: text, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {equipoActivo.nombre}
            </div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: textSecondary }}>
              Resumen del equipo
            </div>
          </div>

          {sesionesLoading ? (
            <div style={{ color: textMuted, fontSize: 15, fontStyle: "italic", textAlign: "center" }}>
              Cargando calendario…
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
                onOpen={abrirEnCalendario}
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
                onOpen={abrirEnCalendario}
              />
            </div>
          )}
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
            <div className="content-wide calendar-panel">
              <div className="calendar-nav">
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => {
                    if (mesActual === 0) {
                      setMesActual(11);
                      setAnioActual(anioActual - 1);
                    } else {
                      setMesActual(mesActual - 1);
                    }
                  }}
                  tabIndex={0}
                  aria-label="Mes anterior"
                >{"‹"}</button>
                <span className="calendar-month-title">
                  {monthNames[mesActual]} {anioActual}
                </span>
                <button
                  type="button"
                  className="calendar-nav-btn"
                  onClick={() => {
                    if (mesActual === 11) {
                      setMesActual(0);
                      setAnioActual(anioActual + 1);
                    } else {
                      setMesActual(mesActual + 1);
                    }
                  }}
                  tabIndex={0}
                  aria-label="Mes siguiente"
                >{"›"}</button>
              </div>
              <div className="calendar-weekdays">
                {dayNames.map(d => (
                  <div key={d} className="calendar-weekday">{d}</div>
                ))}
              </div>
              <div
                className="calendar-grid"
                style={{ gridTemplateRows: `repeat(${weeksMatrix.length}, 1fr)` }}
              >
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
                        type="button"
                        disabled={otherMonth}
                        onClick={() => setFechaSesionSeleccionada(ymd)}
                        className={`calendar-day${otherMonth ? " calendar-day--other" : ""}${ymd === hoy ? " calendar-day--today" : ""}`}
                        style={{
                          borderColor: tieneSesion ? colorEvento : undefined,
                        }}
                        tabIndex={otherMonth ? -1 : 0}
                      >
                        {date.getDate()}
                        {tieneSesion && (
                          <span
                            className="calendar-day__dot"
                            style={{ background: colorEvento }}
                          />
                        )}
                        {ymd === hoy && (
                          <span className="calendar-day__today-mark" title="Hoy" />
                        )}
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
                  boxShadow: "0 2px 8px rgba(42, 101, 112, 0.10)",
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
                    border: `1px solid ${tipoSesion === "partido" ? "rgba(139,92,246,0.45)" : "rgba(42, 101, 112, 0.35)"}`,
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
                            boxShadow: "0 4px 14px rgba(42, 101, 112, 0.28)",
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
                            ? `Convocatoria (${jugadorasSesion.filter(j => asistencias[j.id]).length}/${jugadorasSesion.length})`
                            : `Asistencia (${jugadorasSesion.filter(j => asistencias[j.id]).length}/${jugadorasSesion.length})`}
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
                            jugadoras={jugadorasSesion}
                            jugadorasLoading={jugadorasLoading}
                            asistencias={asistencias}
                            valoraciones={valoraciones}
                            setAsistencias={setAsistencias}
                            setValoraciones={setValoraciones}
                            accent={tipoSesion === "partido" ? colorPartido : accent}
                            inputBorder={inputBorder}
                            textMuted={textMuted}
                            textSecondary={textSecondary}
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
                            equipoActivoId={equipoActivo?.id}
                            jugadorasClub={jugadorasClub}
                            jugadorasClubLoading={jugadorasClubLoading}
                            getNombreEquipo={getNombreEquipoById}
                            busquedaJugadoraClub={busquedaJugadoraClub}
                            setBusquedaJugadoraClub={setBusquedaJugadoraClub}
                            onAgregarJugadoraExterna={handleAgregarJugadoraExterna}
                            onQuitarJugadoraExterna={handleQuitarJugadoraExterna}
                            onGoToPlantilla={() => setTab("plantilla")}
                            text={text}
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
            <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15.5, textAlign: "center" }}>
              No hay jugadoras en la plantilla.{" "}
              <button
                type="button"
                onClick={() => setTab("plantilla")}
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
                      border: statsVista === key ? `1px solid ${key === "partidos" ? "rgba(139,92,246,0.45)" : key === "entrenos" ? "rgba(42, 101, 112, 0.35)" : inputBorder}` : "1px solid transparent",
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
                    theme={{ accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated, tableHeader, tableHeaderAccent }}
                  />
                )}
                {(statsVista === "partidos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="partido"
                    totalSesiones={totalPartidos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated, tableHeader, tableHeaderAccent }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      );
    } else if (tab === "plantilla") {
      tabContent = (
        <div className="plantilla-tab" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 27, width: "100%", padding: "13px 0 33px 0" }}>
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
            accentShadow={accentShadow}
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
                        <span style={{ color: text, fontWeight: 600, fontSize: 17.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{j.nombre}</span>
                        {(j.apodo && j.apodo.trim() !== "") && (
                          <span style={{ color: textSecondary, fontSize: 13.5, fontWeight: 500, opacity: .82 }}>"{j.apodo}"</span>
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
    } else if (tab === "opciones") {
      tabContent = <UserOptionsPanel {...userOptionsProps} />;
    }
  }

  // --- Render Principal ---
  const showTeamNav = equipoActivo && (userData?.clubId || userData?.rol === "superadmin");
  const esSuperadmin = userData?.rol === "superadmin";

  const renderEquiposLista = ({ titulo, mostrarClub, permitirCrear }) => (
    <div className="section-heading">
      <span className="section-heading__accent">{titulo}</span>
      {permitirCrear && userData?.clubId && (
        <form onSubmit={handleCrearEquipo} className="content-medium form-shell" style={{ margin: "35px auto 14px auto", width: "96%" }}>
          <input type="text" placeholder="Nuevo nombre de Equipo" value={nuevoEquipoNombre} onChange={e => setNuevoEquipoNombre(e.target.value)} required style={{ flex: 1, padding: "15px 20px", fontSize: 17.5, border: "none", borderRadius: "14px 0 0 14px", background: inputBg, color: text, outline: "none", transition: "box-shadow .16s", fontWeight: 500 }} disabled={crearEquipoLoading} onFocus={e => (e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`)} onBlur={e => (e.target.parentNode.style.boxShadow = "none")} />
          <button type="submit" style={{ background: accent, color: onAccent, border: "none", borderRadius: "0 14px 14px 0", padding: "15px 22px", fontWeight: "bold", fontSize: 17, cursor: "pointer", minHeight: 53, boxShadow: "0 2px 9px rgba(42, 101, 112, 0.08)", letterSpacing: 0.3 }} disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()}>Crear</button>
        </form>
      )}
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div className="empty-state-text" style={{ fontSize: 17, padding: "12px 0", gridColumn: "1 / -1" }}>Cargando equipos...</div>
        ) : equipos.length === 0 ? (
          <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
            {permitirCrear ? "No hay equipos aún. ¡Crea el primero!" : "No hay equipos registrados."}
          </div>
        ) : (
          equipos.map(equipo => (
            <div
              key={equipo.id}
              className="entity-list-card"
              style={{ borderLeftColor: equipo.clubId === userData?.clubId ? accent : textMuted }}
            >
              <div className="entity-list-card__body">
                <div className="entity-list-card__title-row">
                  <span className="entity-list-card__dot">●</span>
                  <span className="entity-list-card__title">{equipo.nombre}</span>
                </div>
                {mostrarClub && (
                  <span className="entity-list-card__meta">{getClubNombre(equipo.clubId)}</span>
                )}
              </div>
              <button type="button" className="entity-list-card__action" onClick={() => setEquipoActivo(equipo)}>Entrar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const getNombreClubActivo = () => {
    if (userData?.clubNombre && (!equipoActivo?.clubId || equipoActivo.clubId === userData.clubId)) {
      return userData.clubNombre;
    }
    if (equipoActivo?.clubId) {
      const nombre = getClubNombre(equipoActivo.clubId);
      if (nombre !== "Club") return nombre;
    }
    return userData?.clubNombre || "Club";
  };

  const renderTeamLayout = () => {
    const contextProps = {
      clubNombre: getNombreClubActivo(),
      equipoNombre: equipoActivo.nombre,
      onCambiarEquipo: () => setEquipoActivo(null),
      accentLight,
      accentSoft,
      accentBorder,
      text,
      textSecondary,
      textMuted,
    };
    const tabNavProps = { tabsMenu, tab, setTab, accent, accentSoft, textMuted, inputBorder };

    return (
      <div className="app-team-layout">
        <aside className="app-team-sidebar">
          <TeamContextHeader {...contextProps} variant="sidebar" />
          <TabNav {...tabNavProps} variant="desktop" />
        </aside>
        <div className="app-team-content">
          <TeamContextHeader {...contextProps} variant="compact" />
          <div className="app-tab-panel">
            {tabContent ?? (
              <div style={{ color: textMuted, textAlign: "center", padding: "24px 12px" }}>
                Selecciona una sección del menú.
              </div>
            )}
          </div>
          <TabNav {...tabNavProps} variant="mobile" />
        </div>
      </div>
    );
  };
  return (
    <div
      className="app-shell"
      data-device-preview={devicePreview}
      style={{ fontFamily: "'Inter',system-ui,sans-serif" }}
    >
      <BlurredBackground isDark={isDarkMode} />
      {/* Header */}
      <header className="app-header">
        <div className="app-header-bar" style={{ ...glassCardStyle, borderRadius: 16, boxShadow: cardShadow, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", border: `1px solid ${inputBorder}` }}>
          <AppBrand accent={accent} text={text} fontSize={22} onGoHome={handleGoHome} />
          <div className="app-header-actions">
            <span className="app-header-role" style={{ color: textMuted }}>
              Rol{" "}
              <span style={{ color: accentLight, fontWeight: 600 }}>
                {formatRolLabel(userData?.rol)}
              </span>
              {userData?.nombre?.trim() ? ` - ${userData.nombre.trim()}` : ""}
            </span>
            {!equipoActivo && (
              <button
                type="button"
                className="app-header-options-btn"
                onClick={handleOpenOpciones}
                style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
              >
                <IconSettings size={16} color={textMuted} />
                <span>Opciones</span>
              </button>
            )}
            <DevicePreviewControl mode={devicePreview} onChange={setDevicePreview} />
            <ThemeToggleButton colorMode={colorMode} onToggle={toggleColorMode} />
            <button onClick={handleLogout} style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", boxShadow: "0 4px 14px rgba(42, 101, 112, 0.30)", transition: "filter .17s", outline: 0 }} tabIndex={0}>Salir</button>
          </div>
        </div>
      </header>
      <div className="device-preview-viewport">
        <div className="device-preview-frame">
      <main className="app-main">
        <div className={`app-card${showTeamNav ? " app-card--with-nav" : ""}`} style={{ ...glassCardStyle, boxShadow: cardShadow, border: `1px solid ${inputBorder}`, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: showTeamNav ? "stretch" : "center", width: "100%" }}>
          {showOpcionesPanel ? (
            <>
              <button
                type="button"
                onClick={() => setShowOpcionesPanel(false)}
                className="user-options-back"
                style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
              >
                <IconChevronLeft size={16} color={textMuted} />
                <span>Volver</span>
              </button>
              <UserOptionsPanel {...userOptionsProps} />
            </>
          ) : esSuperadmin ? (
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
                        border: superadminVista === key ? `1px solid rgba(42, 101, 112, 0.35)` : "1px solid transparent",
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
                    <h2 style={{ color: accent, fontWeight: "bold", marginBottom: 16, fontSize: 30, letterSpacing: 0.7, textAlign: "center", textShadow: "0 4px 18px rgba(42, 101, 112, 0.13)" }}>Panel de Gestión de Clubes</h2>
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
                    <form onSubmit={handleCrearClub} className="content-wide form-shell" style={{ width: "96%", marginBottom: 30 }}>
                      <input type="text" placeholder="Nuevo nombre de Club" value={nuevoClubNombre} onChange={e => setNuevoClubNombre(e.target.value)} required style={{ flex: 1, padding: "15px 20px", fontSize: 17.5, border: "none", borderRadius: "14px 0 0 14px", background: inputBg, color: text, outline: "none", transition: "box-shadow .16s", fontWeight: 500 }} disabled={gestionLoading} onFocus={e => (e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`)} onBlur={e => (e.target.parentNode.style.boxShadow = "none")} />
                      <button type="submit" style={{ background: accent, color: onAccent, border: "none", borderRadius: "0 14px 14px 0", padding: "15px 22px", fontWeight: "bold", fontSize: 17, cursor: "pointer", minHeight: 53, boxShadow: "0 2px 9px rgba(42, 101, 112, 0.08)", letterSpacing: 0.3 }} disabled={gestionLoading || !nuevoClubNombre.trim()}>Crear</button>
                    </form>
                    <div style={{ width: "97%", marginTop: 8, marginBottom: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{ color: text, fontWeight: 700, fontSize: 17, marginBottom: 9, letterSpacing: ".03em" }}>Clubes registrados:</div>
                      {gestionLoading ? (
                        <div className="empty-state-text" style={{ padding: "18px 0 0 6px", fontSize: 17 }}>Cargando...</div>
                      ) : clubes.length === 0 ? (
                        <div className="empty-state-text" style={{ padding: "10px 0 0 5px", fontSize: 16.5 }}>No hay clubes registrados.</div>
                      ) : (
                        <div className="responsive-grid-list" style={{ width: "100%" }}>
                          {clubes.map(club => (
                            <div key={club.id} className="entity-list-card" style={{ borderLeftColor: userData?.clubId === club.id ? accent : textMuted }}>
                              <div className="entity-list-card__body">
                                <div className="entity-list-card__title-row">
                                  <span className="entity-list-card__dot">●</span>
                                  <span className="entity-list-card__title">{club.nombre}</span>
                                  {userData?.clubId === club.id && (
                                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: accentLight, background: accentSoft, padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>MI CLUB</span>
                                  )}
                                </div>
                              </div>
                              {userData?.clubId !== club.id && (
                                <button type="button" className="entity-list-card__action" onClick={() => handleSelectClub(club)}>Mi club</button>
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
                  <>
                    {renderEquiposLista({
                      titulo: <>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>,
                      mostrarClub: false,
                      permitirCrear: true,
                    })}
                  </>
                )
              ) : (
                <div className="section-heading" style={{ marginTop: 65, fontSize: 23, fontWeight: 800 }}>
                  <div>Paso 1:<br /><span style={{ color: accent }}>Selecciona tu Club</span> para empezar</div>
                  <div style={{ marginTop: 35, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                    {selectClubLoading ? (
                      <div className="empty-state-text" style={{ fontSize: 18 }}>Cargando clubes...</div>
                    ) : clubes.length === 0 ? (
                      <div className="empty-state-text" style={{ fontSize: 16.5 }}>No hay clubes disponibles.</div>
                    ) : (
                      <div className="content-medium responsive-grid-list" style={{ width: "98%" }}>
                        {clubes.map(club => (
                          <div key={club.id} className="entity-list-card">
                            <div className="entity-list-card__body">
                              <div className="entity-list-card__title-row">
                                <span className="entity-list-card__dot">●</span>
                                <span className="entity-list-card__title">{club.nombre}</span>
                              </div>
                            </div>
                            <button type="button" className="entity-list-card__action" onClick={() => handleSelectClub(club)}>Seleccionar</button>
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
      </div>
    </div>
  );
}

export default App;