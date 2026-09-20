import {
  filtrarSesionesPorPeriodo,
  normalizarTipoSesion,
  TIPO_SESION_ENTRENO,
  TIPO_SESION_FISICO,
  TIPO_SESION_PARTIDO,
} from "./appUtils.js";
import { MOTIVO_DOBLAJE } from "./motivosAusencia.js";
import { resultadoPartidoEstado } from "./partidoResultado.js";
import { esJugadorPlantilla } from "./plantillaRoles.js";

function emptyKpis(equipoId = "") {
  return {
    equipoId,
    jugadoras: 0,
    staff: 0,
    entrenos: 0,
    partidos: 0,
    fisicos: 0,
    sesiones: 0,
    presentes: 0,
    ausencias: 0,
    absentismoPct: null,
    asistenciaPct: null,
    victorias: 0,
    empates: 0,
    derrotas: 0,
    partidosConResultado: 0,
    notaSuma: 0,
    notaCount: 0,
    notaMedia: null,
    ultimaFecha: "",
  };
}

export function porcentajeAbsentismo(presentes, ausencias) {
  const total = (presentes || 0) + (ausencias || 0);
  if (!total) return null;
  return Math.round(((ausencias || 0) / total) * 100);
}

export function formatearPct(valor) {
  return valor == null ? "—" : `${valor}%`;
}

export function formatearNota(valor) {
  return typeof valor === "number" ? valor.toFixed(1) : "—";
}

export function balancePartidos(kpis) {
  if (!kpis?.partidosConResultado) return "—";
  return `${kpis.victorias}-${kpis.derrotas}`;
}

function registrarAsistencia(sesion, jugadorIds, acc) {
  const tipo = normalizarTipoSesion(sesion);
  if (tipo === TIPO_SESION_PARTIDO) return;
  const asist = sesion?.asistencias || {};
  const motivos = sesion?.motivosAusencia || {};
  const notas = sesion?.valoraciones || {};
  Object.entries(asist).forEach(([id, presente]) => {
    if (!jugadorIds.has(id)) return;
    if (presente) {
      acc.presentes += 1;
      const nota = notas[id];
      if (typeof nota === "number" && nota >= 1 && nota <= 5) {
        acc.notaSuma += nota;
        acc.notaCount += 1;
      }
      return;
    }
    if (motivos[id] === MOTIVO_DOBLAJE) return;
    acc.ausencias += 1;
  });
}

export function calcularKpisEquipo({ equipo, jugadoras = [], sesiones = [], periodo = "todo", desde = "", hasta = "" }) {
  const equipoId = equipo?.id || "";
  const plantilla = (jugadoras || []).filter((j) => j.equipoId === equipoId);
  const jugadores = plantilla.filter(esJugadorPlantilla);
  const jugadorIds = new Set(jugadores.map((j) => j.id));
  const delEquipo = (sesiones || []).filter((s) => s.equipoId === equipoId);
  const filtradas = filtrarSesionesPorPeriodo(delEquipo, periodo, desde, hasta);
  const acc = emptyKpis(equipoId);
  acc.jugadoras = jugadores.length;
  acc.staff = plantilla.length - jugadores.length;

  filtradas.forEach((sesion) => {
    const tipo = normalizarTipoSesion(sesion);
    if (tipo === TIPO_SESION_PARTIDO) acc.partidos += 1;
    else if (tipo === TIPO_SESION_FISICO) acc.fisicos += 1;
    else acc.entrenos += 1;
    if (sesion.fecha && sesion.fecha > acc.ultimaFecha) acc.ultimaFecha = sesion.fecha;
    registrarAsistencia(sesion, jugadorIds, acc);
    if (tipo === TIPO_SESION_PARTIDO) {
      const estado = resultadoPartidoEstado(sesion.puntosFavor, sesion.puntosContra);
      if (estado === "victoria") acc.victorias += 1;
      else if (estado === "empate") acc.empates += 1;
      else if (estado === "derrota") acc.derrotas += 1;
    }
  });

  acc.sesiones = acc.entrenos + acc.partidos + acc.fisicos;
  acc.partidosConResultado = acc.victorias + acc.derrotas;
  acc.absentismoPct = porcentajeAbsentismo(acc.presentes, acc.ausencias);
  acc.asistenciaPct = acc.absentismoPct == null ? null : 100 - acc.absentismoPct;
  acc.notaMedia = acc.notaCount > 0 ? acc.notaSuma / acc.notaCount : null;
  return acc;
}

export function calcularKpisEquipos({ equipos = [], jugadoras = [], sesiones = [], periodo = "todo", desde = "", hasta = "" }) {
  return (equipos || []).map((equipo) => ({
    equipo,
    kpis: calcularKpisEquipo({ equipo, jugadoras, sesiones, periodo, desde, hasta }),
  }));
}

export function agregarKpis(filas) {
  const acc = emptyKpis("total");
  (filas || []).forEach(({ kpis }) => {
    if (!kpis) return;
    acc.jugadoras += kpis.jugadoras || 0;
    acc.staff += kpis.staff || 0;
    acc.entrenos += kpis.entrenos || 0;
    acc.partidos += kpis.partidos || 0;
    acc.fisicos += kpis.fisicos || 0;
    acc.sesiones += kpis.sesiones || 0;
    acc.presentes += kpis.presentes || 0;
    acc.ausencias += kpis.ausencias || 0;
    acc.victorias += kpis.victorias || 0;
    acc.empates += kpis.empates || 0;
    acc.derrotas += kpis.derrotas || 0;
    acc.notaSuma += kpis.notaSuma || 0;
    acc.notaCount += kpis.notaCount || 0;
    if (kpis.ultimaFecha && kpis.ultimaFecha > acc.ultimaFecha) acc.ultimaFecha = kpis.ultimaFecha;
  });
  acc.partidosConResultado = acc.victorias + acc.derrotas;
  acc.absentismoPct = porcentajeAbsentismo(acc.presentes, acc.ausencias);
  acc.asistenciaPct = acc.absentismoPct == null ? null : 100 - acc.absentismoPct;
  acc.notaMedia = acc.notaCount > 0 ? acc.notaSuma / acc.notaCount : null;
  return acc;
}
