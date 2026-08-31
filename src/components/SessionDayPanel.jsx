import {
  canCreateTipoSesion,
  diaTieneSesionTactica,
  diaTieneTipo,
  etiquetaTipoSesion,
  normalizarTipoSesion,
  TIPO_SESION_ENTRENO,
  TIPO_SESION_FISICO,
  TIPO_SESION_PARTIDO,
} from "../lib/appUtils.js";
import { SessionForm } from "./SessionForm.jsx";

function badgeColors(tipo, colors) {
  const t = normalizarTipoSesion({ tipo });
  if (t === TIPO_SESION_PARTIDO) {
    return {
      bg: "var(--color-partido-soft)",
      color: colors.colorPartido,
      border: "var(--color-partido-border)",
    };
  }
  if (t === TIPO_SESION_FISICO) {
    return {
      bg: "var(--color-fisico-soft)",
      color: colors.colorFisico,
      border: "var(--color-fisico-border)",
    };
  }
  return {
    bg: colors.accentSoft,
    color: colors.accentLight,
    border: "var(--color-accent-border)",
  };
}

export function SessionDayPanel({
  fechaSesionSeleccionada,
  onVolver,
  sesionDoc,
  tipoSesion,
  sesionCargando,
  guardandoSesion,
  sesionesDelDia = [],
  onSelectSesion,
  onCerrarSesion,
  onCrearEntreno,
  onCrearPartido,
  onCrearFisico,
  userRol,
  sessionFormProps,
  accent: _accent,
  accentSoft,
  accentLight,
  colorPartido,
  colorFisico,
  surface: _surface,
  inputBorder: _inputBorder,
  text,
  textMuted,
  readOnly = false,
}) {
  const colors = { accentSoft, accentLight, colorPartido, colorFisico };
  const tieneTactica = diaTieneSesionTactica(sesionesDelDia, fechaSesionSeleccionada);
  const tieneFisico = diaTieneTipo(sesionesDelDia, fechaSesionSeleccionada, TIPO_SESION_FISICO);
  const puedeEntreno = canCreateTipoSesion(userRol, TIPO_SESION_ENTRENO) && !tieneTactica;
  const puedePartido = canCreateTipoSesion(userRol, TIPO_SESION_PARTIDO) && !tieneTactica;
  const puedeFisico = canCreateTipoSesion(userRol, TIPO_SESION_FISICO) && !tieneFisico;
  const mostrarCrear = !sesionDoc && (puedeEntreno || puedePartido || puedeFisico);

  return (
    <div className="session-day-panel">
      <button
        className="session-day-panel__back"
        tabIndex={0}
        type="button"
        onClick={() => {
          if (sesionDoc && sesionesDelDia.length) {
            onCerrarSesion?.();
            return;
          }
          onVolver();
        }}
      >
        {sesionDoc && sesionesDelDia.length ? "← Volver al día" : "← Volver al Calendario"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ color: text, fontWeight: 700, fontSize: 18.8 }}>
          {fechaSesionSeleccionada.split("-").reverse().join("/")}
        </div>
        {sesionDoc && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 99,
              background: badgeColors(tipoSesion, colors).bg,
              color: badgeColors(tipoSesion, colors).color,
              border: `1px solid ${badgeColors(tipoSesion, colors).border}`,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {etiquetaTipoSesion(tipoSesion)}
          </span>
        )}
        {readOnly && sesionDoc && (
          <span style={{ fontSize: 12, color: textMuted, fontWeight: 600 }}>Solo lectura</span>
        )}
      </div>

      {sesionCargando ? (
        <div
          style={{
            color: textMuted,
            fontSize: 16,
            fontStyle: "italic",
            padding: "12px 0",
            fontWeight: 500,
          }}
        >
          Cargando sesión...
        </div>
      ) : (
        <>
          {!sesionDoc && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, width: "100%" }}>
              {sesionesDelDia.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ color: textMuted, fontWeight: 600, fontSize: 13 }}>
                    Sesiones del día
                  </div>
                  {sesionesDelDia.map((s) => {
                    const badge = badgeColors(s.tipo, colors);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className="session-day-panel__session-card"
                        onClick={() => onSelectSesion?.(s)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: `1px solid ${badge.border}`,
                          background: badge.bg,
                          color: text,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{etiquetaTipoSesion(s.tipo)}</span>
                        <span style={{ color: textMuted, fontSize: 13 }}>
                          {normalizarTipoSesion(s) === TIPO_SESION_PARTIDO
                            ? (s.rival?.trim() || "Rival por confirmar")
                            : (s.tematica?.trim() || "Sin temática")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!sesionesDelDia.length && (
                <div
                  style={{
                    color: textMuted,
                    fontWeight: 500,
                    fontSize: 15,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  No hay evento registrado para esta fecha.
                  {mostrarCrear ? (
                    <>
                      <br />
                      Elige qué quieres crear:
                    </>
                  ) : null}
                </div>
              )}

              {mostrarCrear && (
                <div className="session-day-panel__create">
                  {puedeEntreno && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={onCrearEntreno}
                      disabled={guardandoSesion}
                    >
                      + Crear Entreno
                    </button>
                  )}
                  {puedePartido && (
                    <button
                      type="button"
                      className="btn-primary btn-primary--partido"
                      onClick={onCrearPartido}
                      disabled={guardandoSesion}
                    >
                      + Crear Partido
                    </button>
                  )}
                  {puedeFisico && (
                    <button
                      type="button"
                      className="btn-primary btn-primary--fisico"
                      onClick={onCrearFisico}
                      disabled={guardandoSesion}
                    >
                      + Crear Físico
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {sesionDoc && (
            <SessionForm key={sesionDoc.id || fechaSesionSeleccionada} {...sessionFormProps} readOnly={readOnly} />
          )}
        </>
      )}
    </div>
  );
}
