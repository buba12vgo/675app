import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";
import { BuscadorJugadorasClub } from "./BuscadorJugadorasClub.jsx";
import {
  MOTIVOS_AUSENCIA,
  MOTIVO_AUSENCIA_DEFAULT,
} from "../lib/motivosAusencia.js";

export function AsistenciaValoracionPanel({
  jugadoras,
  jugadorasLoading,
  asistencias,
  valoraciones,
  setAsistencias,
  setValoraciones,
  motivosAusencia = {},
  setMotivosAusencia,
  accent,
  inputBorder,
  textMuted,
  textSecondary: _textSecondary,
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
  jugadorasClub,
  equiposClub,
  jugadorasClubLoading,
  equipoActivoId,
  onAddJugadoraExterna,
  onRemoveJugadoraExterna,
  inputBg,
  readOnly = false,
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
    if (readOnly) return;
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
    setMotivosAusencia?.(prev => {
      const nuevo = { ...prev };
      jugadoras.forEach(j => { delete nuevo[j.id]; });
      return nuevo;
    });
  };

  const marcarTodasAusentes = () => {
    if (readOnly) return;
    setAsistencias(prev => {
      const nuevo = { ...prev };
      jugadoras.forEach(j => { nuevo[j.id] = false; });
      return nuevo;
    });
    setValoraciones({});
    setMotivosAusencia?.(() => {
      const nuevo = {};
      jugadoras.forEach(j => { nuevo[j.id] = MOTIVO_AUSENCIA_DEFAULT; });
      return nuevo;
    });
  };

  const marcarPresente = (jugadoraId) => {
    if (readOnly) return;
    setAsistencias(prev => ({ ...prev, [jugadoraId]: true }));
    setValoraciones(prev => ({
      ...prev,
      [jugadoraId]: typeof prev[jugadoraId] === "number" ? prev[jugadoraId] : 3,
    }));
    setMotivosAusencia?.(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
  };

  const iniciarAusencia = (jugadoraId) => {
    if (readOnly) return;
    setAsistencias(prev => ({ ...prev, [jugadoraId]: false }));
    setValoraciones(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
    setMotivosAusencia?.(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
  };

  const marcarAusente = (jugadoraId, motivo) => {
    if (readOnly) return;
    setAsistencias(prev => ({ ...prev, [jugadoraId]: false }));
    setValoraciones(prev => {
      const nuevo = { ...prev };
      delete nuevo[jugadoraId];
      return nuevo;
    });
    setMotivosAusencia?.(prev => ({ ...prev, [jugadoraId]: motivo }));
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
        {totalJugadoras > 0 && !readOnly && (
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
      {onAddJugadoraExterna ? (
        <BuscadorJugadorasClub
          jugadorasClub={jugadorasClub}
          equiposClub={equiposClub}
          equipoActivoId={equipoActivoId}
          idsYaEnSesion={jugadoras.map((j) => j.id)}
          loading={jugadorasClubLoading}
          onAdd={onAddJugadoraExterna}
          accent={accent}
          inputBorder={inputBorder}
          inputBg={inputBg}
          text={text}
          textMuted={textMuted}
          cardBgElevated={cardBgElevated}
          labels={playerLabels}
        />
      ) : null}
      <div className="session-asistencia-list">
        {jugadorasLoading ? (
          <div style={{ color: textMuted, fontSize: 15.2, fontStyle: "italic" }}>{playerLabels.cargandoJugadores}</div>
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
            const motivoActual = motivosAusencia[j.id];
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
                    {j.esExterna && j.equipoNombre ? (
                      <span className="asistencia-row__equipo" style={{ color: textMuted }}>{j.equipoNombre}</span>
                    ) : null}
                  </div>
                </div>
                <div className="asistencia-row__controls">
                  {estaPresente ? (
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
                  ) : (
                    <div className="asistencia-motivo-group" role="group" aria-label="Motivo de ausencia">
                      {MOTIVOS_AUSENCIA.map((motivo) => {
                        const activo = motivoActual === motivo.id;
                        return (
                          <button
                            key={motivo.id}
                            type="button"
                            className={`asistencia-motivo-btn${activo ? " asistencia-motivo-btn--active" : ""}`}
                            aria-pressed={activo}
                            onClick={() => marcarAusente(j.id, motivo.id)}
                            title={motivo.label}
                          >
                            <span className="asistencia-motivo-btn__full">{motivo.label}</span>
                            <span className="asistencia-motivo-btn__short">{motivo.short}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="asistencia-action-group">
                    <button
                      type="button"
                      className="asistencia-toggle-btn"
                      aria-label={estaPresente ? "Marcar ausente" : "Marcar presente"}
                      title={estaPresente ? "Presente — pulsa para elegir el motivo de ausencia" : "Ausente — pulsa para marcar presente"}
                      onClick={() => {
                        if (estaPresente) iniciarAusencia(j.id);
                        else marcarPresente(j.id);
                      }}
                      style={{
                        background: estaPresente ? verdePresente : rojoAusente,
                        boxShadow: estaPresente
                          ? "0 2px 8px rgba(52,199,89,0.35)"
                          : "0 2px 8px rgba(255,69,58,0.3)",
                      }}
                    >
                      {estaPresente ? "✓" : "✗"}
                    </button>
                    {j.esExterna && onRemoveJugadoraExterna ? (
                      <button
                        type="button"
                        className="asistencia-remove-btn"
                        onClick={() => onRemoveJugadoraExterna(j.id)}
                        aria-label={`${playerLabels.quitarDeSesion}: ${j.nombre}`}
                        title={playerLabels.quitarDeSesion}
                      >
                        ×
                      </button>
                    ) : null}
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
