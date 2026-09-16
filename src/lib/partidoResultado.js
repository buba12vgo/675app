/** Normaliza un valor de puntos de partido (entero ≥ 0 o null). */
export function normalizePuntosPartido(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function formatearResultadoPartido(puntosFavor, puntosContra) {
  const favor = normalizePuntosPartido(puntosFavor);
  const contra = normalizePuntosPartido(puntosContra);
  if (favor === null || contra === null) return null;
  return `${favor}-${contra}`;
}

/** @returns {"victoria"|"derrota"|"empate"|null} */
export function resultadoPartidoEstado(puntosFavor, puntosContra) {
  const favor = normalizePuntosPartido(puntosFavor);
  const contra = normalizePuntosPartido(puntosContra);
  if (favor === null || contra === null) return null;
  if (favor > contra) return "victoria";
  if (favor < contra) return "derrota";
  return "empate";
}

export function etiquetaResultadoPartido(puntosFavor, puntosContra) {
  const marcador = formatearResultadoPartido(puntosFavor, puntosContra);
  if (!marcador) return null;
  const estado = resultadoPartidoEstado(puntosFavor, puntosContra);
  if (estado === "victoria") return `${marcador} · Victoria`;
  if (estado === "derrota") return `${marcador} · Derrota`;
  return `${marcador} · Empate`;
}

export function etiquetaMarcadorLocal(clubNombre) {
  const nombre = String(clubNombre || "").trim();
  return nombre || "A favor";
}

export function etiquetaMarcadorRival(rival) {
  const nombre = String(rival || "").trim();
  return nombre || "En contra";
}
