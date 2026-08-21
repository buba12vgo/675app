export function normalizeTextoBusqueda(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeExternasIds(value) {
  if (!Array.isArray(value)) return [];
  const ids = [];
  for (const id of value) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed || ids.includes(trimmed)) continue;
    ids.push(trimmed);
  }
  return ids;
}

export function getEquipoNombre(equipos, equipoId) {
  const equipo = (equipos || []).find((item) => item.id === equipoId);
  return equipo?.nombre || "";
}

export function combinarJugadorasSesion(plantilla, jugadorasClub, externasIds, equipos = []) {
  const plantillaLista = Array.isArray(plantilla) ? plantilla : [];
  const clubLista = Array.isArray(jugadorasClub) ? jugadorasClub : [];
  const byId = new Map();

  plantillaLista.forEach((jugadora) => {
    byId.set(jugadora.id, {
      ...jugadora,
      esExterna: false,
      equipoNombre: getEquipoNombre(equipos, jugadora.equipoId),
    });
  });

  normalizeExternasIds(externasIds).forEach((id) => {
    if (byId.has(id)) return;
    const found = clubLista.find((jugadora) => jugadora.id === id);
    if (found) {
      byId.set(id, {
        ...found,
        esExterna: true,
        equipoNombre: getEquipoNombre(equipos, found.equipoId),
      });
      return;
    }
    byId.set(id, {
      id,
      nombre: "Jugadora de otro equipo",
      dorsal: "—",
      apodo: "",
      esExterna: true,
      ausenteDelClub: true,
      equipoNombre: "",
    });
  });

  return [...byId.values()];
}

export function filtrarJugadorasClub(jugadorasClub, { equipoActivoId, idsYaEnSesion, busqueda, equipos, limite = 8 } = {}) {
  const q = normalizeTextoBusqueda(busqueda);
  if (!q) return [];
  const excluidos = new Set(idsYaEnSesion || []);
  const lista = Array.isArray(jugadorasClub) ? jugadorasClub : [];

  return lista
    .filter((jugadora) => {
      if (!jugadora?.id || jugadora.equipoId === equipoActivoId || excluidos.has(jugadora.id)) return false;
      const equipoNombre = getEquipoNombre(equipos, jugadora.equipoId);
      const haystack = normalizeTextoBusqueda(
        `${jugadora.nombre || ""} ${jugadora.apodo || ""} ${jugadora.dorsal ?? ""} ${equipoNombre}`
      );
      return haystack.includes(q);
    })
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"))
    .slice(0, limite);
}
