export const SEXTOS_PARTIDO = [1, 2, 3, 4, 5, 6];
export const SEXTOS_LABELS = ["1º", "2º", "3º", "4º", "5º", "6º"];

function esSextoValido(n) {
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

export function normalizeSextosJugadora(val) {
  const set = new Set();
  if (Array.isArray(val)) {
    const booleans = val.length === 6 && val.every((v) => typeof v === "boolean");
    if (booleans) {
      val.forEach((on, i) => {
        if (on) set.add(i + 1);
      });
    } else {
      val.forEach((v) => {
        const n = Number(v);
        if (esSextoValido(n)) set.add(n);
      });
    }
  } else if (val && typeof val === "object") {
    Object.entries(val).forEach(([key, on]) => {
      if (!on) return;
      const n = Number(key);
      if (esSextoValido(n)) set.add(n);
    });
  }
  return SEXTOS_PARTIDO.filter((n) => set.has(n));
}

export function normalizePlanificacionSextos(raw) {
  const out = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  Object.entries(raw).forEach(([id, val]) => {
    if (!id) return;
    const sextos = normalizeSextosJugadora(val);
    if (sextos.length) out[id] = sextos;
  });
  return out;
}

export function estaEnSexto(planificacion, jugadoraId, sexto) {
  return (planificacion?.[jugadoraId] || []).includes(sexto);
}

export function toggleSexto(planificacion, jugadoraId, sexto) {
  if (!esSextoValido(sexto) || !jugadoraId) return planificacion || {};
  const actual = new Set(planificacion?.[jugadoraId] || []);
  if (actual.has(sexto)) actual.delete(sexto);
  else actual.add(sexto);
  const next = { ...(planificacion || {}) };
  const sextos = SEXTOS_PARTIDO.filter((n) => actual.has(n));
  if (sextos.length) next[jugadoraId] = sextos;
  else delete next[jugadoraId];
  return next;
}

export function planificacionParaGuardar(planificacion, idsConvocadas) {
  const ids = new Set(idsConvocadas || []);
  const out = {};
  ids.forEach((id) => {
    const sextos = normalizeSextosJugadora(planificacion?.[id]);
    if (sextos.length) out[id] = sextos;
  });
  return out;
}

function tramosTresSeguidos(sextos) {
  const set = new Set(sextos);
  const tramos = [];
  for (let inicio = 1; inicio <= 4; inicio += 1) {
    if (set.has(inicio) && set.has(inicio + 1) && set.has(inicio + 2)) {
      tramos.push(`${SEXTOS_LABELS[inicio - 1]}-${SEXTOS_LABELS[inicio + 1]}`);
    }
  }
  return tramos;
}

/** Avisos de normativa minibasket: 2 sextos al acabar el 5º, y nunca 3 seguidos. */
export function avisosPlanificacionSextos(jugadoras, planificacion) {
  const lista = jugadoras || [];
  const hayMarca = lista.some((j) => normalizeSextosJugadora(planificacion?.[j.id]).length > 0);
  if (!hayMarca) return [];

  const cortos = [];
  const seguidos = [];
  lista.forEach((j) => {
    const sextos = normalizeSextosJugadora(planificacion?.[j.id]);
    const nombre = etiquetaJugadoraPlanificacion(j) || "Jugador";
    if (sextos.filter((n) => n <= 5).length < 2) cortos.push(nombre);
    tramosTresSeguidos(sextos).forEach((tramo) => {
      seguidos.push(`${nombre} (${tramo})`);
    });
  });

  const avisos = [];
  if (cortos.length) {
    avisos.push(`Al acabar el 5º sexto faltan 2 sextos jugados: ${cortos.join(", ")}.`);
  }
  if (seguidos.length) {
    avisos.push(`Hay 3 sextos seguidos: ${seguidos.join(", ")}.`);
  }
  return avisos;
}

export function etiquetaJugadoraPlanificacion(jugadora) {
  const nombre = String(jugadora?.nombre || "").trim();
  const dorsal = jugadora?.dorsal;
  const dorsalTxt =
    dorsal != null && dorsal !== "" && dorsal !== "—" ? String(dorsal).trim() : "";
  if (nombre && dorsalTxt) return `${dorsalTxt} ${nombre}`;
  return nombre || dorsalTxt;
}

export function esEquipoMinibasket(tipoCanasta, nombreEquipo = "") {
  const tipo = String(tipoCanasta || "").trim().toLowerCase();
  if (
    tipo === "minibasket"
    || tipo === "mini"
    || tipo === "pequena"
    || tipo === "pequeña"
    || tipo.includes("minibasket")
    || tipo.includes("pequeñ")
  ) return true;
  const nombre = String(nombreEquipo || "").trim().toLowerCase();
  if (!nombre) return false;
  return (
    /\bmini\b/.test(nombre)
    || nombre.includes("minibasket")
    || nombre.includes("premini")
    || nombre.includes("alevin")
    || nombre.includes("alevín")
  );
}
