import { MOTIVO_JUSTIFICADA, MOTIVO_SALUD, MOTIVO_AUSENCIA_DEFAULT } from "./motivosAusencia.js";

const ROL_LABELS = {
  superadmin: "Superadmin",
  coordinador: "Coordinador",
  entrenador: "Entrenador",
};

export function formatRolLabel(rol) {
  if (!rol) return "N/A";
  return ROL_LABELS[rol] || rol.charAt(0).toUpperCase() + rol.slice(1);
}

export function isCoordinador(rol) {
  return rol === "coordinador";
}

export function isClubStaff(rol) {
  return rol === "entrenador" || rol === "coordinador";
}

export function canManageEquipo(rol, userClubId, equipoClubId) {
  if (rol === "superadmin") return true;
  return isCoordinador(rol) && Boolean(userClubId) && userClubId === equipoClubId;
}

export function getDevicePreviewFromWidth(width) {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export function dorsalEstaOcupado(jugadoras, dorsal, exceptId = null) {
  const n = Number(dorsal);
  if (!Number.isFinite(n)) return false;
  return (jugadoras || []).some((j) => j.id !== exceptId && Number(j.dorsal) === n);
}

export const GENERO_FEMENINO = "femenino";
export const GENERO_MASCULINO = "masculino";
export const TIPO_CANASTA_GRANDE = "grande";
export const TIPO_CANASTA_MINI = "minibasket";

const EQUIPO_LABELS = {
  [GENERO_FEMENINO]: {
    jugador: "Jugadora",
    jugadores: "Jugadoras",
    plantillaTitulo: "Plantilla de Jugadoras",
    anadirJugador: "Añadir Jugadora",
    cargandoJugadores: "Cargando jugadoras...",
    sinJugadoresPlantilla: "Sin jugadoras en plantilla",
    noHayJugadoresPlantilla: "No hay jugadoras en la plantilla.",
    editarJugador: "Editar jugadora",
    eliminarJugador: "Eliminar jugadora",
    errorAnadirJugador: "Error al añadir jugadora.",
    errorEliminarJugador: "No se pudo eliminar la jugadora.",
    errorDorsalDuplicado: "Ese dorsal ya está en uso en este equipo.",
    statsColumnaJugador: "Jugadora",
    fichaTitulo: "Ficha de jugadora",
    seedJugadoresPorEquipo: "10 jugadoras por equipo",
    buscarJugadorClub: "Buscar jugadora de otro equipo del club…",
    anadirDeOtroEquipo: "Añadir de otro equipo del club",
    quitarDeSesion: "Quitar de esta sesión",
    sinResultadosBusqueda: "No hay coincidencias en el club",
  },
  [GENERO_MASCULINO]: {
    jugador: "Jugador",
    jugadores: "Jugadores",
    plantillaTitulo: "Plantilla de Jugadores",
    anadirJugador: "Añadir Jugador",
    cargandoJugadores: "Cargando jugadores...",
    sinJugadoresPlantilla: "Sin jugadores en plantilla",
    noHayJugadoresPlantilla: "No hay jugadores en la plantilla.",
    editarJugador: "Editar jugador",
    eliminarJugador: "Eliminar jugador",
    errorAnadirJugador: "Error al añadir jugador.",
    errorEliminarJugador: "No se pudo eliminar el jugador.",
    errorDorsalDuplicado: "Ese dorsal ya está en uso en este equipo.",
    statsColumnaJugador: "Jugador",
    fichaTitulo: "Ficha de jugador",
    seedJugadoresPorEquipo: "10 jugadores por equipo",
    buscarJugadorClub: "Buscar jugador de otro equipo del club…",
    anadirDeOtroEquipo: "Añadir de otro equipo del club",
    quitarDeSesion: "Quitar de esta sesión",
    sinResultadosBusqueda: "No hay coincidencias en el club",
  },
};

export function normalizeGenero(genero) {
  return genero === GENERO_MASCULINO ? GENERO_MASCULINO : GENERO_FEMENINO;
}

export function normalizeTipoCanasta(tipoCanasta) {
  return tipoCanasta === TIPO_CANASTA_MINI ? TIPO_CANASTA_MINI : TIPO_CANASTA_GRANDE;
}

export function getEquipoLabels(genero) {
  return EQUIPO_LABELS[normalizeGenero(genero)];
}

export function formatTipoCanasta(tipoCanasta) {
  return normalizeTipoCanasta(tipoCanasta) === TIPO_CANASTA_MINI ? "Minibasket" : "Canasta grande";
}

export function formatGeneroEquipo(genero) {
  return normalizeGenero(genero) === GENERO_MASCULINO ? "Masculino" : "Femenino";
}

export function getClubInitials(nombre) {
  return (nombre || "C")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function getCalendarMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let firstWeekday = firstDay.getDay();
  if (firstWeekday === 0) firstWeekday = 7;

  const daysPrev = firstWeekday - 1;
  const daysInMonth = lastDay.getDate();

  let prevMonth = month - 1;
  let prevYear = year;
  if (month === 0) {
    prevMonth = 11;
    prevYear -= 1;
  }
  const prevLastDay = new Date(prevYear, prevMonth + 1, 0);
  const prevLastDate = prevLastDay.getDate();

  const matrix = [];

  for (let d = prevLastDate - daysPrev + 1; d <= prevLastDate; d += 1) {
    matrix.push({ date: new Date(prevYear, prevMonth, d), otherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    matrix.push({ date: new Date(year, month, d), otherMonth: false });
  }

  const restDays = 7 - (matrix.length % 7);
  let nextMonth = month + 1;
  let nextYear = year;
  if (month === 11) {
    nextMonth = 0;
    nextYear += 1;
  }
  if (restDays < 7) {
    for (let d = 1; d <= restDays; d += 1) {
      matrix.push({ date: new Date(nextYear, nextMonth, d), otherMonth: true });
    }
  }

  const semanas = [];
  for (let i = 0; i < matrix.length; i += 7) {
    semanas.push(matrix.slice(i, i + 7));
  }
  return semanas;
}

export const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizarTipoSesion(sesion) {
  return sesion?.tipo === "partido" ? "partido" : "entreno";
}

export function formatearFechaCorta(fechaStr) {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
}

export function etiquetaDiaRelativo(fechaStr, hoyStr, mananaStr) {
  if (fechaStr === hoyStr) return "Hoy";
  if (fechaStr === mananaStr) return "Mañana";
  return formatearFechaCorta(fechaStr);
}

export function getProximosEventosInicio(sesiones, hoy = new Date()) {
  const hoyStr = formatDateYYYYMMDD(hoy);
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  const mananaStr = formatDateYYYYMMDD(manana);

  const futuras = [...sesiones]
    .filter((s) => s.fecha && s.fecha >= hoyStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const proximoEntreno =
    futuras.find(
      (s) => normalizarTipoSesion(s) === "entreno" && (s.fecha === hoyStr || s.fecha === mananaStr)
    ) || null;

  const proximoPartido = futuras.find((s) => normalizarTipoSesion(s) === "partido") || null;

  return { proximoEntreno, proximoPartido, hoyStr, mananaStr };
}

export function sugerirFechaLibre(sesiones, desde = new Date(), maxDias = 30) {
  const ocupadas = new Set(
    sesiones.map((s) => s.fecha).filter(Boolean)
  );
  const start = new Date(desde);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxDias; i += 1) {
    const dia = new Date(start);
    dia.setDate(start.getDate() + i);
    const ymd = formatDateYYYYMMDD(dia);
    if (!ocupadas.has(ymd)) return ymd;
  }
  return formatDateYYYYMMDD(start);
}

export function getMetricasEvento(sesion) {
  const asist = sesion?.asistencias || {};
  const entries = Object.entries(asist);
  const total = entries.length;
  const confirmadas = entries.filter(([, presente]) => presente === true).length;
  return { confirmadas, total };
}

export function getRangoFechasEstadisticas(periodo, desde, hasta) {
  const hoy = new Date();
  if (periodo === "semanal") {
    const day = hoy.getDay();
    const diffToMon = day === 0 ? 6 : day - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diffToMon);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { inicio: formatDateYYYYMMDD(lunes), fin: formatDateYYYYMMDD(domingo) };
  }
  if (periodo === "mensual") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { inicio: formatDateYYYYMMDD(inicio), fin: formatDateYYYYMMDD(hoy) };
  }
  return { inicio: desde || "", fin: hasta || "" };
}

export function filtrarSesionesPorPeriodo(sesiones, periodo, desde, hasta) {
  const { inicio, fin } = getRangoFechasEstadisticas(periodo, desde, hasta);
  if (!inicio || !fin) return sesiones;
  return sesiones.filter((s) => s.fecha >= inicio && s.fecha <= fin);
}

export function calcularStatsPorLista(jugadoraId, sesiones) {
  let presentes = 0;
  let ausencias = 0;
  let justificada = 0;
  let noJustificada = 0;
  let salud = 0;
  let sumaNotas = 0;
  let countNotas = 0;
  sesiones.forEach((s) => {
    const asist = s.asistencias || {};
    if (typeof asist[jugadoraId] === "undefined") return;
    if (asist[jugadoraId] === false) {
      ausencias += 1;
      const motivo = (s.motivosAusencia || {})[jugadoraId] || MOTIVO_AUSENCIA_DEFAULT;
      if (motivo === MOTIVO_JUSTIFICADA) justificada += 1;
      else if (motivo === MOTIVO_SALUD) salud += 1;
      else noJustificada += 1;
      return;
    }
    presentes += 1;
    const nota = (s.valoraciones || {})[jugadoraId];
    if (typeof nota === "number" && nota >= 1 && nota <= 5) {
      sumaNotas += nota;
      countNotas += 1;
    }
  });
  return {
    total: sesiones.length,
    presentes,
    ausencias,
    justificada,
    noJustificada,
    salud,
    notaMedia: countNotas > 0 ? sumaNotas / countNotas : null,
    notasCount: countNotas,
  };
}

export function combinarStatsJugadora(entrenos, partidos) {
  const a = entrenos || {};
  const b = partidos || {};
  const notasCount = (a.notasCount || 0) + (b.notasCount || 0);
  const sumaNotas = (a.notaMedia || 0) * (a.notasCount || 0) + (b.notaMedia || 0) * (b.notasCount || 0);
  return {
    total: (a.total || 0) + (b.total || 0),
    presentes: (a.presentes || 0) + (b.presentes || 0),
    ausencias: (a.ausencias || 0) + (b.ausencias || 0),
    justificada: (a.justificada || 0) + (b.justificada || 0),
    noJustificada: (a.noJustificada || 0) + (b.noJustificada || 0),
    salud: (a.salud || 0) + (b.salud || 0),
    notaMedia: notasCount > 0 ? sumaNotas / notasCount : null,
    notasCount,
  };
}

export function porcentajeAsistencia(stats) {
  const contabilizadas = (stats?.presentes || 0) + (stats?.ausencias || 0);
  if (!contabilizadas) return null;
  return Math.round((stats.presentes / contabilizadas) * 100);
}

export function calcularEstadisticasJugadoras(jugadoras, sesiones) {
  const entrenos = sesiones.filter((s) => normalizarTipoSesion(s) === "entreno");
  const partidos = sesiones.filter((s) => normalizarTipoSesion(s) === "partido");
  return jugadoras.map((j) => ({
    jugadora: j,
    entrenos: calcularStatsPorLista(j.id, entrenos),
    partidos: calcularStatsPorLista(j.id, partidos),
  }));
}
