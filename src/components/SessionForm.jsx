import { useState } from "react";
import { AsistenciaValoracionPanel } from "./AsistenciaValoracionPanel.jsx";
import { PlanificacionSextosPanel } from "./PlanificacionSextosPanel.jsx";
import { esEquipoMinibasket } from "../lib/planificacionSextos.js";

export function SessionForm({
  tipoSesion,
  sesionVista,
  onSesionVistaChange,
  rivalPartido,
  onRivalPartidoChange,
  localPartido,
  onLocalPartidoChange,
  tematica,
  onTematicaChange,
  ejercicios,
  onEjerciciosChange,
  jugadorasSesion,
  jugadorasLoading,
  asistencias,
  valoraciones,
  setAsistencias,
  setValoraciones,
  motivosAusencia,
  setMotivosAusencia,
  planificacionSextos = {},
  onToggleSexto = () => {},
  onSubmit,
  onDelete,
  guardadoNotice,
  guardandoSesion,
  onGoToPlantilla,
  accent,
  colorPartido,
  inputBorder,
  textMuted,
  textSecondary,
  text,
  success,
  error,
  cardBgElevated,
  inputBg,
  equipoLabels,
  jugadorasClub,
  equiposClub,
  jugadorasClubLoading,
  equipoActivoId,
  tipoCanasta,
  nombreEquipo,
  onAddJugadoraExterna,
  onRemoveJugadoraExterna,
}) {
  const [pasoEliminar, setPasoEliminar] = useState(0);
  const presentesCount = jugadorasSesion.filter((j) => asistencias[j.id]).length;
  const totalJugadoras = jugadorasSesion.length;
  const esPartido = tipoSesion === "partido";
  const esMinibasket = esEquipoMinibasket(tipoCanasta, nombreEquipo);
  const mostrarPlanificacion = esPartido && esMinibasket;
  const jugadorasConvocadas = jugadorasSesion.filter((j) => asistencias[j.id]);
  const etiqueta = esPartido ? "partido" : "entreno";
  const vistaActiva =
    !mostrarPlanificacion && sesionVista === "planificacion" ? "datos" : sesionVista;

  return (
    <form
      className={`session-form${mostrarPlanificacion ? " session-form--con-planificacion" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (pasoEliminar > 0 || guardandoSesion) return;
        onSubmit();
      }}
      autoComplete="off"
    >
      <div className="session-subnav">
        <button
          type="button"
          className={`session-subnav-btn${vistaActiva === "datos" ? " session-subnav-btn--active" : ""}`}
          onClick={() => onSesionVistaChange("datos")}
        >
          {tipoSesion === "partido" ? "Datos del partido" : "Datos de sesión"}
        </button>
        <button
          type="button"
          className={`session-subnav-btn${vistaActiva === "asistencia" ? " session-subnav-btn--active" : ""}`}
          onClick={() => onSesionVistaChange("asistencia")}
        >
          {tipoSesion === "partido"
            ? `Convocatoria (${presentesCount}/${totalJugadoras})`
            : `Asistencia (${presentesCount}/${totalJugadoras})`}
        </button>
        {mostrarPlanificacion ? (
          <button
            type="button"
            className={`session-subnav-btn${vistaActiva === "planificacion" ? " session-subnav-btn--active" : ""}`}
            onClick={() => onSesionVistaChange("planificacion")}
          >
            Planificación
          </button>
        ) : null}
      </div>

      <div className="session-panel-layout">
        <div className={`session-panel-datos${vistaActiva !== "datos" ? " session-panel-section--hidden-mobile" : ""}`}>
          {tipoSesion === "partido" ? (
            <div
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.35)",
                borderRadius: 12,
                padding: "16px 14px",
              }}
            >
              <div
                style={{
                  color: colorPartido,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Información del partido
              </div>
              <label
                style={{
                  display: "block",
                  color: textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Rival
              </label>
              <input
                type="text"
                placeholder="Nombre del equipo rival"
                value={rivalPartido}
                onChange={(e) => onRivalPartidoChange(e.target.value)}
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
              <label
                style={{
                  display: "block",
                  color: textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Condición
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["casa", "fuera"].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => onLocalPartidoChange(op)}
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
              <div
                style={{
                  color: textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Temática y ejercicios
              </div>
              <input
                type="text"
                placeholder="Temática"
                value={tematica}
                onChange={(e) => onTematicaChange(e.target.value)}
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
                onChange={(e) => onEjerciciosChange(e.target.value)}
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

        <div
          className={`session-panel-asistencia${vistaActiva !== "asistencia" ? " session-panel-section--hidden-mobile" : ""}`}
        >
          <AsistenciaValoracionPanel
            jugadoras={jugadorasSesion}
            jugadorasLoading={jugadorasLoading}
            asistencias={asistencias}
            valoraciones={valoraciones}
            setAsistencias={setAsistencias}
            setValoraciones={setValoraciones}
            motivosAusencia={motivosAusencia}
            setMotivosAusencia={setMotivosAusencia}
            accent={tipoSesion === "partido" ? colorPartido : accent}
            inputBorder={inputBorder}
            textMuted={textMuted}
            textSecondary={textSecondary}
            success={success}
            error={error}
            cardBgElevated={cardBgElevated}
            titulo={tipoSesion === "partido" ? "Convocatoria" : "Asistencia y valoración"}
            resumenPresentes={
              tipoSesion === "partido"
                ? (p, t) =>
                    t > 0
                      ? `${p} convocadas · ${t - p} fuera · valoración 1-5 si está convocada`
                      : equipoLabels.sinJugadoresPlantilla
                : undefined
            }
            btnTodasPresentes={tipoSesion === "partido" ? "Todas convocadas" : "Todas presentes"}
            btnTodasAusentes={tipoSesion === "partido" ? "Ninguna convocada" : "Todas ausentes"}
            onGoToPlantilla={onGoToPlantilla}
            text={text}
            labels={equipoLabels}
            jugadorasClub={jugadorasClub}
            equiposClub={equiposClub}
            jugadorasClubLoading={jugadorasClubLoading}
            equipoActivoId={equipoActivoId}
            onAddJugadoraExterna={onAddJugadoraExterna}
            onRemoveJugadoraExterna={onRemoveJugadoraExterna}
            inputBg={inputBg}
          />
        </div>

        {mostrarPlanificacion ? (
          <div
            className={`session-panel-planificacion${vistaActiva !== "planificacion" ? " session-panel-section--hidden-mobile" : ""}`}
          >
            <PlanificacionSextosPanel
              jugadorasConvocadas={jugadorasConvocadas}
              planificacionSextos={planificacionSextos}
              onToggleSexto={onToggleSexto}
              labels={equipoLabels}
              inputBorder={inputBorder}
              textMuted={textMuted}
              cardBgElevated={cardBgElevated}
            />
          </div>
        ) : null}
      </div>

      <div className="session-form-actions">
        <button
          type="submit"
          className={`session-save-btn${tipoSesion === "partido" ? " session-save-btn--partido" : ""}`}
          disabled={guardandoSesion || pasoEliminar > 0}
        >
          Guardar {tipoSesion === "partido" ? "Partido" : "Sesión"}
        </button>
        {onDelete && pasoEliminar === 0 ? (
          <button
            type="button"
            className="session-delete-btn"
            onClick={() => setPasoEliminar(1)}
            disabled={guardandoSesion}
          >
            Eliminar {etiqueta}
          </button>
        ) : null}
        {onDelete && pasoEliminar > 0 ? (
          <div className="session-delete-confirm" role="alertdialog" aria-labelledby="session-delete-title">
            <div id="session-delete-title" className="session-delete-confirm__title">
              {pasoEliminar === 1
                ? `¿Eliminar este ${etiqueta}?`
                : "Última confirmación"}
            </div>
            <p className="session-delete-confirm__text" style={{ color: textMuted }}>
              {pasoEliminar === 1
                ? "Se quitará del calendario y de las estadísticas."
                : "Esta acción no se puede deshacer. Confirma otra vez para borrar."}
            </p>
            <div className="session-delete-confirm__actions">
              <button
                type="button"
                className="session-delete-confirm__cancel"
                onClick={() => setPasoEliminar(0)}
                disabled={guardandoSesion}
                style={{ color: text, borderColor: inputBorder }}
              >
                Cancelar
              </button>
              {pasoEliminar === 1 ? (
                <button
                  type="button"
                  className="session-delete-btn session-delete-btn--compact"
                  onClick={() => setPasoEliminar(2)}
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  className="session-delete-btn session-delete-btn--compact session-delete-btn--solid"
                  onClick={onDelete}
                  disabled={guardandoSesion}
                >
                  {guardandoSesion ? "Eliminando…" : `Sí, eliminar ${etiqueta}`}
                </button>
              )}
            </div>
          </div>
        ) : null}
        {guardadoNotice ? (
          <div className="session-saved-notice" role="status" style={{ color: success }}>
            {guardadoNotice}
          </div>
        ) : null}
      </div>
    </form>
  );
}
