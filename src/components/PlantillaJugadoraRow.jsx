import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";
import { IconGear, IconX } from "./icons.jsx";

export function PlantillaJugadoraRow({
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
