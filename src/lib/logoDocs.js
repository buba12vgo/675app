export function clubLogoDocId(clubId) {
  return `club_${clubId}`;
}

export function equipoLogoDocId(equipoId) {
  return `equipo_${equipoId}`;
}

export function isInlineDataUrl(url) {
  return typeof url === "string" && url.startsWith("data:");
}

export function shortLogoUrl(url) {
  if (!url || isInlineDataUrl(url)) return null;
  return url;
}
