import { getEquipoLabels, GENERO_FEMENINO } from "../lib/appUtils.js";

export function PlantillaForm({
  handleAddJugadora,
  jugadoraNombre,
  setJugadoraNombre,
  jugadoraDorsal,
  setJugadoraDorsal,
  jugadoraApodo,
  setJugadoraApodo,
  addJugadoraLoading,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  return (
    <form
      onSubmit={handleAddJugadora}
      className="tactical-card plantilla-form"
      autoComplete="off"
    >
      <div className="plantilla-form-row plantilla-form-row--inputs">
        <input
          type="text"
          placeholder="Nombre"
          value={jugadoraNombre}
          onChange={(e) => setJugadoraNombre(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Dorsal"
          value={jugadoraDorsal}
          onChange={(e) => setJugadoraDorsal(e.target.value.replace(/^0+/, ""))}
          min={1}
          required
          style={{ width: 64, flex: "0 0 64px" }}
        />
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
        disabled={addJugadoraLoading || !jugadoraNombre.trim() || !jugadoraDorsal.trim()}
        tabIndex={0}
      >
        {playerLabels.anadirJugador}
      </button>
    </form>
  );
}
