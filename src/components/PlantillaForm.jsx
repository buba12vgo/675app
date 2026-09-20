import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";
import { RolPlantillaPicker } from "./RolPlantillaPicker.jsx";
import {
  ROL_PLANTILLA_JUGADOR,
  etiquetaRolPlantilla,
  esJugadorPlantilla,
} from "../lib/plantillaRoles.js";

export function PlantillaForm({
  handleAddJugadora,
  jugadoraNombre,
  setJugadoraNombre,
  jugadoraDorsal,
  setJugadoraDorsal,
  jugadoraApodo,
  setJugadoraApodo,
  jugadoraRol = ROL_PLANTILLA_JUGADOR,
  setJugadoraRol,
  addJugadoraLoading,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  const esJugador = esJugadorPlantilla({ rolPlantilla: jugadoraRol });
  const puedeGuardar =
    jugadoraNombre.trim() && (!esJugador || jugadoraDorsal.trim());

  return (
    <form
      onSubmit={handleAddJugadora}
      className="tactical-card plantilla-form"
      autoComplete="off"
    >
      <RolPlantillaPicker
        value={jugadoraRol}
        onChange={(rol) => {
          setJugadoraRol(rol);
          if (!esJugadorPlantilla({ rolPlantilla: rol })) setJugadoraDorsal("");
        }}
        disabled={addJugadoraLoading}
      />
      <div className="plantilla-form-row plantilla-form-row--inputs">
        <input
          type="text"
          placeholder="Nombre"
          value={jugadoraNombre}
          onChange={(e) => setJugadoraNombre(e.target.value)}
          required
        />
        {esJugador ? (
          <input
            type="number"
            placeholder="Dorsal"
            value={jugadoraDorsal}
            onChange={(e) => setJugadoraDorsal(e.target.value.replace(/^0+/, ""))}
            min={1}
            required
            style={{ width: 64, flex: "0 0 64px" }}
          />
        ) : null}
        <input
          type="text"
          placeholder="Apodo"
          value={jugadoraApodo}
          onChange={(e) => setJugadoraApodo(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn-primary"
        disabled={addJugadoraLoading || !puedeGuardar}
        tabIndex={0}
      >
        {esJugador ? playerLabels.anadirJugador : `Añadir ${etiquetaRolPlantilla(jugadoraRol).toLowerCase()}`}
      </button>
    </form>
  );
}
