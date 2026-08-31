import { useState } from "react";
import { EquiposListaContainer } from "../components/EquiposListaContainer.jsx";
import {
  MAX_EQUIPOS_FAVORITOS,
  normalizeEquiposFavoritos,
  filterEquiposPorFavoritos,
} from "../lib/equiposFavoritos.js";

export function EntrenadorEquiposView({
  equiposListaProps,
  clubNombre,
  text,
  textMuted,
  accent,
  equiposFavoritos,
  forzarTodos = false,
}) {
  const [verTodos, setVerTodos] = useState(false);
  const favoritosIds = forzarTodos ? [] : normalizeEquiposFavoritos(equiposFavoritos);
  const hayFavoritos = favoritosIds.length > 0;
  const mostrarTodos = forzarTodos || verTodos || !hayFavoritos;
  const equiposFiltrados = filterEquiposPorFavoritos(equiposListaProps.equipos, favoritosIds, {
    mostrarTodos,
  });

  return (
    <div style={{ width: "100%" }}>
      {!forzarTodos && hayFavoritos ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setVerTodos((prev) => !prev)}
            style={{
              background: "transparent",
              color: accent,
              border: `1px solid ${accent}55`,
              borderRadius: 999,
              padding: "8px 14px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {verTodos ? "Ver solo favoritos" : "Ver todos los equipos del club"}
          </button>
        </div>
      ) : !forzarTodos ? (
        <p
          style={{
            color: textMuted,
            textAlign: "center",
            fontSize: 13,
            margin: "0 16px 8px",
            lineHeight: 1.45,
          }}
        >
          Marca la estrella en hasta {MAX_EQUIPOS_FAVORITOS} equipos para verlos al entrar. El resto sigue en «todos
          los equipos».
        </p>
      ) : (
        <p
          style={{
            color: textMuted,
            textAlign: "center",
            fontSize: 13,
            margin: "0 16px 8px",
            lineHeight: 1.45,
          }}
        >
          Como preparador físico tienes acceso a todos los equipos del club.
        </p>
      )}
      <EquiposListaContainer
        {...equiposListaProps}
        equipos={equiposFiltrados}
        titulo={
          <>
            {hayFavoritos && !verTodos && !forzarTodos ? "Tus equipos" : "Equipos del Club:"}{" "}
            <span style={{ color: text }}>{clubNombre}</span>
          </>
        }
        mostrarClub={false}
        permitirCrear={false}
        canFavorite={!forzarTodos}
        favoritosIds={favoritosIds}
      />
      {hayFavoritos && !verTodos && !forzarTodos && equiposFiltrados.length === 0 ? (
        <p style={{ color: textMuted, textAlign: "center", fontSize: 14 }}>
          Ninguno de tus favoritos está ya en el club. Pulsa «Ver todos los equipos del club».
        </p>
      ) : null}
    </div>
  );
}
