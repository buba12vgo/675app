import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";
import { IconGear, IconX } from "./icons.jsx";
import { RolPlantillaPicker } from "./RolPlantillaPicker.jsx";
import {
  ROL_PLANTILLA_JUGADOR,
  etiquetaRolPlantilla,
  esJugadorPlantilla,
  marcaRolPlantilla,
} from "../lib/plantillaRoles.js";

export function PlantillaJugadoraRow({
  jugadora,
  onOpenFicha,
  isEditing,
  editNombre,
  setEditNombre,
  editDorsal,
  setEditDorsal,
  editApodo,
  setEditApodo,
  editRol = ROL_PLANTILLA_JUGADOR,
  setEditRol,
  editLoading,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  accent,
  accentShadow: _accentShadow,
  inputBorder,
  inputBg,
  surface,
  text,
  textSecondary,
  error,
  labels,
  readOnly = false,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const esJugador = esJugadorPlantilla(jugadora);
  const editEsJugador = esJugadorPlantilla({ rolPlantilla: editRol });
  const puedeGuardar = editNombre.trim() && (!editEsJugador || editDorsal.trim());
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
        <RolPlantillaPicker
          value={editRol}
          onChange={(rol) => {
            setEditRol(rol);
            if (!esJugadorPlantilla({ rolPlantilla: rol })) setEditDorsal("");
          }}
          disabled={editLoading}
        />
        <div className="plantilla-jugadora-row__edit-fields">
          <input
            type="text"
            placeholder="Nombre"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          {editEsJugador ? (
            <input
              type="number"
              placeholder="Dorsal"
              value={editDorsal}
              onChange={(e) => setEditDorsal(e.target.value.replace(/^0+/, ""))}
              min={1}
              required
              style={{ ...inputStyle, width: 64 }}
            />
          ) : null}
          <input
            type="text"
            placeholder="Apodo"
            value={editApodo}
            onChange={(e) => setEditApodo(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
        <div className="plantilla-jugadora-row__edit-actions">
          <button
            type="button"
            className="plantilla-jugadora-row__btn plantilla-jugadora-row__btn--save"
            onClick={() => onSaveEdit(jugadora.id)}
            disabled={editLoading || !puedeGuardar}
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

  const marca = esJugador ? jugadora.dorsal : marcaRolPlantilla(jugadora.rolPlantilla);
  const puedeVerFicha = esJugador && onOpenFicha;
  const InfoTag = puedeVerFicha ? "button" : "div";
  const infoProps = puedeVerFicha
    ? {
        type: "button",
        className: "plantilla-jugadora-row__info plantilla-jugadora-row__info--clickable",
        onClick: () => onOpenFicha(jugadora.id),
        title: `Ver ficha de ${jugadora.nombre}`,
        "aria-label": `Ver ficha de ${jugadora.nombre}`,
      }
    : { className: "plantilla-jugadora-row__info" };

  return (
    <div className="plantilla-jugadora-row" style={{ background: surface, borderLeftColor: accent }}>
      <InfoTag {...infoProps}>
        <div
          className={`plantilla-jugadora-row__dorsal${esJugador ? "" : " plantilla-jugadora-row__dorsal--rol"}`}
          style={{ color: accent }}
        >
          {marca}
        </div>
        <div className="plantilla-jugadora-row__name-block">
          <span className="plantilla-jugadora-row__name" style={{ color: text }}>{jugadora.nombre}</span>
          {esJugador ? (
            jugadora.apodo?.trim() ? (
              <span className="plantilla-jugadora-row__apodo" style={{ color: textSecondary }}>"{jugadora.apodo}"</span>
            ) : null
          ) : (
            <span className="plantilla-jugadora-row__meta" style={{ color: textSecondary }}>
              {etiquetaRolPlantilla(jugadora.rolPlantilla)}
              {jugadora.apodo?.trim() ? ` · "${jugadora.apodo}"` : ""}
            </span>
          )}
        </div>
      </InfoTag>
      <div className="plantilla-jugadora-row__actions">
        {!readOnly && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
