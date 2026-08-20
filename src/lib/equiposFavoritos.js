export const MAX_EQUIPOS_FAVORITOS = 2;

export function normalizeEquiposFavoritos(value) {
  if (!Array.isArray(value)) return [];
  const ids = [];
  for (const id of value) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed || ids.includes(trimmed)) continue;
    ids.push(trimmed);
    if (ids.length >= MAX_EQUIPOS_FAVORITOS) break;
  }
  return ids;
}

export function isEquipoFavorito(value, equipoId) {
  return normalizeEquiposFavoritos(value).includes(equipoId);
}

export function toggleEquipoFavorito(value, equipoId) {
  const ids = normalizeEquiposFavoritos(value);
  if (!equipoId) return ids;
  if (ids.includes(equipoId)) return ids.filter((id) => id !== equipoId);
  if (ids.length >= MAX_EQUIPOS_FAVORITOS) return ids;
  return [...ids, equipoId];
}

export function equiposFavoritosLlenos(value) {
  return normalizeEquiposFavoritos(value).length >= MAX_EQUIPOS_FAVORITOS;
}

export function filterEquiposPorFavoritos(equipos, value, { mostrarTodos } = {}) {
  const lista = Array.isArray(equipos) ? equipos : [];
  const ids = normalizeEquiposFavoritos(value);
  if (mostrarTodos || ids.length === 0) return lista;
  return ids
    .map((id) => lista.find((equipo) => equipo.id === id))
    .filter(Boolean);
}
