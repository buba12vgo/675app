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
  getMetricasEvento,
  filtrarSesionesPorPeriodo,
  calcularEstadisticasJugadoras,
  getEquipoLabels,
  formatTipoCanasta,
  formatGeneroEquipo,
  normalizeGenero,
} from "../../src/lib/appUtils.js";

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
    expect(stats[0].partidos.presentes).toBe(1);
    expect(stats[0].entrenos.notaMedia).toBe(4);
  });
});
