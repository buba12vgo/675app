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
  accent: _accent,
  accentShadow: _accentShadow,
  inputBorder,
  inputBg,
  surface,
  text,
  labels,
}) {
  const playerLabels = labels || getEquipoLabels(GENERO_FEMENINO);
  return (
    <form
      onSubmit={handleAddJugadora}
      style={{
        background: surface,
        padding: "18px 24px",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        border: `1px solid ${inputBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width: "100%",
        maxWidth: 560
      }}
      autoComplete="off"
    >
      <div className="plantilla-form-row plantilla-form-row--inputs">
        <input
          type="text"
          placeholder="Nombre"
          value={jugadoraNombre}
          onChange={e => setJugadoraNombre(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
        />
        <input
          type="number"
          placeholder="Dorsal"
          value={jugadoraDorsal}
          onChange={e => setJugadoraDorsal(e.target.value.replace(/^0+/, ""))}
          min={1}
          required
          style={{
            width: 64,
            padding: "10px 10px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500
          }}
        />
        <input
          type="text"
          placeholder="Apodo"
          value={jugadoraApodo}
          onChange={e => setJugadoraApodo(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 13px",
            fontSize: 16.5,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            minWidth: 0
          }}
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
