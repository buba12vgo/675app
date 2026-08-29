import { describe, it, expect } from "vitest";
import {
  formatRolLabel,
  getClubInitials,
  getCalendarMatrix,
  formatDateYYYYMMDD,
  normalizarTipoSesion,
  formatearFechaCorta,
  etiquetaDiaRelativo,
  getProximosEventosInicio,
  sugerirFechaLibre,
  getMetricasEvento,
  filtrarSesionesPorPeriodo,
  getRangoFechasEstadisticas,
  calcularEstadisticasJugadoras,
  combinarStatsJugadora,
  porcentajeAsistencia,
  getEquipoLabels,
  formatTipoCanasta,
  formatGeneroEquipo,
  normalizeGenero,
  canManageEquipo,
  getDevicePreviewFromWidth,
  dorsalEstaOcupado,
} from "../../src/lib/appUtils.js";
import { getAuthErrorMessage } from "../../src/lib/authErrors.js";

describe("getEquipoLabels", () => {
  it("devuelve textos femeninos y masculinos", () => {
    expect(getEquipoLabels("femenino").plantillaTitulo).toBe("Plantilla de Jugadoras");
    expect(getEquipoLabels("masculino").plantillaTitulo).toBe("Plantilla de Jugadores");
    expect(getEquipoLabels("masculino").anadirJugador).toBe("Añadir Jugador");
  });

  it("normaliza valores desconocidos a femenino", () => {
    expect(getEquipoLabels(undefined).jugadores).toBe("Jugadoras");
    expect(normalizeGenero("otro")).toBe("femenino");
  });
});

describe("formatTipoCanasta", () => {
  it("formatea canasta grande y minibasket", () => {
    expect(formatTipoCanasta("grande")).toBe("Canasta grande");
    expect(formatTipoCanasta("minibasket")).toBe("Minibasket");
  });
});

describe("formatGeneroEquipo", () => {
  it("formatea genero del equipo", () => {
    expect(formatGeneroEquipo("masculino")).toBe("Masculino");
    expect(formatGeneroEquipo("femenino")).toBe("Femenino");
  });
});

describe("canManageEquipo", () => {
  it("permite superadmin y coordinador de su club", () => {
    expect(canManageEquipo("superadmin", null, "club-a")).toBe(true);
    expect(canManageEquipo("coordinador", "club-a", "club-a")).toBe(true);
    expect(canManageEquipo("coordinador", "club-a", "club-b")).toBe(false);
    expect(canManageEquipo("entrenador", "club-a", "club-a")).toBe(false);
  });
});

describe("getDevicePreviewFromWidth", () => {
  it("elige desktop, tablet o mobile según el ancho", () => {
    expect(getDevicePreviewFromWidth(1440)).toBe("desktop");
    expect(getDevicePreviewFromWidth(800)).toBe("tablet");
    expect(getDevicePreviewFromWidth(390)).toBe("mobile");
  });
});

describe("dorsalEstaOcupado", () => {
  const plantilla = [
    { id: "a", dorsal: 4 },
    { id: "b", dorsal: 10 },
  ];

  it("detecta dorsales repetidos y permite el propio al editar", () => {
    expect(dorsalEstaOcupado(plantilla, 10)).toBe(true);
    expect(dorsalEstaOcupado(plantilla, "4", "a")).toBe(false);
    expect(dorsalEstaOcupado(plantilla, 7)).toBe(false);
  });
});

describe("getAuthErrorMessage", () => {
  it("traduce códigos de Firebase y oculta el inglés", () => {
    expect(getAuthErrorMessage({ code: "auth/invalid-credential" })).toMatch(/incorrectos/i);
    expect(getAuthErrorMessage({ code: "auth/popup-closed-by-user" })).toMatch(/cerrado/i);
    expect(getAuthErrorMessage({ message: "Firebase: Error (auth/whatever)." })).toMatch(/iniciar sesión/i);
  });
});

describe("formatRolLabel", () => {
  it("capitaliza el rol", () => {
    expect(formatRolLabel("entrenador")).toBe("Entrenador");
    expect(formatRolLabel("superadmin")).toBe("Superadmin");
    expect(formatRolLabel("coordinador")).toBe("Coordinador");
  });

  it("devuelve N/A si falta rol", () => {
    expect(formatRolLabel(null)).toBe("N/A");
  });
});

describe("getClubInitials", () => {
  it("extrae iniciales del club", () => {
    expect(getClubInitials("Celta de Vigo")).toBe("CD");
    expect(getClubInitials("Celta")).toBe("C");
  });
});

describe("getCalendarMatrix", () => {
  it("genera semanas de 7 días", () => {
    const semanas = getCalendarMatrix(2026, 7); // agosto 2026
    expect(semanas.length).toBeGreaterThan(4);
    semanas.forEach((semana) => expect(semana).toHaveLength(7));
  });
});

describe("formatDateYYYYMMDD", () => {
  it("formatea con ceros a la izquierda", () => {
    expect(formatDateYYYYMMDD(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("normalizarTipoSesion", () => {
  it("distingue partido y entreno", () => {
    expect(normalizarTipoSesion({ tipo: "partido" })).toBe("partido");
    expect(normalizarTipoSesion({ tipo: "entreno" })).toBe("entreno");
    expect(normalizarTipoSesion({})).toBe("entreno");
  });
});

describe("formatearFechaCorta", () => {
  it("convierte YYYY-MM-DD a DD/MM/YYYY", () => {
    expect(formatearFechaCorta("2026-08-17")).toBe("17/08/2026");
  });
});

describe("etiquetaDiaRelativo", () => {
  it("marca hoy y mañana", () => {
    expect(etiquetaDiaRelativo("2026-08-17", "2026-08-17", "2026-08-18")).toBe("Hoy");
    expect(etiquetaDiaRelativo("2026-08-18", "2026-08-17", "2026-08-18")).toBe("Mañana");
  });
});

describe("getProximosEventosInicio", () => {
  it("encuentra próximo entreno hoy/mañana y partido futuro", () => {
    const hoy = new Date(2026, 7, 17);
    const sesiones = [
      { fecha: "2026-08-17", tipo: "entreno", tematica: "Tiro" },
      { fecha: "2026-08-25", tipo: "partido", rival: "Rival" },
    ];
    const { proximoEntreno, proximoPartido } = getProximosEventosInicio(sesiones, hoy);
    expect(proximoEntreno?.tematica).toBe("Tiro");
    expect(proximoPartido?.rival).toBe("Rival");
  });
});

describe("sugerirFechaLibre", () => {
  it("devuelve hoy si está libre, si no la siguiente", () => {
    const hoy = new Date(2026, 7, 17);
    expect(sugerirFechaLibre([], hoy)).toBe("2026-08-17");
    expect(sugerirFechaLibre([{ fecha: "2026-08-17" }], hoy)).toBe("2026-08-18");
  });
});

describe("getMetricasEvento", () => {
  it("cuenta confirmadas", () => {
    const m = getMetricasEvento({
      asistencias: { a: true, b: false, c: true },
    });
    expect(m).toEqual({ confirmadas: 2, total: 3 });
  });
});

describe("filtrarSesionesPorPeriodo", () => {
  const sesiones = [
    { fecha: "2026-08-01", tipo: "entreno" },
    { fecha: "2026-08-20", tipo: "entreno" },
    { fecha: "2026-09-01", tipo: "partido" },
  ];

  it("filtra por rango personalizado", () => {
    const filtradas = filtrarSesionesPorPeriodo(sesiones, "rango", "2026-08-01", "2026-08-31");
    expect(filtradas).toHaveLength(2);
  });

  it("en periodo todo no recorta sesiones", () => {
    expect(getRangoFechasEstadisticas("todo")).toEqual({ inicio: "", fin: "" });
    expect(filtrarSesionesPorPeriodo(sesiones, "todo")).toHaveLength(3);
  });
});

describe("calcularEstadisticasJugadoras", () => {
  it("calcula asistencia y nota media", () => {
    const jugadoras = [{ id: "j1", nombre: "Ana", dorsal: 1 }];
    const sesiones = [
      { tipo: "entreno", fecha: "2026-08-01", asistencias: { j1: true }, valoraciones: { j1: 4 } },
      { tipo: "entreno", fecha: "2026-08-02", asistencias: { j1: false }, valoraciones: {} },
      { tipo: "partido", fecha: "2026-08-03", asistencias: { j1: true }, valoraciones: { j1: 5 } },
    ];
    const stats = calcularEstadisticasJugadoras(jugadoras, sesiones);
    expect(stats[0].entrenos.presentes).toBe(1);
    expect(stats[0].entrenos.ausencias).toBe(1);
    expect(stats[0].entrenos.noJustificada).toBe(1);
    expect(stats[0].partidos.presentes).toBe(1);
    expect(stats[0].entrenos.notaMedia).toBe(4);
    expect(stats[0].entrenos.notasCount).toBe(1);
  });

  it("desglosa justificada, no justificada y salud", () => {
    const jugadoras = [{ id: "j1", nombre: "Ana", dorsal: 1 }];
    const sesiones = [
      { tipo: "entreno", fecha: "2026-08-01", asistencias: { j1: false }, motivosAusencia: { j1: "justificada" } },
      { tipo: "entreno", fecha: "2026-08-02", asistencias: { j1: false }, motivosAusencia: { j1: "salud" } },
      { tipo: "entreno", fecha: "2026-08-03", asistencias: { j1: false } },
    ];
    const stats = calcularEstadisticasJugadoras(jugadoras, sesiones);
    expect(stats[0].entrenos.ausencias).toBe(3);
    expect(stats[0].entrenos.justificada).toBe(1);
    expect(stats[0].entrenos.salud).toBe(1);
    expect(stats[0].entrenos.noJustificada).toBe(1);
  });

  it("combina entrenos y partidos y desglosa ausencias", () => {
    const combinadas = combinarStatsJugadora(
      { total: 2, presentes: 1, ausencias: 1, justificada: 1, noJustificada: 0, salud: 0, notaMedia: 4, notasCount: 1 },
      { total: 1, presentes: 0, ausencias: 1, justificada: 0, noJustificada: 0, salud: 1, notaMedia: 5, notasCount: 1 },
    );
    expect(combinadas.total).toBe(3);
    expect(combinadas.ausencias).toBe(2);
    expect(combinadas.justificada).toBe(1);
    expect(combinadas.salud).toBe(1);
    expect(combinadas.notaMedia).toBe(4.5);
    expect(porcentajeAsistencia(combinadas)).toBe(33);
  });
});
