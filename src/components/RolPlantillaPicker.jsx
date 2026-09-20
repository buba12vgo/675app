import { ROLES_PLANTILLA } from "../lib/plantillaRoles.js";

export function RolPlantillaPicker({ value, onChange, disabled = false }) {
  return (
    <div className="chip-row plantilla-roles" role="radiogroup" aria-label="Rol en el equipo">
      {ROLES_PLANTILLA.map((op) => {
        const activo = value === op.value;
        return (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={activo}
            className={`chip${activo ? " chip--active" : ""}`}
            onClick={() => !disabled && onChange(op.value)}
            disabled={disabled}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
