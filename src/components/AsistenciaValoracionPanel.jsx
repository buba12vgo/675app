import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";

export function AsistenciaValoracionPanel({
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
