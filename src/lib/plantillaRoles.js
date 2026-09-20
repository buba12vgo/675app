export const ROL_PLANTILLA_JUGADOR = "jugador";
export const ROL_PLANTILLA_ENTRENADOR = "entrenador";
export const ROL_PLANTILLA_AYUDANTE = "ayudante";

const ROLES_STAFF = new Set([ROL_PLANTILLA_ENTRENADOR, ROL_PLANTILLA_AYUDANTE]);

export const ROLES_PLANTILLA = [
  { value: ROL_PLANTILLA_JUGADOR, label: "Jugador/a", marca: "#" },
  { value: ROL_PLANTILLA_ENTRENADOR, label: "Entrenador", marca: "ENT" },
  { value: ROL_PLANTILLA_AYUDANTE, label: "Ayudante", marca: "AYU" },
];

export function normalizeRolPlantilla(rol) {
  if (ROLES_STAFF.has(rol)) return rol;
  return ROL_PLANTILLA_JUGADOR;
}

export function esJugadorPlantilla(persona) {
  return normalizeRolPlantilla(persona?.rolPlantilla) === ROL_PLANTILLA_JUGADOR;
}

export function etiquetaRolPlantilla(rol) {
  const value = normalizeRolPlantilla(rol);
  return ROLES_PLANTILLA.find((item) => item.value === value)?.label || "Jugador/a";
}

export function marcaRolPlantilla(rol) {
  const value = normalizeRolPlantilla(rol);
  return ROLES_PLANTILLA.find((item) => item.value === value)?.marca || "#";
}

export function dorsalParaGuardar(rol, dorsal) {
  if (normalizeRolPlantilla(rol) !== ROL_PLANTILLA_JUGADOR) return null;
  const n = Number(String(dorsal ?? "").trim());
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.round(n);
}

export function ordenarPlantilla(lista) {
  const peso = {
    [ROL_PLANTILLA_ENTRENADOR]: 0,
    [ROL_PLANTILLA_AYUDANTE]: 1,
    [ROL_PLANTILLA_JUGADOR]: 2,
  };
  return [...(lista || [])].sort((a, b) => {
    const ra = normalizeRolPlantilla(a?.rolPlantilla);
    const rb = normalizeRolPlantilla(b?.rolPlantilla);
    if (peso[ra] !== peso[rb]) return peso[ra] - peso[rb];
    if (ra === ROL_PLANTILLA_JUGADOR) {
      return (Number(a?.dorsal) || 0) - (Number(b?.dorsal) || 0);
    }
    return String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es", {
      sensitivity: "base",
    });
  });
}
