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
  accent,
  accentSoft,
  accentLight,
  colorPartido,
  surface,
  inputBorder,
  text,
  textMuted,
}) {
  return (
    <div
      className="session-day-panel"
      style={{
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
        position: "relative",
      }}
    >
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
          boxShadow: "0 2px 8px rgba(100, 116, 139, 0.10)",
          cursor: "pointer",
          alignSelf: "flex-start",
          marginTop: -4,
          marginLeft: -2,
        }}
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
              background: tipoSesion === "partido" ? "rgba(139,92,246,0.2)" : accentSoft,
              color: tipoSesion === "partido" ? colorPartido : accentLight,
              border: `1px solid ${tipoSesion === "partido" ? "rgba(139,92,246,0.45)" : "rgba(100, 116, 139, 0.35)"}`,
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  width: "100%",
                  maxWidth: 320,
                }}
              >
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
                    boxShadow: "0 4px 14px rgba(100, 116, 139, 0.28)",
                  }}
                  onClick={onCrearEntreno}
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
