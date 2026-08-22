export const MOTIVO_JUSTIFICADA = "justificada";
export const MOTIVO_NO_JUSTIFICADA = "no_justificada";
export const MOTIVO_SALUD = "salud";
export const MOTIVO_AUSENCIA_DEFAULT = MOTIVO_NO_JUSTIFICADA;

export const MOTIVOS_AUSENCIA = [
  { id: MOTIVO_JUSTIFICADA, label: "Justificada", short: "Just." },
  { id: MOTIVO_NO_JUSTIFICADA, label: "No justificada", short: "No just." },
  { id: MOTIVO_SALUD, label: "Salud", short: "Salud" },
];

const MOTIVO_IDS = new Set(MOTIVOS_AUSENCIA.map((m) => m.id));

export function normalizeMotivoAusencia(value) {
  return MOTIVO_IDS.has(value) ? value : null;
}

export function normalizeMotivosAusenciaMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const next = {};
  for (const [id, motivo] of Object.entries(value)) {
    const normalized = normalizeMotivoAusencia(motivo);
    if (id && normalized) next[id] = normalized;
  }
  return next;
}

export function motivoAusenciaParaGuardar(asistencias, motivos, ids) {
  const mapa = {};
  ids.forEach((id) => {
    if (asistencias[id]) return;
    mapa[id] = normalizeMotivoAusencia(motivos[id]) || MOTIVO_AUSENCIA_DEFAULT;
  });
  return mapa;
}
