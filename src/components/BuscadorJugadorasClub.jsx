import { useMemo, useState } from "react";
import { filtrarJugadorasClub, getEquipoNombre } from "../lib/jugadorasClub.js";

export function BuscadorJugadorasClub({
  jugadorasClub = [],
  equiposClub = [],
  equipoActivoId,
  idsYaEnSesion = [],
  loading,
  onAdd,
  accent,
  inputBorder,
  inputBg,
  text,
  textMuted,
  cardBgElevated,
  labels,
}) {
  const [busqueda, setBusqueda] = useState("");
  const resultados = useMemo(
    () =>
      filtrarJugadorasClub(jugadorasClub, {
        equipoActivoId,
        idsYaEnSesion,
        busqueda,
        equipos: equiposClub,
      }),
    [jugadorasClub, equipoActivoId, idsYaEnSesion, busqueda, equiposClub]
  );

  return (
    <div className="club-player-search">
      <label className="club-player-search__label" style={{ color: textMuted }}>
        {labels.anadirDeOtroEquipo}
      </label>
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder={labels.buscarJugadorClub}
        aria-label={labels.buscarJugadorClub}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 15,
          border: `1px solid ${inputBorder}`,
          borderRadius: 9,
          background: inputBg || cardBgElevated,
          color: text,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      {busqueda.trim() ? (
        <div className="club-player-search__results" style={{ borderColor: inputBorder, background: cardBgElevated }}>
          {loading ? (
            <div className="club-player-search__empty" style={{ color: textMuted }}>
              {labels.cargandoJugadores}
            </div>
          ) : resultados.length === 0 ? (
            <div className="club-player-search__empty" style={{ color: textMuted }}>
              {labels.sinResultadosBusqueda}
            </div>
          ) : (
            resultados.map((jugadora) => (
              <button
                key={jugadora.id}
                type="button"
                className="club-player-search__item"
                onClick={() => {
                  onAdd(jugadora.id);
                  setBusqueda("");
                }}
                style={{ color: text }}
              >
                <span className="club-player-search__dorsal" style={{ color: accent }}>
                  {jugadora.dorsal}
                </span>
                <span className="club-player-search__info">
                  <span className="club-player-search__nombre">{jugadora.nombre}</span>
                  <span className="club-player-search__meta" style={{ color: textMuted }}>
                    {getEquipoNombre(equiposClub, jugadora.equipoId) || "Otro equipo"}
                    {jugadora.apodo?.trim() ? ` · "${jugadora.apodo}"` : ""}
                  </span>
                </span>
                <span className="club-player-search__add" style={{ color: accent }}>
                  Añadir
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
