import { useState, useEffect } from "react";
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
  writeBatch,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import { seedDemoData } from "./seedDemoData.js";
import {
  THEMES,
  STORAGE_THEME_KEY,
  applyThemeToDocument,
  getStoredTheme,
  persistTheme,
  getGlassCardStyle,
} from "./theme.js";
import {
  formatRolLabel,
  getClubInitials,
  getCalendarMatrix,
  dayNames,
  formatDateYYYYMMDD,
  normalizarTipoSesion,
  formatearFechaCorta,
  etiquetaDiaRelativo,
  getProximosEventosInicio,
  getMetricasEvento,
  getRangoFechasEstadisticas,
  filtrarSesionesPorPeriodo,
  calcularEstadisticasJugadoras,
  isCoordinador,
  isClubStaff,
  canManageEquipo,
  getEquipoLabels,
  formatTipoCanasta,
  formatGeneroEquipo,
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "./lib/appUtils.js";

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

function IconGear({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconX({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
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

function IconCoordination({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UserOptionsPanel({
  userNombre,
  onNombreChange,
  onSubmit,
  saving,
  email,
  accent,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
  clubNombre,
  clubId,
  solicitudClubNombre,
  solicitudClubId,
  clubes,
  onSolicitarClub,
  esEntrenador,
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

      {esEntrenador && (
        <div
          style={{
            marginTop: 20,
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 16,
            padding: "20px 18px",
          }}
        >
          <div style={{ color: text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Tu club</div>
          {clubNombre ? (
            <div style={{ color: accentLight, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{clubNombre}</div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14, marginBottom: 8 }}>Sin club asignado</div>
          )}
          {solicitudClubId && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: accentSoft,
                border: `1px solid ${accentBorder}`,
                color: text,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {clubNombre
                ? <>Cambio pendiente a <span style={{ color: accentLight, fontWeight: 700 }}>{solicitudClubNombre}</span>. El superadmin debe aprobarlo.</>
                : <>Solicitud pendiente para <span style={{ color: accentLight, fontWeight: 700 }}>{solicitudClubNombre}</span>.</>}
            </div>
          )}
          <div style={{ color: textSecondary, fontSize: 13, lineHeight: 1.5, marginBottom: clubes?.length ? 12 : 0 }}>
            {clubNombre
              ? "Para cambiar de club, solicítalo abajo. Solo el superadmin puede aprobar el cambio."
              : "Solicita un club desde la pantalla principal. Solo el superadmin puede aprobarlo."}
          </div>
          {clubNombre && clubes?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {clubes
                .filter((club) => club.id !== clubId)
                .map((club) => (
                  <div
                    key={club.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                    }}
                  >
                    <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>{club.nombre}</span>
                    <button
                      type="button"
                      onClick={() => onSolicitarClub?.(club)}
                      disabled={solicitudClubId === club.id}
                      style={{
                        background: solicitudClubId === club.id ? "transparent" : accent,
                        color: solicitudClubId === club.id ? textMuted : "#fff",
                        border: solicitudClubId === club.id ? `1px solid ${inputBorder}` : "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: solicitudClubId === club.id ? "default" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                      }}
                    >
                      {solicitudClubId === club.id ? "Solicitado" : "Solicitar cambio"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuperadminUsuariosPanel({
  usuarios,
  usuariosLoading,
  clubes,
  filtroClub,
  onFiltroClubChange,
  onGuardarUsuario,
  onQuitarClub,
  savingUserId,
  notice,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const editables = usuarios.filter((u) => u.rol !== "superadmin");
  const filtrados = filtroClub === "todos"
    ? editables
    : filtroClub === "sin_club"
      ? editables.filter((u) => !u.clubId)
      : editables.filter((u) => u.clubId === filtroClub);

  return (
    <div className="content-medium" style={{ width: "97%", margin: "0 auto" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 28, textAlign: "center", marginBottom: 8 }}>
        Usuarios por club
      </h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
        Asigna club y rol a cada usuario. Solo puede haber un coordinador por club.
      </p>
      {notice && (
        <div style={{ color: accentLight, background: accentSoft, border: `1px solid rgba(42, 101, 112, 0.35)`, marginBottom: 16, fontSize: 14, padding: "12px 16px", borderRadius: 12, textAlign: "center", fontWeight: 600 }}>
          {notice}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => onFiltroClubChange("todos")}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: `1px solid ${filtroClub === "todos" ? accent : inputBorder}`,
            background: filtroClub === "todos" ? accentSoft : "transparent",
            color: filtroClub === "todos" ? accentLight : textMuted,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => onFiltroClubChange("sin_club")}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: `1px solid ${filtroClub === "sin_club" ? accent : inputBorder}`,
            background: filtroClub === "sin_club" ? accentSoft : "transparent",
            color: filtroClub === "sin_club" ? accentLight : textMuted,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sin club
        </button>
        {clubes.map((club) => (
          <button
            key={club.id}
            type="button"
            onClick={() => onFiltroClubChange(club.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              border: `1px solid ${filtroClub === club.id ? accent : inputBorder}`,
              background: filtroClub === club.id ? accentSoft : "transparent",
              color: filtroClub === club.id ? accentLight : textMuted,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {club.nombre}
          </button>
        ))}
      </div>
      {usuariosLoading ? (
        <div className="empty-state-text" style={{ fontSize: 16, padding: "12px 0" }}>Cargando usuarios…</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state-text" style={{ fontSize: 16, padding: "12px 0" }}>No hay usuarios en este filtro.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtrados.map((usuario) => (
            <UsuarioClubRow
              key={usuario.id}
              usuario={usuario}
              clubes={clubes}
              onGuardar={onGuardarUsuario}
              onQuitarClub={onQuitarClub}
              saving={savingUserId === usuario.id}
              accent={accent}
              accentLight={accentLight}
              accentSoft={accentSoft}
              text={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              inputBorder={inputBorder}
              inputBg={inputBg}
              cardBgElevated={cardBgElevated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UsuarioClubRow({
  usuario,
  clubes,
  onGuardar,
  onQuitarClub,
  saving,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const clubOptions = (() => {
    const list = [...clubes];
    if (usuario.clubId && !list.some((club) => club.id === usuario.clubId)) {
      list.push({
        id: usuario.clubId,
        nombre: usuario.clubNombre || "Club asignado",
      });
    }
    return list;
  })();

  const [clubId, setClubId] = useState(usuario.clubId || "");
  const [rol, setRol] = useState(usuario.rol === "coordinador" ? "coordinador" : "entrenador");

  useEffect(() => {
    setClubId(usuario.clubId || "");
    setRol(usuario.rol === "coordinador" ? "coordinador" : "entrenador");
  }, [usuario.clubId, usuario.rol, usuario.id]);

  const effectiveClubId = clubId || usuario.clubId || "";

  const selectStyle = {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: text,
    fontFamily: "inherit",
    minWidth: 0,
  };

  return (
    <div
      style={{
        background: cardBgElevated,
        border: `1px solid ${inputBorder}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: text, fontWeight: 700, fontSize: 15 }}>
          {usuario.nombre?.trim() || usuario.email || "Usuario"}
        </div>
        <div style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>{usuario.email}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accentLight, background: accentSoft, padding: "3px 8px", borderRadius: 6 }}>
            {formatRolLabel(usuario.rol)}
          </span>
          {usuario.clubNombre && (
            <span style={{ fontSize: 12, color: textMuted }}>{usuario.clubNombre}</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <select value={clubId} onChange={(e) => setClubId(e.target.value)} style={{ ...selectStyle, flex: "1 1 140px" }}>
          <option value="">Sin club</option>
          {clubOptions.map((club) => (
            <option key={club.id} value={club.id}>{club.nombre}</option>
          ))}
        </select>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          style={{ ...selectStyle, flex: "0 0 130px" }}
          disabled={!effectiveClubId}
        >
          <option value="entrenador">Entrenador</option>
          <option value="coordinador">Coordinador</option>
        </select>
        <button
          type="button"
          onClick={() => onGuardar(usuario, clubId, rol)}
          disabled={saving || (rol === "coordinador" && !effectiveClubId)}
          style={{
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 700,
            fontSize: 13,
            cursor: saving ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {usuario.clubId && (
          <button
            type="button"
            onClick={() => onQuitarClub(usuario.id)}
            disabled={saving}
            style={{
              background: "transparent",
              color: textMuted,
              border: `1px solid ${inputBorder}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 600,
              fontSize: 13,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Quitar club
          </button>
        )}
      </div>
    </div>
  );
}

function EquipoListRow({
  equipo,
  clubNombre,
  mostrarClub,
  canEdit,
  isEditing,
  editNombre,
  setEditNombre,
  editGenero,
  setEditGenero,
  editTipoCanasta,
  setEditTipoCanasta,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onEntrar,
  accent,
  accentLight,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
  borderAccent,
}) {
  const selectStyle = {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: text,
    fontFamily: "inherit",
    width: "100%",
  };

  if (isEditing) {
    return (
      <div className="entity-list-card entity-list-card--editing" style={{ borderLeftColor: borderAccent || accent, flexDirection: "column", alignItems: "stretch", gap: 12 }}>
        <input
          type="text"
          value={editNombre}
          onChange={(e) => setEditNombre(e.target.value)}
          placeholder="Nombre del equipo"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 15,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            fontFamily: "inherit",
            fontWeight: 600,
          }}
          disabled={saving}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 5, color: textSecondary, fontSize: 12, fontWeight: 600 }}>
            Canasta
            <select value={editTipoCanasta} onChange={(e) => setEditTipoCanasta(e.target.value)} style={selectStyle} disabled={saving}>
              <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
              <option value={TIPO_CANASTA_MINI}>Minibasket</option>
            </select>
          </label>
          <label style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 5, color: textSecondary, fontSize: 12, fontWeight: 600 }}>
            Categoría
            <select value={editGenero} onChange={(e) => setEditGenero(e.target.value)} style={selectStyle} disabled={saving}>
              <option value={GENERO_FEMENINO}>Femenino</option>
              <option value={GENERO_MASCULINO}>Masculino</option>
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="entity-list-card__action"
            onClick={() => onSave(equipo.id)}
            disabled={saving || !editNombre.trim()}
            style={{ flex: "1 1 100px", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={saving}
            style={{
              flex: "1 1 100px",
              background: "transparent",
              color: textMuted,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="entity-list-card" style={{ borderLeftColor: borderAccent || accent }}>
      <div className="entity-list-card__body">
        <div className="entity-list-card__title-row">
          <span className="entity-list-card__dot">●</span>
          <span className="entity-list-card__title">{equipo.nombre}</span>
        </div>
        {mostrarClub && clubNombre && (
          <span className="entity-list-card__meta">{clubNombre}</span>
        )}
        <span className="entity-list-card__meta">
          {formatTipoCanasta(equipo.tipoCanasta)} · {formatGeneroEquipo(equipo.genero)}
        </span>
      </div>
      <div className="entity-list-card__actions">
        {canEdit && (
          <button
            type="button"
            className="entity-list-card__icon-btn"
            onClick={() => onStartEdit(equipo)}
            aria-label={`Editar ${equipo.nombre}`}
            title="Editar equipo"
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
          >
            <IconGear size={17} />
          </button>
        )}
        <button type="button" className="entity-list-card__action" onClick={() => onEntrar(equipo)}>Entrar</button>
      </div>
    </div>
  );
}

function CoordinacionPanel({
  clubNombre,
  usuarios,
  usuariosLoading,
  equipos,
  equiposLoading,
  onEntrarEquipo,
  canEditEquipos,
  equipoEditandoId,
  editEquipoNombre,
  setEditEquipoNombre,
  editEquipoGenero,
  setEditEquipoGenero,
  editEquipoTipoCanasta,
  setEditEquipoTipoCanasta,
  savingEquipoId,
  onStartEditEquipo,
  onCancelEditEquipo,
  onSaveEquipo,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const entrenadores = usuarios.filter((u) => u.rol === "entrenador");
  const coordinador = usuarios.find((u) => u.rol === "coordinador");

  return (
    <div className="content-medium" style={{ width: "97%", margin: "0 auto", padding: "8px 0 24px" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 26, textAlign: "center", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <IconCoordination size={24} color={accent} />
        Coordinación
      </h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 24, fontSize: 14 }}>
        Resumen del club <span style={{ color: accentLight, fontWeight: 700 }}>{clubNombre}</span>
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Coordinador</div>
          {coordinador ? (
            <div style={{ color: accentLight, fontWeight: 700, fontSize: 16 }}>
              {coordinador.nombre?.trim() || coordinador.email}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14 }}>Sin coordinador asignado</div>
          )}
        </div>

        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Entrenadores ({usuariosLoading ? "…" : entrenadores.length})
          </div>
          {usuariosLoading ? (
            <div style={{ color: textMuted, fontSize: 14 }}>Cargando usuarios…</div>
          ) : entrenadores.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 14 }}>No hay entrenadores asignados al club.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entrenadores.map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 10, background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>{u.nombre?.trim() || u.email}</span>
                  <span style={{ color: textMuted, fontSize: 12 }}>{u.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Equipos ({equiposLoading ? "…" : equipos.length})
          </div>
          {equiposLoading ? (
            <div style={{ color: textMuted, fontSize: 14 }}>Cargando equipos…</div>
          ) : equipos.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 14 }}>No hay equipos en el club.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {equipos.map((equipo) => (
                <EquipoListRow
                  key={equipo.id}
                  equipo={equipo}
                  mostrarClub={false}
                  canEdit={canEditEquipos}
                  isEditing={equipoEditandoId === equipo.id}
                  editNombre={editEquipoNombre}
                  setEditNombre={setEditEquipoNombre}
                  editGenero={editEquipoGenero}
                  setEditGenero={setEditEquipoGenero}
                  editTipoCanasta={editEquipoTipoCanasta}
                  setEditTipoCanasta={setEditEquipoTipoCanasta}
                  saving={savingEquipoId === equipo.id}
                  onStartEdit={onStartEditEquipo}
                  onCancelEdit={onCancelEditEquipo}
                  onSave={onSaveEquipo}
                  onEntrar={onEntrarEquipo}
                  accent={accent}
                  accentLight={accentLight}
                  text={text}
                  textSecondary={textSecondary}
                  textMuted={textMuted}
                  inputBorder={inputBorder}
                  inputBg={inputBg}
                  cardBgElevated={cardBgElevated}
                  borderAccent={accent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DemoSeedCard({
  onSeed,
  seeding,
  notice,
  accent,
  text,
  textSecondary,
  inputBorder,
  cardBgElevated,
  description = "Rellena cada club con 6 equipos, 10 jugadoras por equipo y entrenamientos aleatorios.",
}) {
  return (
    <div
      className="demo-seed-card"
      style={{
        width: "97%",
        marginBottom: 20,
        padding: "16px 18px",
        background: cardBgElevated,
        borderRadius: 12,
        border: `1px solid ${inputBorder}`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ color: text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
        Datos de prueba
      </div>
      <div style={{ color: textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
        {description}
      </div>
      <button
        type="button"
        onClick={onSeed}
        disabled={seeding}
        style={{
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 16px",
          fontWeight: 700,
          fontSize: 14,
          cursor: seeding ? "wait" : "pointer",
          opacity: seeding ? 0.75 : 1,
          fontFamily: "inherit",
        }}
      >
        {seeding ? "Generando datos…" : "Generar datos de prueba"}
      </button>
      {notice && (
        <div className="demo-seed-notice" style={{ marginTop: 12, color: accent, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
          {notice}
        </div>
      )}
    </div>
  );
}

function TeamContextHeader({
  clubNombre,
  equipoNombre,
  equipoMeta,
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
          {equipoMeta && (
            <div className="team-context-meta" style={{ color: textMuted, fontSize: 12, marginTop: 2 }}>
              {equipoMeta}
            </div>
          )}
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

const MOBILE_TAB_LABELS = {
  home: "Inicio",
  sesiones: "Calend.",
  players: "Estad.",
  plantilla: "Plant.",
};

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
        const displayLabel = isDesktop ? label : (MOBILE_TAB_LABELS[key] || label);
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
            title={label}
          >
            <Icon size={isDesktop ? 20 : 20} color={active ? accent : textMuted} />
            <span className="app-nav-btn__label">{displayLabel}</span>
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
  onGoToPlantilla,
  text,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const presentesCount = jugadoras.filter(j => asistencias[j.id]).length;
  const totalJugadoras = jugadoras.length;
  const verdePresente = success;
  const rojoAusente = error;
  const resumen = resumenPresentes
    ? resumenPresentes(presentesCount, totalJugadoras)
    : (totalJugadoras > 0
      ? `${presentesCount} de ${totalJugadoras} presentes · ${totalJugadoras - presentesCount} ausentes`
      : playerLabels.sinJugadoresPlantilla);

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
      <div className="session-asistencia-list">
        {jugadorasLoading ? (
          <div style={{ color: "#bbb", fontSize: 15.2, fontStyle: "italic" }}>{playerLabels.cargandoJugadores}</div>
        ) : jugadoras.length === 0 ? (
          <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15, textAlign: "center", lineHeight: 1.5 }}>
            {playerLabels.noHayJugadoresPlantilla}
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
  text,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
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
        {playerLabels.anadirJugador}
      </button>
    </form>
  );
}

function PlantillaJugadoraRow({
  jugadora,
  isEditing,
  editNombre,
  setEditNombre,
  editDorsal,
  setEditDorsal,
  editApodo,
  setEditApodo,
  editLoading,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  accent,
  accentShadow,
  inputBorder,
  inputBg,
  surface,
  text,
  textSecondary,
  error,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const inputStyle = {
    padding: "8px 10px",
    fontSize: 15,
    border: `1px solid ${inputBorder}`,
    borderRadius: 8,
    background: inputBg,
    color: text,
    outline: "none",
    fontWeight: 500,
    minWidth: 0,
  };

  if (isEditing) {
    return (
      <div className="plantilla-jugadora-row plantilla-jugadora-row--editing" style={{ background: surface, borderLeftColor: accent }}>
        <div className="plantilla-jugadora-row__edit-fields">
          <input
            type="text"
            placeholder="Nombre"
            value={editNombre}
            onChange={e => setEditNombre(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Dorsal"
            value={editDorsal}
            onChange={e => setEditDorsal(e.target.value.replace(/^0+/, ""))}
            min={1}
            required
            style={{ ...inputStyle, width: 64 }}
          />
          <input
            type="text"
            placeholder="Apodo"
            value={editApodo}
            onChange={e => setEditApodo(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <div className="plantilla-jugadora-row__edit-actions">
          <button
            type="button"
            className="plantilla-jugadora-row__btn plantilla-jugadora-row__btn--save"
            style={{ background: accent, boxShadow: `0 2px 10px ${accentShadow}` }}
            onClick={() => onSaveEdit(jugadora.id)}
            disabled={editLoading || !editNombre.trim() || !editDorsal.trim()}
          >
            {editLoading ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            className="plantilla-jugadora-row__btn plantilla-jugadora-row__btn--cancel"
            onClick={onCancelEdit}
            disabled={editLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plantilla-jugadora-row" style={{ background: surface, borderLeftColor: accent }}>
      <div className="plantilla-jugadora-row__info">
        <div className="plantilla-jugadora-row__dorsal" style={{ color: accent }}>{jugadora.dorsal}</div>
        <div className="plantilla-jugadora-row__name-block">
          <span className="plantilla-jugadora-row__name" style={{ color: text }}>{jugadora.nombre}</span>
          {jugadora.apodo?.trim() && (
            <span className="plantilla-jugadora-row__apodo" style={{ color: textSecondary }}>"{jugadora.apodo}"</span>
          )}
        </div>
      </div>
      <div className="plantilla-jugadora-row__actions">
        <button
          type="button"
          className="plantilla-jugadora-row__icon-btn plantilla-jugadora-row__icon-btn--edit"
          onClick={() => onStartEdit(jugadora)}
          aria-label={`Editar ${jugadora.nombre}`}
          title={playerLabels.editarJugador}
          style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
        >
          <IconGear size={18} />
        </button>
        <button
          type="button"
          className="plantilla-jugadora-row__icon-btn plantilla-jugadora-row__icon-btn--delete"
          onClick={() => onDelete(jugadora)}
          aria-label={`Eliminar ${jugadora.nombre}`}
          title={playerLabels.eliminarJugador}
          style={{ color: error }}
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------

function getIconoClimaDecorativo(fechaStr) {
  const iconos = ["☀️", "⛅", "🌤️", "🌥️", "💨"];
  const hash = (fechaStr || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return iconos[hash % iconos.length];
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

function EstadisticasTablaTipo({
  tipo,
  totalSesiones,
  estadisticas,
  theme,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
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
          <span>{playerLabels.statsColumnaJugador}</span>
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

function resetCamposSesion(setters) {
  const {
    setTematica, setEjercicios, setAsistencias, setValoraciones,
    setTipoSesion, setRivalPartido, setLocalPartido, setSesionVista,
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
  const [activeClub, setActiveClub] = useState(null);
  const [nuevoClubNombre, setNuevoClubNombre] = useState("");
  const [gestionLoading, setGestionLoading] = useState(false);
  const [selectClubLoading, setSelectClubLoading] = useState(false);
  const [superadminVista, setSuperadminVista] = useState("clubes"); // "clubes" | "equipos" | "usuarios"
  const [equiposFiltroSuperadmin, setEquiposFiltroSuperadmin] = useState("todos"); // "todos" | "propio"
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosFiltroClub, setUsuariosFiltroClub] = useState("todos");
  const [usuariosNotice, setUsuariosNotice] = useState(null);
  const [savingUsuarioId, setSavingUsuarioId] = useState(null);
  const [clubUsuarios, setClubUsuarios] = useState([]);
  const [clubUsuariosLoading, setClubUsuariosLoading] = useState(false);
  const [coordinadorVista, setCoordinadorVista] = useState("equipos"); // "equipos" | "coordinacion"
  const [userNombreInput, setUserNombreInput] = useState("");
  const [savingUserNombre, setSavingUserNombre] = useState(false);
  const [showOpcionesPanel, setShowOpcionesPanel] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);
  const [solicitudesClub, setSolicitudesClub] = useState([]);
  const [solicitudesLoading, setSolicitudesLoading] = useState(false);

  // Equipos state
  const [equipos, setEquipos] = useState([]);
  const [equiposLoading, setEquiposLoading] = useState(false);
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState("");
  const [nuevoEquipoGenero, setNuevoEquipoGenero] = useState(GENERO_FEMENINO);
  const [nuevoEquipoTipoCanasta, setNuevoEquipoTipoCanasta] = useState(TIPO_CANASTA_GRANDE);
  const [crearEquipoLoading, setCrearEquipoLoading] = useState(false);
  const [equipoEditandoId, setEquipoEditandoId] = useState(null);
  const [editEquipoNombre, setEditEquipoNombre] = useState("");
  const [editEquipoGenero, setEditEquipoGenero] = useState(GENERO_FEMENINO);
  const [editEquipoTipoCanasta, setEditEquipoTipoCanasta] = useState(TIPO_CANASTA_GRANDE);
  const [savingEquipoId, setSavingEquipoId] = useState(null);

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

  // Formulario plantilla
  const [jugadoraNombre, setJugadoraNombre] = useState("");
  const [jugadoraDorsal, setJugadoraDorsal] = useState("");
  const [jugadoraApodo, setJugadoraApodo] = useState("");
  const [addJugadoraLoading, setAddJugadoraLoading] = useState(false);
  const [jugadoraEditandoId, setJugadoraEditandoId] = useState(null);
  const [editJugadoraNombre, setEditJugadoraNombre] = useState("");
  const [editJugadoraDorsal, setEditJugadoraDorsal] = useState("");
  const [editJugadoraApodo, setEditJugadoraApodo] = useState("");
  const [editJugadoraLoading, setEditJugadoraLoading] = useState(false);

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
  };

  const jugadorasSesion = jugadoras;

  const tabsMenu = [
    { key: "home", label: "Inicio", Icon: IconHome },
    { key: "sesiones", label: "Calendario", Icon: IconCalendar },
    { key: "players", label: "Estadísticas", Icon: IconChart },
    { key: "plantilla", label: "Plantilla", Icon: IconUsers },
  ];

  useEffect(() => {
    setUserNombreInput(userData?.nombre || "");
  }, [userData?.nombre]);

  // Escucha auth y datos de usuario
  useEffect(() => {
    let unsubAuth;
    let unsubProfile;

    unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(u);
      setErrorMsg("");
      if (u) {
        try {
          const docRef = doc(db, "Usuarios", u.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            const nuevoUsuario = { email: u.email, rol: "entrenador", creadoEn: new Date() };
            await setDoc(docRef, nuevoUsuario);
          }

          unsubProfile = onSnapshot(
            docRef,
            (snap) => {
              setUserData(snap.exists() ? snap.data() : null);
            },
            () => setUserData(null)
          );
        } catch (err) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => {
      if (typeof unsubProfile === "function") unsubProfile();
      if (typeof unsubAuth === "function") unsubAuth();
    };
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
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
    setEditJugadoraLoading(false);
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

  useEffect(() => {
    const fetchClubesParaCambio = async () => {
      if (!showOpcionesPanel || userData?.rol === "superadmin" || !userData?.clubId) return;
      try {
        const clubCol = collection(db, "Clubes");
        const snap = await getDocs(clubCol);
        setClubes(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (err) {
        setClubes([]);
      }
    };
    fetchClubesParaCambio();
  }, [showOpcionesPanel, userData?.rol, userData?.clubId]);

  useEffect(() => {
    if (userData?.rol !== "superadmin") {
      setSolicitudesClub([]);
      setSolicitudesLoading(false);
      return;
    }

    setSolicitudesLoading(true);
    const unsub = onSnapshot(
      collection(db, "Usuarios"),
      (snapshot) => {
        setSolicitudesClub(
          snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((usuario) => usuario.solicitudClubId)
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setSolicitudesLoading(false);
      },
      () => {
        setSolicitudesClub([]);
        setSolicitudesLoading(false);
      }
    );

    return () => unsub();
  }, [userData?.rol]);

  useEffect(() => {
    if (userData?.rol !== "superadmin" || superadminVista !== "usuarios") {
      setUsuarios([]);
      setUsuariosLoading(false);
      return;
    }

    setUsuariosLoading(true);
    const unsub = onSnapshot(
      collection(db, "Usuarios"),
      (snapshot) => {
        setUsuarios(
          snapshot.docs
            .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setUsuariosLoading(false);
      },
      () => {
        setUsuarios([]);
        setUsuariosLoading(false);
      }
    );

    return () => unsub();
  }, [userData?.rol, superadminVista]);

  useEffect(() => {
    if (!isCoordinador(userData?.rol) || !userData?.clubId) {
      setClubUsuarios([]);
      setClubUsuariosLoading(false);
      return;
    }

    setClubUsuariosLoading(true);
    const q = query(collection(db, "Usuarios"), where("clubId", "==", userData.clubId));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setClubUsuarios(
          snapshot.docs
            .map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }))
            .sort((a, b) => (a.email || "").localeCompare(b.email || "", "es"))
        );
        setClubUsuariosLoading(false);
      },
      (err) => {
        console.error("Error cargando usuarios del club:", err);
        setClubUsuarios([]);
        setClubUsuariosLoading(false);
        setErrorMsg(err?.code === "permission-denied"
          ? "No tienes permiso para ver los entrenadores del club. Pide al administrador que publique las reglas de Firestore."
          : "No se pudieron cargar los entrenadores del club.");
      }
    );

    return () => unsub();
  }, [userData?.rol, userData?.clubId]);

  useEffect(() => {
    if (!equipoActivo || userData?.rol === "superadmin") return;
    if (userData?.clubId && equipoActivo.clubId !== userData.clubId) {
      setEquipoActivo(null);
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
    }
  }, [equipoActivo, userData?.clubId, userData?.rol]);

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
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin")) {
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
        (err) => {
          setJugadoras([]);
          setJugadorasLoading(false);
          if (err?.code === "permission-denied") {
            setErrorMsg("No tienes permiso para ver la plantilla de este equipo.");
          } else if (err?.message) {
            setErrorMsg(`Error cargando plantilla: ${err.message}`);
          }
        }
      );
    } else {
      setJugadoras([]);
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [equipoActivo, userData?.clubId, userData?.rol]);

  // --- CALENDARIO SESIONES equipoActivo (en vivo) ---
  useEffect(() => {
    let unsub;
    if (equipoActivo && (userData?.clubId || userData?.rol === "superadmin")) {
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
        (err) => {
          setSesionesEquipo([]);
          setSesionesLoading(false);
          if (err?.code === "permission-denied") {
            setErrorMsg("No tienes permiso para ver el calendario de este equipo.");
          }
        }
      );
    } else {
      setSesionesEquipo([]);
      setSesionesLoading(false);
    }
    return () => { if (typeof unsub === "function") unsub(); };
  }, [equipoActivo, userData?.clubId, userData?.rol]);
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

  // Refiltra asistencias y valoraciones cuando cambia la lista de la sesión
  useEffect(() => {
    if (!sesionDoc) return;
    const lista = jugadoras;
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
  }, [jugadoras, sesionDoc]);

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
  const handleSolicitarClub = async (club) => {
    if (!user || !club?.id || userData?.rol === "superadmin") return;
    if (userData?.clubId === club.id) {
      setErrorMsg("Ya perteneces a este club.");
      return;
    }
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, {
        solicitudClubId: club.id,
        solicitudClubNombre: club.nombre,
      });
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para solicitar este club."
        : "No se pudo enviar la solicitud de club.");
    }
  };

  const handleSelectClub = async (club) => {
    if (!user || !club?.id || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      const userRef = doc(db, "Usuarios", user.uid);
      await updateDoc(userRef, {
        clubId: club.id,
        clubNombre: club.nombre,
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
      setUserData(prev => ({
        ...prev,
        clubId: club.id,
        clubNombre: club.nombre,
        solicitudClubId: null,
        solicitudClubNombre: null,
      }));
    } catch (err) {
      setErrorMsg("No se pudo asignar el club.");
    }
  };

  const handleAprobarSolicitudClub = async (usuario) => {
    if (!usuario?.id || !usuario?.solicitudClubId || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", usuario.id), {
        clubId: usuario.solicitudClubId,
        clubNombre: usuario.solicitudClubNombre || getClubNombre(usuario.solicitudClubId),
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch (err) {
      setErrorMsg("No se pudo aprobar la solicitud de club.");
    }
  };

  const handleRechazarSolicitudClub = async (usuario) => {
    if (!usuario?.id || userData?.rol !== "superadmin") return;
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", usuario.id), {
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch (err) {
      setErrorMsg("No se pudo rechazar la solicitud de club.");
    }
  };

  const handleGuardarUsuarioClub = async (usuario, clubIdFromForm, rolSeleccionado) => {
    if (!usuario?.id) {
      setErrorMsg("Usuario no válido.");
      return;
    }
    if (userData?.rol !== "superadmin") {
      setErrorMsg("Solo el superadmin puede cambiar roles.");
      return;
    }

    const clubId = (clubIdFromForm || usuario.clubId || "").trim() || null;
    const rolFinal = clubId && rolSeleccionado === "coordinador" ? "coordinador" : "entrenador";

    if (rolSeleccionado === "coordinador" && !clubId) {
      setErrorMsg("El coordinador debe tener un club asignado. Elige un club en el desplegable.");
      return;
    }

    const clubNombre = clubId
      ? (clubes.find((c) => c.id === clubId)?.nombre || usuario.clubNombre || getClubNombre(clubId))
      : null;

    setSavingUsuarioId(usuario.id);
    setErrorMsg("");
    setUsuariosNotice(null);
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, "Usuarios", usuario.id);

      if (clubId && rolFinal === "coordinador") {
        const actual = usuarios.find(
          (u) => u.id !== usuario.id && u.clubId === clubId && u.rol === "coordinador"
        );
        if (actual) {
          batch.update(doc(db, "Usuarios", actual.id), { rol: "entrenador" });
        }
      }

      batch.update(userRef, {
        clubId,
        clubNombre,
        rol: rolFinal,
        solicitudClubId: null,
        solicitudClubNombre: null,
      });

      await batch.commit();

      setUsuarios((prev) =>
        prev.map((u) => {
          if (u.id === usuario.id) {
            return {
              ...u,
              clubId,
              clubNombre,
              rol: rolFinal,
              solicitudClubId: null,
              solicitudClubNombre: null,
            };
          }
          if (clubId && rolFinal === "coordinador" && u.clubId === clubId && u.rol === "coordinador") {
            return { ...u, rol: "entrenador" };
          }
          return u;
        })
      );
      setUsuariosNotice(
        `${usuario.nombre?.trim() || usuario.email} guardado como ${formatRolLabel(rolFinal)}${clubNombre ? ` (${clubNombre})` : ""}.`
      );
    } catch (err) {
      console.error("Error guardando usuario:", err);
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para actualizar este usuario. Comprueba que tu cuenta tenga rol superadmin en Firestore."
        : `No se pudo guardar el usuario${err?.message ? `: ${err.message}` : "."}`);
    } finally {
      setSavingUsuarioId(null);
    }
  };

  const handleQuitarClubUsuario = async (userId) => {
    if (!userId || userData?.rol !== "superadmin") return;
    setSavingUsuarioId(userId);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Usuarios", userId), {
        clubId: null,
        clubNombre: null,
        rol: "entrenador",
        solicitudClubId: null,
        solicitudClubNombre: null,
      });
    } catch (err) {
      setErrorMsg("No se pudo quitar el club del usuario.");
    } finally {
      setSavingUsuarioId(null);
    }
  };

  const handleEntrarEquipo = (equipo) => {
    if (userData?.rol !== "superadmin" && userData?.clubId && equipo.clubId !== userData.clubId) {
      setErrorMsg("No puedes acceder a equipos de otros clubes.");
      return;
    }
    setEquipoActivo(equipo);
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
    setShowOpcionesPanel(true);
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
    accentLight,
    accentSoft,
    accentBorder,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
    clubNombre: userData?.clubNombre,
    clubId: userData?.clubId,
    solicitudClubNombre: userData?.solicitudClubNombre,
    solicitudClubId: userData?.solicitudClubId,
    clubes,
    onSolicitarClub: handleSolicitarClub,
    esEntrenador: userData?.rol === "entrenador",
  };

  const superadminUsuariosProps = {
    usuarios,
    usuariosLoading,
    clubes,
    filtroClub: usuariosFiltroClub,
    onFiltroClubChange: setUsuariosFiltroClub,
    onGuardarUsuario: handleGuardarUsuarioClub,
    onQuitarClub: handleQuitarClubUsuario,
    savingUserId: savingUsuarioId,
    notice: usuariosNotice,
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
  };

  const coordinacionProps = {
    clubNombre: userData?.clubNombre,
    usuarios: clubUsuarios,
    usuariosLoading: clubUsuariosLoading,
    equipos,
    equiposLoading,
    onEntrarEquipo: handleEntrarEquipo,
    canEditEquipos: isCoordinador(userData?.rol),
    equipoEditandoId,
    editEquipoNombre,
    setEditEquipoNombre,
    editEquipoGenero,
    setEditEquipoGenero,
    editEquipoTipoCanasta,
    setEditEquipoTipoCanasta,
    savingEquipoId,
    onStartEditEquipo: handleIniciarEditEquipo,
    onCancelEditEquipo: handleCancelarEditEquipo,
    onSaveEquipo: handleGuardarEquipo,
    accent,
    accentLight,
    accentSoft,
    text,
    textSecondary,
    textMuted,
    inputBorder,
    inputBg,
    cardBgElevated,
  };

  const equipoEditProps = {
    canEditEquipo: puedeGestionarEquipo,
    equipoEditandoId,
    editEquipoNombre,
    setEditEquipoNombre,
    editEquipoGenero,
    setEditEquipoGenero,
    editEquipoTipoCanasta,
    setEditEquipoTipoCanasta,
    savingEquipoId,
    onStartEditEquipo: handleIniciarEditEquipo,
    onCancelEditEquipo: handleCancelarEditEquipo,
    onSaveEquipo: handleGuardarEquipo,
  };

  const handleSeedDemoData = async () => {
    if (userData?.rol !== "superadmin") {
      setErrorMsg("No tienes permiso para generar datos de prueba.");
      return;
    }

    const confirmed = window.confirm(
      "¿Generar datos de prueba?\n\nPor cada club: 6 equipos, 10 jugadoras por equipo y entrenamientos/partidos aleatorios de los últimos 90 días.\n\nSi no hay clubes, se crearán 3 de demo."
    );
    if (!confirmed) return;

    setSeedingDemo(true);
    setErrorMsg("");
    setSeedNotice(null);
    try {
      const summary = await seedDemoData(db, { clubIdFilter: null });
      setSeedNotice(
        `Datos generados: ${summary.clubes} club${summary.clubes === 1 ? "" : "es"} · ${summary.equiposCreados} equipos nuevos · ${summary.jugadorasCreadas} jugadoras · ${summary.sesionesCreadas} sesiones.`
      );
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para generar datos de prueba."
        : err?.message || "No se pudieron generar los datos de prueba.");
    } finally {
      setSeedingDemo(false);
    }
  };

  const canSeedDemoData = userData?.rol === "superadmin";
  const demoSeedProps = {
    onSeed: handleSeedDemoData,
    seeding: seedingDemo,
    notice: seedNotice,
    accent,
    text,
    textSecondary,
    inputBorder,
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
      await addDoc(collection(db, "Equipos"), {
        nombre: nuevoEquipoNombre.trim(),
        clubId: userData.clubId,
        genero: nuevoEquipoGenero,
        tipoCanasta: nuevoEquipoTipoCanasta,
        creadoEn: new Date(),
      });
      setNuevoEquipoNombre("");
      setNuevoEquipoGenero(GENERO_FEMENINO);
      setNuevoEquipoTipoCanasta(TIPO_CANASTA_GRANDE);
    } catch (err) {
      setErrorMsg("Error creando equipo");
    }
    setCrearEquipoLoading(false);
  };

  const puedeGestionarEquipo = (equipo) => canManageEquipo(userData?.rol, userData?.clubId, equipo?.clubId);

  const handleIniciarEditEquipo = (equipo) => {
    if (!puedeGestionarEquipo(equipo)) return;
    setEquipoEditandoId(equipo.id);
    setEditEquipoNombre(equipo.nombre || "");
    setEditEquipoGenero(equipo.genero === GENERO_MASCULINO ? GENERO_MASCULINO : GENERO_FEMENINO);
    setEditEquipoTipoCanasta(equipo.tipoCanasta === TIPO_CANASTA_MINI ? TIPO_CANASTA_MINI : TIPO_CANASTA_GRANDE);
    setErrorMsg("");
  };

  const handleCancelarEditEquipo = () => {
    setEquipoEditandoId(null);
    setEditEquipoNombre("");
    setEditEquipoGenero(GENERO_FEMENINO);
    setEditEquipoTipoCanasta(TIPO_CANASTA_GRANDE);
  };

  const handleGuardarEquipo = async (equipoId) => {
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipoId || !equipo || !puedeGestionarEquipo(equipo) || !editEquipoNombre.trim()) return;

    setSavingEquipoId(equipoId);
    setErrorMsg("");
    const payload = {
      nombre: editEquipoNombre.trim(),
      genero: editEquipoGenero,
      tipoCanasta: editEquipoTipoCanasta,
    };

    try {
      await updateDoc(doc(db, "Equipos", equipoId), payload);
      setEquipos((prev) => prev.map((e) => (e.id === equipoId ? { ...e, ...payload } : e)));
      if (equipoActivo?.id === equipoId) {
        setEquipoActivo((prev) => (prev ? { ...prev, ...payload } : prev));
      }
      handleCancelarEditEquipo();
    } catch (err) {
      setErrorMsg(err?.code === "permission-denied"
        ? "No tienes permiso para editar este equipo."
        : "No se pudo guardar el equipo.");
    } finally {
      setSavingEquipoId(null);
    }
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
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorAnadirJugador);
    }
    setAddJugadoraLoading(false);
  };

  const handleEliminarJugadora = async (jugadora) => {
    const confirmar = window.confirm(`¿Eliminar a ${jugadora.nombre} de la plantilla?`);
    if (!confirmar) return;
    setErrorMsg("");
    if (jugadoraEditandoId === jugadora.id) {
      setJugadoraEditandoId(null);
    }
    try {
      await deleteDoc(doc(db, "Jugadoras", jugadora.id));
    } catch (err) {
      setErrorMsg(getEquipoLabels(equipoActivo?.genero).errorEliminarJugador);
    }
  };

  const handleIniciarEditJugadora = (jugadora) => {
    setJugadoraEditandoId(jugadora.id);
    setEditJugadoraNombre(jugadora.nombre || "");
    setEditJugadoraDorsal(String(jugadora.dorsal ?? ""));
    setEditJugadoraApodo(jugadora.apodo || "");
    setErrorMsg("");
  };

  const handleCancelarEditJugadora = () => {
    setJugadoraEditandoId(null);
    setEditJugadoraNombre("");
    setEditJugadoraDorsal("");
    setEditJugadoraApodo("");
  };

  const handleGuardarJugadora = async (jugadoraId) => {
    if (!editJugadoraNombre.trim() || !editJugadoraDorsal.trim()) return;
    setEditJugadoraLoading(true);
    setErrorMsg("");
    try {
      await updateDoc(doc(db, "Jugadoras", jugadoraId), {
        nombre: editJugadoraNombre.trim(),
        dorsal: Number(editJugadoraDorsal),
        apodo: editJugadoraApodo.trim(),
      });
      handleCancelarEditJugadora();
    } catch (err) {
      setErrorMsg("No se pudo guardar los cambios.");
    }
    setEditJugadoraLoading(false);
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
        jugadorasExternas: [],
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
        jugadorasExternas: [],
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
    const equipoLabels = getEquipoLabels(equipoActivo.genero);
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
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: textMuted }}>
              {formatTipoCanasta(equipoActivo.tipoCanasta)} · {formatGeneroEquipo(equipoActivo.genero)}
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
                                : equipoLabels.sinJugadoresPlantilla
                              : undefined}
                            btnTodasPresentes={tipoSesion === "partido" ? "Todas convocadas" : "Todas presentes"}
                            btnTodasAusentes={tipoSesion === "partido" ? "Ninguna convocada" : "Todas ausentes"}
                            onGoToPlantilla={() => setTab("plantilla")}
                            text={text}
                            labels={equipoLabels}
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
              {equipoLabels.noHayJugadoresPlantilla}{" "}
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
                    labels={equipoLabels}
                  />
                )}
                {(statsVista === "partidos" || statsVista === "todo") && (
                  <EstadisticasTablaTipo
                    tipo="partido"
                    totalSesiones={totalPartidos}
                    estadisticas={estadisticas}
                    theme={{ accent, accentLight, colorPartido, colorPartidoLight, text, textMuted, textSecondary, surface, error, success, inputBorder, cardBgElevated, tableHeader, tableHeaderAccent }}
                    labels={equipoLabels}
                  />
                )}
              </div>
            </>
          )}
        </div>
      );
    } else if (tab === "plantilla") {
      tabContent = (
        <div className="plantilla-tab" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 27, width: "100%" }}>
          <h2 style={{ color: text, fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <IconUsers size={22} color={accent} />
            {equipoLabels.plantillaTitulo}
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
            labels={equipoLabels}
          />
          <div className="content-medium" style={{ width: "99%", margin: "0 auto", marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
            {jugadorasLoading ? (
              <div style={{ color: "#bbb", fontSize: 16, fontStyle: "italic", padding: "12px 0", fontWeight: 500 }}>{equipoLabels.cargandoJugadores}</div>
            ) : jugadoras.length === 0 ? (
              <div style={{ color: "#757690", fontStyle: "italic", fontSize: 15.5 }}>{equipoLabels.noHayJugadoresPlantilla}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", marginTop: 4 }}>
                {jugadoras.map(j => (
                  <PlantillaJugadoraRow
                    key={j.id}
                    jugadora={j}
                    isEditing={jugadoraEditandoId === j.id}
                    editNombre={editJugadoraNombre}
                    setEditNombre={setEditJugadoraNombre}
                    editDorsal={editJugadoraDorsal}
                    setEditDorsal={setEditJugadoraDorsal}
                    editApodo={editJugadoraApodo}
                    setEditApodo={setEditJugadoraApodo}
                    editLoading={editJugadoraLoading}
                    onStartEdit={handleIniciarEditJugadora}
                    onCancelEdit={handleCancelarEditJugadora}
                    onSaveEdit={handleGuardarJugadora}
                    onDelete={handleEliminarJugadora}
                    accent={accent}
                    accentShadow={accentShadow}
                    inputBorder={inputBorder}
                    inputBg={inputBg}
                    surface={surface}
                    text={text}
                    textSecondary={textSecondary}
                    error={error}
                    labels={equipoLabels}
                  />
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
  const esCoordinador = isCoordinador(userData?.rol);

  const renderEquiposLista = ({ titulo, mostrarClub, permitirCrear }) => {
    const equiposVisibles = esSuperadmin
      ? equipos
      : equipos.filter((equipo) => equipo.clubId === userData?.clubId);

    return (
    <div className="section-heading">
      <span className="section-heading__accent">{titulo}</span>
      {permitirCrear && userData?.clubId && (
        <form
          onSubmit={handleCrearEquipo}
          className="content-medium form-shell"
          style={{
            margin: "35px auto 14px auto",
            width: "96%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 18px",
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 14,
          }}
        >
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={nuevoEquipoNombre}
            onChange={(e) => setNuevoEquipoNombre(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 16,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              background: inputBg,
              color: text,
              outline: "none",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
            disabled={crearEquipoLoading}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 6, color: textSecondary, fontSize: 13, fontWeight: 600 }}>
              Canasta
              <select
                value={nuevoEquipoTipoCanasta}
                onChange={(e) => setNuevoEquipoTipoCanasta(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
                <option value={TIPO_CANASTA_MINI}>Minibasket</option>
              </select>
            </label>
            <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 6, color: textSecondary, fontSize: 13, fontWeight: 600 }}>
              Categoría
              <select
                value={nuevoEquipoGenero}
                onChange={(e) => setNuevoEquipoGenero(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={GENERO_FEMENINO}>Femenino</option>
                <option value={GENERO_MASCULINO}>Masculino</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            style={{
              background: accent,
              color: onAccent,
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: 15,
              cursor: crearEquipoLoading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: crearEquipoLoading ? 0.7 : 1,
            }}
            disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()}
          >
            {crearEquipoLoading ? "Creando…" : "Crear equipo"}
          </button>
        </form>
      )}
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div className="empty-state-text" style={{ fontSize: 17, padding: "12px 0", gridColumn: "1 / -1" }}>Cargando equipos...</div>
        ) : equiposVisibles.length === 0 ? (
          <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
            {permitirCrear ? "No hay equipos aún. ¡Crea el primero!" : "No hay equipos registrados."}
          </div>
        ) : (
          equiposVisibles.map(equipo => (
            <EquipoListRow
              key={equipo.id}
              equipo={equipo}
              clubNombre={getClubNombre(equipo.clubId)}
              mostrarClub={mostrarClub}
              canEdit={equipoEditProps.canEditEquipo(equipo)}
              isEditing={equipoEditProps.equipoEditandoId === equipo.id}
              editNombre={equipoEditProps.editEquipoNombre}
              setEditNombre={equipoEditProps.setEditEquipoNombre}
              editGenero={equipoEditProps.editEquipoGenero}
              setEditGenero={equipoEditProps.setEditEquipoGenero}
              editTipoCanasta={equipoEditProps.editEquipoTipoCanasta}
              setEditTipoCanasta={equipoEditProps.setEditEquipoTipoCanasta}
              saving={equipoEditProps.savingEquipoId === equipo.id}
              onStartEdit={equipoEditProps.onStartEditEquipo}
              onCancelEdit={equipoEditProps.onCancelEditEquipo}
              onSave={equipoEditProps.onSaveEquipo}
              onEntrar={handleEntrarEquipo}
              accent={accent}
              accentLight={accentLight}
              text={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              inputBorder={inputBorder}
              inputBg={inputBg}
              cardBgElevated={cardBgElevated}
              borderAccent={equipo.clubId === userData?.clubId ? accent : textMuted}
            />
          ))
        )}
      </div>
    </div>
    );
  };

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
    const equipoMeta = `${formatTipoCanasta(equipoActivo.tipoCanasta)} · ${formatGeneroEquipo(equipoActivo.genero)}`;
    const contextProps = {
      clubNombre: getNombreClubActivo(),
      equipoNombre: equipoActivo.nombre,
      equipoMeta,
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
          <div className="app-mobile-nav-spacer" aria-hidden="true" />
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
            <button
              type="button"
              className="app-header-options-btn"
              onClick={handleOpenOpciones}
              style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
            >
              <IconSettings size={16} color={textMuted} />
              <span>Opciones</span>
            </button>
            {canSeedDemoData && (
              <button
                type="button"
                className="app-header-seed-btn"
                onClick={handleSeedDemoData}
                disabled={seedingDemo}
                style={{
                  color: accent,
                  borderColor: inputBorder,
                  background: cardBgElevated,
                  opacity: seedingDemo ? 0.75 : 1,
                  cursor: seedingDemo ? "wait" : "pointer",
                }}
              >
                {seedingDemo ? "Generando…" : "Datos prueba"}
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
                <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}`, width: "100%", maxWidth: 520 }}>
                  {[
                    { key: "clubes", label: "Clubes" },
                    { key: "equipos", label: "Equipos" },
                    { key: "usuarios", label: "Usuarios" },
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
                    <DemoSeedCard {...demoSeedProps} />
                    {solicitudesLoading ? (
                      <div className="empty-state-text" style={{ width: "97%", marginBottom: 16, fontSize: 15 }}>Cargando solicitudes de club…</div>
                    ) : solicitudesClub.length > 0 && (
                      <div
                        style={{
                          width: "97%",
                          marginBottom: 20,
                          padding: "16px 18px",
                          background: cardBgElevated,
                          borderRadius: 12,
                          border: `1px solid ${inputBorder}`,
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{ color: text, fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
                          Solicitudes de club pendientes
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {solicitudesClub.map((usuario) => (
                            <div
                              key={usuario.id}
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 10,
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: `1px solid ${inputBorder}`,
                                background: inputBg,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: text, fontWeight: 600, fontSize: 14 }}>
                                  {usuario.nombre?.trim() || usuario.email || "Entrenador"}
                                </div>
                                <div style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>
                                  {usuario.clubNombre ? (
                                    <>Cambio de <span style={{ fontWeight: 600 }}>{usuario.clubNombre}</span> a <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span></>
                                  ) : (
                                    <>Solicita: <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span></>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  onClick={() => handleAprobarSolicitudClub(usuario)}
                                  style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRechazarSolicitudClub(usuario)}
                                  style={{ background: "transparent", color: textMuted, border: `1px solid ${inputBorder}`, borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                ) : superadminVista === "usuarios" ? (
                  <SuperadminUsuariosPanel {...superadminUsuariosProps} />
                ) : (
                  <>
                    <DemoSeedCard {...demoSeedProps} />
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
                ) : esCoordinador ? (
                  <>
                    <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: 4, background: cardBgElevated, borderRadius: 12, border: `1px solid ${inputBorder}`, width: "100%", maxWidth: 420 }}>
                      {[
                        { key: "equipos", label: "Equipos" },
                        { key: "coordinacion", label: "Coordinación" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCoordinadorVista(key)}
                          style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: 9,
                            border: coordinadorVista === key ? `1px solid rgba(42, 101, 112, 0.35)` : "1px solid transparent",
                            background: coordinadorVista === key ? accentSoft : "transparent",
                            color: coordinadorVista === key ? accentLight : textMuted,
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
                    {coordinadorVista === "coordinacion" ? (
                      <CoordinacionPanel {...coordinacionProps} />
                    ) : (
                      renderEquiposLista({
                        titulo: <>Equipos del Club: <span style={{ color: text }}>{userData.clubNombre}</span></>,
                        mostrarClub: false,
                        permitirCrear: true,
                      })
                    )}
                  </>
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
                  <div>Paso 1:<br /><span style={{ color: accent }}>Solicita unirte a tu Club</span></div>
                  {userData?.solicitudClubId && !userData?.clubId && (
                    <div
                      style={{
                        marginTop: 20,
                        width: "98%",
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: accentSoft,
                        border: `1px solid ${accentBorder}`,
                        color: text,
                        fontSize: 14,
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      Tu solicitud para <span style={{ color: accentLight, fontWeight: 700 }}>{userData.solicitudClubNombre}</span> está pendiente de aprobación por el superadmin.
                    </div>
                  )}
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
                            <button
                              type="button"
                              className="entity-list-card__action"
                              onClick={() => handleSolicitarClub(club)}
                              disabled={userData?.solicitudClubId === club.id}
                            >
                              {userData?.solicitudClubId === club.id ? "Solicitado" : "Solicitar"}
                            </button>
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