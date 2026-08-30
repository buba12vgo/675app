import {
  SEXTOS_PARTIDO,
  SEXTOS_LABELS,
  estaEnSexto,
  etiquetaJugadoraPlanificacion,
} from "../lib/planificacionSextos.js";

export function PlanificacionSextosPanel({
  jugadorasConvocadas,
  planificacionSextos,
  onToggleSexto,
  labels,
  inputBorder,
  textMuted,
  cardBgElevated,
}) {
  const columnaJugadora = labels?.statsColumnaJugador || labels?.jugador || "Jugadora";

  return (
    <div
      className="planificacion-panel"
      style={{
        background: cardBgElevated,
        border: `1px solid ${inputBorder}`,
      }}
    >
      <div className="planificacion-panel__title">Planificación de sextos</div>
      {jugadorasConvocadas.length === 0 ? (
        <p className="planificacion-panel__empty" style={{ color: textMuted }}>
          Marca la convocatoria para ver aquí a {labels?.jugadores?.toLowerCase() || "las jugadoras"} y asignarles sextos.
        </p>
      ) : (
        <div className="planificacion-table-wrap">
          <table className="planificacion-table">
            <thead>
              <tr>
                <th scope="col" className="planificacion-table__player-col">
                  {columnaJugadora}
                </th>
                {SEXTOS_LABELS.map((label, i) => (
                  <th key={SEXTOS_PARTIDO[i]} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jugadorasConvocadas.map((j) => (
                <tr key={j.id}>
                  <th scope="row" className="planificacion-table__player">
                    {etiquetaJugadoraPlanificacion(j)}
                  </th>
                  {SEXTOS_PARTIDO.map((sexto) => {
                    const marcado = estaEnSexto(planificacionSextos, j.id, sexto);
                    return (
                      <td key={sexto}>
                        <button
                          type="button"
                          className={`planificacion-cell${marcado ? " planificacion-cell--on" : ""}`}
                          aria-pressed={marcado}
                          aria-label={`${etiquetaJugadoraPlanificacion(j)}, ${SEXTOS_LABELS[sexto - 1]}`}
                          onClick={() => onToggleSexto(j.id, sexto)}
                        >
                          {marcado ? "X" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
