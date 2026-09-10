/**
 * Formato:
 * - Nuevo: ejercicios separados por línea en blanco (\n\n). Así un ejercicio puede tener varias líneas.
 * - Antiguo: una línea = un ejercicio (sin líneas en blanco).
 */
export function parseEjerciciosLista(texto) {
  if (typeof texto !== "string" || !texto.trim()) return [];
  const normalized = texto.replace(/\r\n/g, "\n");
  if (/\n\s*\n/.test(normalized)) {
    return normalized
      .split(/\n\s*\n/)
      .map((bloque) => bloque.replace(/^\s+|\s+$/g, ""))
      .filter(Boolean);
  }
  return normalized
    .split("\n")
    .map((linea) => linea.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export function serializeEjerciciosLista(items) {
  const list = (Array.isArray(items) ? items : [])
    .map((item) => (typeof item === "string" ? item.replace(/^\s+|\s+$/g, "") : ""))
    .filter(Boolean);
  return list.join("\n\n");
}

export function moverEjercicio(items, fromIndex, toIndex) {
  const list = [...(items || [])];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  return list;
}
