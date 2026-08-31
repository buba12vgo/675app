export const MAX_EQUIPOS_FAVORITOS = 4;
export const MAX_EQUIPOS_FAVORITOS_PREPARADOR = 10;

export function maxEquiposFavoritosParaRol(rol) {
  return rol === "preparador_fisico" ? MAX_EQUIPOS_FAVORITOS_PREPARADOR : MAX_EQUIPOS_FAVORITOS;
}

export function normalizeEquiposFavoritos(value, max = MAX_EQUIPOS_FAVORITOS) {
  if (!Array.isArray(value)) return [];
  const limit = Math.max(0, Number(max) || MAX_EQUIPOS_FAVORITOS);
  const ids = [];
  for (const id of value) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed || ids.includes(trimmed)) continue;
    ids.push(trimmed);
    if (ids.length >= limit) break;
  }
  return ids;
}

export function isEquipoFavorito(value, equipoId, max = MAX_EQUIPOS_FAVORITOS) {
  return normalizeEquiposFavoritos(value, max).includes(equipoId);
}

export function toggleEquipoFavorito(value, equipoId, max = MAX_EQUIPOS_FAVORITOS) {
  const ids = normalizeEquiposFavoritos(value, max);
  if (!equipoId) return ids;
  if (ids.includes(equipoId)) return ids.filter((id) => id !== equipoId);
  if (ids.length >= max) return ids;
  return [...ids, equipoId];
}

export function equiposFavoritosLlenos(value, max = MAX_EQUIPOS_FAVORITOS) {
  return normalizeEquiposFavoritos(value, max).length >= max;
}

export function filterEquiposPorFavoritos(equipos, value, { mostrarTodos, max = MAX_EQUIPOS_FAVORITOS } = {}) {
  const lista = Array.isArray(equipos) ? equipos : [];
  const ids = normalizeEquiposFavoritos(value, max);
  if (mostrarTodos || ids.length === 0) return lista;
  return ids
    .map((id) => lista.find((equipo) => equipo.id === id))
    .filter(Boolean);
}
