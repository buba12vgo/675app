import {
  MOTIVO_JUSTIFICADA,
  MOTIVO_SALUD,
  MOTIVO_DOBLAJE,
  MOTIVO_NO_CONVOCADO,
  MOTIVO_LESIONADO,
  MOTIVO_AUSENCIA_DEFAULT,
} from "./motivosAusencia.js";
import { claveDorsal, esStaffPlantilla } from "./plantillaRoles.js";


const ROL_LABELS = {
  superadmin: "Superadmin",
  coordinador: "Coordinador",
  entrenador: "Entrenador",
  preparador_fisico: "Preparador físico",
};

export const TIPO_SESION_ENTRENO = "entreno";
export const TIPO_SESION_PARTIDO = "partido";
export const TIPO_SESION_FISICO = "fisico";

export function formatRolLabel(rol) {
  if (!rol) return "N/A";
  return ROL_LABELS[rol] || rol.charAt(0).toUpperCase() + rol.slice(1);
}

export function isCoordinador(rol) {
  return rol === "coordinador";
}

export function isPreparadorFisico(rol) {
  return rol === "preparador_fisico";
}

export function isClubStaff(rol) {
  return rol === "entrenador" || rol === "coordinador" || rol === "preparador_fisico";
}

export function canManageEquipo(rol, userClubId, equipoClubId) {
  if (rol === "superadmin") return true;
  return isCoordinador(rol) && Boolean(userClubId) && userClubId === equipoClubId;
}

export function canManagePlantilla(rol) {
  return rol === "superadmin" || rol === "coordinador" || rol === "entrenador";
}

export function canCreateTipoSesion(rol, tipo) {
  const t = normalizarTipoSesion({ tipo });
  if (rol === "superadmin" || rol === "coordinador" || rol === "entrenador") return true;
  if (isPreparadorFisico(rol)) return t === TIPO_SESION_FISICO;
  return false;
}

export function canEditSesion(rol, sesion) {
  const t = normalizarTipoSesion(sesion);
  if (rol === "superadmin" || rol === "coordinador" || rol === "entrenador") return true;
  if (isPreparadorFisico(rol)) return t === TIPO_SESION_FISICO;
  return false;
}

export function etiquetaTipoSesion(tipo) {
  const t = normalizarTipoSesion({ tipo });
  if (t === TIPO_SESION_PARTIDO) return "Partido";
  if (t === TIPO_SESION_FISICO) return "Físico";
  return "Entreno";
}

export function buildSesionDocId(equipoId, fecha, tipo, uniqueKey = null) {
  const base = `${equipoId}_${fecha}_${normalizarTipoSesion({ tipo })}`;
  return uniqueKey ? `${base}_${uniqueKey}` : base;
}

/** Partidos pueden repetirse el mismo día → ID único. Entreno/físico siguen siendo 1/día. */
export function uniqueSessionKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 10);
  }
  return `${Date.now().toString(36)}x`;
}

export function createSesionDocId(equipoId, fecha, tipo) {
  const t = normalizarTipoSesion({ tipo });
  if (t === TIPO_SESION_PARTIDO) {
    return buildSesionDocId(equipoId, fecha, t, uniqueSessionKey());
  }
  return buildSesionDocId(equipoId, fecha, t);
}

export function sesionesDelDia(sesiones, fecha) {
  return (sesiones || [])
    .filter((s) => s.fecha === fecha)
    .sort((a, b) => normalizarTipoSesion(a).localeCompare(normalizarTipoSesion(b)));
}

export function diaTieneTipo(sesiones, fecha, tipo) {
  const t = normalizarTipoSesion({ tipo });
  return sesionesDelDia(sesiones, fecha).some((s) => normalizarTipoSesion(s) === t);
}

export function diaTieneSesionTactica(sesiones, fecha) {
  return sesionesDelDia(sesiones, fecha).some((s) => {
    const t = normalizarTipoSesion(s);
    return t === TIPO_SESION_ENTRENO || t === TIPO_SESION_PARTIDO;
  });
}

export function diaTieneEntreno(sesiones, fecha) {
  return diaTieneTipo(sesiones, fecha, TIPO_SESION_ENTRENO);
}

export function getDevicePreviewFromWidth(width) {
  if (width >= 1024) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

export function dorsalEstaOcupado(jugadoras, dorsal, exceptId = null) {
  const clave = claveDorsal(dorsal);
  if (!clave) return false;
  return (jugadoras || []).some((j) => {
    if (j.id === exceptId) return false;
    if (esStaffPlantilla(j)) return false;
    if (j.dorsal == null || j.dorsal === "") return false;
    return claveDorsal(j.dorsal) === clave;
  });
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
  const tipo = typeof sesion === "string" ? sesion : sesion?.tipo;
  if (tipo === TIPO_SESION_PARTIDO) return TIPO_SESION_PARTIDO;
  if (tipo === TIPO_SESION_FISICO) return TIPO_SESION_FISICO;
  return TIPO_SESION_ENTRENO;
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

  const proximoEntreno = futuras.find((s) => normalizarTipoSesion(s) === TIPO_SESION_ENTRENO) || null;
  const proximoPartido = futuras.find((s) => normalizarTipoSesion(s) === TIPO_SESION_PARTIDO) || null;
  const proximoFisico = futuras.find((s) => normalizarTipoSesion(s) === TIPO_SESION_FISICO) || null;

  return { proximoEntreno, proximoPartido, proximoFisico, hoyStr, mananaStr };
}

export function sugerirFechaLibre(sesiones, segundo = null, tercero = undefined, maxDiasArg = 30) {
  let tipoDeseado = null;
  let desde = new Date();
  let maxDias = 30;
  if (segundo instanceof Date) {
    desde = segundo;
    if (typeof tercero === "number") maxDias = tercero;
  } else {
    tipoDeseado = segundo;
    if (tercero instanceof Date) {
      desde = tercero;
      maxDias = maxDiasArg;
    } else if (typeof tercero === "number") {
      maxDias = tercero;
    }
  }
  const tipo = tipoDeseado ? normalizarTipoSesion({ tipo: tipoDeseado }) : null;
  const start = new Date(desde);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxDias; i += 1) {
    const dia = new Date(start);
    dia.setDate(start.getDate() + i);
    const ymd = formatDateYYYYMMDD(dia);
    if (!tipo) {
      if (!sesionesDelDia(sesiones, ymd).length) return ymd;
      continue;
    }
    if (tipo === TIPO_SESION_FISICO) {
      if (!diaTieneTipo(sesiones, ymd, TIPO_SESION_FISICO)) return ymd;
      continue;
    }
    if (tipo === TIPO_SESION_PARTIDO) {
      // Varios partidos el mismo día están permitidos; solo se evita chocar con un entreno.
      if (!diaTieneTipo(sesiones, ymd, TIPO_SESION_ENTRENO)) return ymd;
      continue;
    }
    if (!diaTieneSesionTactica(sesiones, ymd)) return ymd;
  }
  const fallback = new Date(start);
  fallback.setDate(start.getDate() + maxDias);
  return formatDateYYYYMMDD(fallback);
}

export function getMetricasEvento(sesion, plantilla = []) {
  const asist = sesion?.asistencias || {};
  const staffIds = new Set((plantilla || []).filter(esStaffPlantilla).map((p) => p.id));
  const entries = Object.entries(asist).filter(([id]) => !staffIds.has(id));
  const total = entries.length;
  const confirmadas = entries.filter(([, presente]) => presente === true).length;
  return { confirmadas, total };
}

/**
 * Ventana de sesiones del equipo. null = historial entero (estadísticas «Todo»).
 * Cubre el mes del calendario, los próximos 120 días y el periodo de estadísticas.
 */
export function rangoConsultaSesiones({
  mes,
  anio,
  tab,
  periodo,
  desde,
  hasta,
  hoy = new Date(),
}) {
  if (tab === "estadisticas" && periodo === "todo") return null;

  const fechas = [];
  const calStart = new Date(anio, mes, 1);
  calStart.setDate(calStart.getDate() - 7);
  const calEnd = new Date(anio, mes + 1, 0);
  calEnd.setDate(calEnd.getDate() + 7);
  fechas.push(formatDateYYYYMMDD(calStart), formatDateYYYYMMDD(calEnd));

  const futuro = new Date(hoy);
  futuro.setDate(futuro.getDate() + 120);
  fechas.push(formatDateYYYYMMDD(hoy), formatDateYYYYMMDD(futuro));

  if (tab === "estadisticas" && periodo && periodo !== "todo") {
    const { inicio, fin } = getRangoFechasEstadisticas(periodo, desde, hasta);
    if (inicio && fin) fechas.push(inicio, fin);
  }

  const ordered = [...fechas].sort();
  return { inicio: ordered[0], fin: ordered[ordered.length - 1] };
}

export function getRangoFechasEstadisticas(periodo, desde, hasta) {
  if (periodo === "todo") return { inicio: "", fin: "" };
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
  const lista = sesiones || [];
  if (periodo === "todo") return lista;
  const { inicio, fin } = getRangoFechasEstadisticas(periodo, desde, hasta);
  if (!inicio || !fin) return [];
  return lista.filter((s) => s.fecha >= inicio && s.fecha <= fin);
}

export function calcularStatsPorLista(jugadoraId, sesiones) {
  let total = 0;
  let presentes = 0;
  let ausencias = 0;
  let justificada = 0;
  let noJustificada = 0;
  let salud = 0;
  let doblaje = 0;
  let noConvocado = 0;
  let lesionado = 0;
  let sumaNotas = 0;
  let countNotas = 0;
  sesiones.forEach((s) => {
    const asist = s.asistencias || {};
    if (typeof asist[jugadoraId] === "undefined") return;
    total += 1;
    if (asist[jugadoraId] === false) {
      const motivo = (s.motivosAusencia || {})[jugadoraId] || MOTIVO_AUSENCIA_DEFAULT;
      const esPartido = normalizarTipoSesion(s) === TIPO_SESION_PARTIDO;

      // En partidos: solo no convocado / lesionado (legacy se remapea).
      if (esPartido) {
        ausencias += 1;
        if (motivo === MOTIVO_LESIONADO || motivo === MOTIVO_SALUD) lesionado += 1;
        else noConvocado += 1;
        return;
      }

      if (motivo === MOTIVO_DOBLAJE) {
        doblaje += 1;
        return;
      }
      ausencias += 1;
      if (motivo === MOTIVO_JUSTIFICADA) justificada += 1;
      else if (motivo === MOTIVO_SALUD) salud += 1;
      else if (motivo === MOTIVO_LESIONADO) lesionado += 1;
      else if (motivo === MOTIVO_NO_CONVOCADO) noConvocado += 1;
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
    total,
    presentes,
    ausencias,
    justificada,
    noJustificada,
    salud,
    doblaje,
    noConvocado,
    lesionado,
    notaMedia: countNotas > 0 ? sumaNotas / countNotas : null,
    notasCount: countNotas,
  };
}

export function combinarStatsJugadora(...listas) {
  const partes = listas.filter(Boolean);
  if (!partes.length) {
    return {
      total: 0,
      presentes: 0,
      ausencias: 0,
      justificada: 0,
      noJustificada: 0,
      salud: 0,
      doblaje: 0,
      noConvocado: 0,
      lesionado: 0,
      notaMedia: null,
      notasCount: 0,
    };
  }
  const notasCount = partes.reduce((acc, p) => acc + (p.notasCount || 0), 0);
  const sumaNotas = partes.reduce(
    (acc, p) => acc + (p.notaMedia || 0) * (p.notasCount || 0),
    0
  );
  return {
    total: partes.reduce((acc, p) => acc + (p.total || 0), 0),
    presentes: partes.reduce((acc, p) => acc + (p.presentes || 0), 0),
    ausencias: partes.reduce((acc, p) => acc + (p.ausencias || 0), 0),
    justificada: partes.reduce((acc, p) => acc + (p.justificada || 0), 0),
    noJustificada: partes.reduce((acc, p) => acc + (p.noJustificada || 0), 0),
    salud: partes.reduce((acc, p) => acc + (p.salud || 0), 0),
    doblaje: partes.reduce((acc, p) => acc + (p.doblaje || 0), 0),
    noConvocado: partes.reduce((acc, p) => acc + (p.noConvocado || 0), 0),
    lesionado: partes.reduce((acc, p) => acc + (p.lesionado || 0), 0),
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
  const entrenos = sesiones.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_ENTRENO);
  const partidos = sesiones.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_PARTIDO);
  const fisicos = sesiones.filter((s) => normalizarTipoSesion(s) === TIPO_SESION_FISICO);
  return jugadoras.map((j) => ({
    jugadora: j,
    entrenos: calcularStatsPorLista(j.id, entrenos),
    partidos: calcularStatsPorLista(j.id, partidos),
    fisicos: calcularStatsPorLista(j.id, fisicos),
  }));
}
