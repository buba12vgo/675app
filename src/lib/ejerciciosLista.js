export function parseEjerciciosLista(texto) {
  if (typeof texto !== "string" || !texto.trim()) return [];
  return texto
    .split(/\r?\n/)
    .map((linea) => linea.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export function serializeEjerciciosLista(items) {
  const lineas = (Array.isArray(items) ? items : [])
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return lineas.join("\n");
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
