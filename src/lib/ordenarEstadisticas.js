function valorOrden(row, sortKey, statsKey) {
  if (sortKey === "dorsal") return Number(row.jugadora?.dorsal) || 0;
  if (sortKey === "nombre") return String(row.jugadora?.nombre || "");
  const stats = row[statsKey] || {};
  if (sortKey === "notaMedia") {
    return typeof stats.notaMedia === "number" ? stats.notaMedia : null;
  }
  return Number(stats[sortKey]) || 0;
}

export function ordenarFilasEstadisticas(filas, { sortKey, sortDir, statsKey }) {
  const dir = sortDir === "asc" ? 1 : -1;
  return [...(filas || [])].sort((a, b) => {
    const va = valorOrden(a, sortKey, statsKey);
    const vb = valorOrden(b, sortKey, statsKey);

    if (sortKey === "nombre") {
      const cmp = String(va).localeCompare(String(vb), "es", { sensitivity: "base" });
      if (cmp !== 0) return cmp * dir;
    } else if (va == null && vb == null) {
      // empate
    } else if (va == null) {
      return 1; // sin nota al final
    } else if (vb == null) {
      return -1;
    } else if (va !== vb) {
      return (va - vb) * dir;
    }

    const dorsalCmp = (Number(a.jugadora?.dorsal) || 0) - (Number(b.jugadora?.dorsal) || 0);
    if (dorsalCmp !== 0) return dorsalCmp;
    return String(a.jugadora?.id || "").localeCompare(String(b.jugadora?.id || ""));
  });
}
