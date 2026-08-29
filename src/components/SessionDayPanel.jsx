import { SessionForm } from "./SessionForm.jsx";

export function SessionDayPanel({
  fechaSesionSeleccionada,
  onVolver,
  sesionDoc,
  tipoSesion,
  sesionCargando,
  guardandoSesion,
  onCrearEntreno,
  onCrearPartido,
  sessionFormProps,
  accent: _accent,
  accentSoft,
  accentLight,
  colorPartido,
  surface: _surface,
  inputBorder: _inputBorder,
  text,
  textMuted,
}) {
  return (
    <div className="session-day-panel">
      <button
        className="session-day-panel__back"
        tabIndex={0}
        type="button"
        onClick={onVolver}
      >
        ← Volver al Calendario
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
              background: tipoSesion === "partido" ? "var(--color-partido-soft)" : accentSoft,
              color: tipoSesion === "partido" ? colorPartido : accentLight,
              border: `1px solid ${tipoSesion === "partido" ? "var(--color-partido-border)" : "var(--color-accent-border)"}`,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {tipoSesion === "partido" ? "Partido" : "Entreno"}
          </span>
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
          {!sesionDoc && !guardandoSesion ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                alignItems: "center",
                marginTop: 17,
                width: "100%",
              }}
            >
              <div
                style={{
                  color: textMuted,
                  fontWeight: 500,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                No hay evento registrado para esta fecha.
                <br />
                Elige qué quieres crear:
              </div>
              <div className="session-day-panel__create">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onCrearEntreno}
                  disabled={guardandoSesion}
                >
                  + Crear Entreno
                </button>
                <button
                  type="button"
                  className="btn-primary btn-primary--partido"
                  onClick={onCrearPartido}
                  disabled={guardandoSesion}
                >
                  + Crear Partido
                </button>
              </div>
            </div>
          ) : (
            <SessionForm key={fechaSesionSeleccionada} {...sessionFormProps} />
          )}
        </>
      )}
    </div>
  );
}
