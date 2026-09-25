export const MOTIVO_JUSTIFICADA = "justificada";
export const MOTIVO_NO_JUSTIFICADA = "no_justificada";
export const MOTIVO_SALUD = "salud";
export const MOTIVO_DOBLAJE = "doblaje";
export const MOTIVO_NO_CONVOCADO = "no_convocado";
export const MOTIVO_LESIONADO = "lesionado";

export const MOTIVO_AUSENCIA_DEFAULT = MOTIVO_NO_JUSTIFICADA;
export const MOTIVO_PARTIDO_DEFAULT = MOTIVO_NO_CONVOCADO;

/** Motivos de entreno / físico */
export const MOTIVOS_AUSENCIA_ENTRENO = [
  { id: MOTIVO_JUSTIFICADA, label: "Justificada", short: "Just." },
  { id: MOTIVO_NO_JUSTIFICADA, label: "No justificada", short: "No just." },
  { id: MOTIVO_SALUD, label: "Salud", short: "Salud" },
  { id: MOTIVO_DOBLAJE, label: "Doblaje", short: "Dobl." },
];

/** Motivos de partido (labels por género) */
export const MOTIVOS_AUSENCIA_PARTIDO = [
  {
    id: MOTIVO_NO_CONVOCADO,
    labelF: "No convocada",
    labelM: "No convocado",
    labelX: "No convocado/a",
    shortF: "No conv.",
    shortM: "No conv.",
    shortX: "No conv.",
  },
  {
    id: MOTIVO_LESIONADO,
    labelF: "Lesionada",
    labelM: "Lesionado",
    labelX: "Lesionado/a",
    shortF: "Lesion.",
    shortM: "Lesion.",
    shortX: "Lesion.",
  },
];

/** Lista legacy / entreno (compat) */
export const MOTIVOS_AUSENCIA = MOTIVOS_AUSENCIA_ENTRENO;

const MOTIVO_IDS = new Set([
  ...MOTIVOS_AUSENCIA_ENTRENO.map((m) => m.id),
  ...MOTIVOS_AUSENCIA_PARTIDO.map((m) => m.id),
]);

export function esTipoPartido(tipo) {
  return tipo === "partido";
}

export function motivoAusenciaDefaultParaTipo(tipo) {
  return esTipoPartido(tipo) ? MOTIVO_PARTIDO_DEFAULT : MOTIVO_AUSENCIA_DEFAULT;
}

export function motivosAusenciaParaTipo(tipo, genero = "femenino") {
  if (esTipoPartido(tipo)) {
    const etiqueta = genero === "mixto" ? "X" : genero === "masculino" ? "M" : "F";
    return MOTIVOS_AUSENCIA_PARTIDO.map((m) => ({
      id: m.id,
      label: m[`label${etiqueta}`],
      short: m[`short${etiqueta}`],
    }));
  }
  return MOTIVOS_AUSENCIA_ENTRENO;
}

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

export function motivoAusenciaParaGuardar(asistencias, motivos, ids, tipoSesion = null) {
  const fallback = motivoAusenciaDefaultParaTipo(tipoSesion);
  const mapa = {};
  ids.forEach((id) => {
    if (asistencias[id]) return;
    mapa[id] = normalizeMotivoAusencia(motivos[id]) || fallback;
  });
  return mapa;
}
