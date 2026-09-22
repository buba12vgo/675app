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
  canEditSesion,
  canCreateTipoSesion,
  canManagePlantilla,
  buildSesionDocId,
  createSesionDocId,
  diaTieneEntreno,
  diaTieneTipo,
  sesionesDelDia,
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
    expect(canManageEquipo("preparador_fisico", "club-a", "club-a")).toBe(false);
  });
});

describe("permisos preparador físico", () => {
  it("solo edita y crea sesiones físicas", () => {
    expect(canEditSesion("preparador_fisico", { tipo: "fisico" })).toBe(true);
    expect(canEditSesion("preparador_fisico", { tipo: "entreno" })).toBe(false);
    expect(canCreateTipoSesion("preparador_fisico", "fisico")).toBe(true);
    expect(canCreateTipoSesion("preparador_fisico", "partido")).toBe(false);
    expect(canCreateTipoSesion("entrenador", "fisico")).toBe(true);
    expect(canManagePlantilla("preparador_fisico")).toBe(false);
    expect(canManagePlantilla("entrenador")).toBe(true);
  });

  it("genera id de sesión con tipo", () => {
    expect(buildSesionDocId("eq1", "2026-08-17", "fisico")).toBe("eq1_2026-08-17_fisico");
  });

  it("genera ids distintos para varios partidos el mismo día", () => {
    const a = createSesionDocId("eq1", "2026-08-17", "partido");
    const b = createSesionDocId("eq1", "2026-08-17", "partido");
    expect(a).toMatch(/^eq1_2026-08-17_partido_/);
    expect(b).toMatch(/^eq1_2026-08-17_partido_/);
    expect(a).not.toBe(b);
    expect(createSesionDocId("eq1", "2026-08-17", "entreno")).toBe("eq1_2026-08-17_entreno");
  });
});

describe("diaTieneEntreno y partidos múltiples", () => {
  const sesiones = [
    { id: "1", fecha: "2026-08-17", tipo: "partido", rival: "A" },
    { id: "2", fecha: "2026-08-17", tipo: "partido", rival: "B" },
    { id: "3", fecha: "2026-08-18", tipo: "entreno" },
  ];

  it("detecta entreno y permite varios partidos el mismo día", () => {
    expect(diaTieneEntreno(sesiones, "2026-08-17")).toBe(false);
    expect(diaTieneTipo(sesiones, "2026-08-17", "partido")).toBe(true);
    expect(sesionesDelDia(sesiones, "2026-08-17").filter((s) => s.tipo === "partido")).toHaveLength(2);
    expect(diaTieneEntreno(sesiones, "2026-08-18")).toBe(true);
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

  it("ignora dorsales de entrenador y ayudante", () => {
    const conStaff = [
      ...plantilla,
      { id: "c", dorsal: 10, rolPlantilla: "entrenador" },
      { id: "d", dorsal: null, rolPlantilla: "ayudante" },
    ];
    expect(dorsalEstaOcupado(conStaff, 10)).toBe(true);
    expect(dorsalEstaOcupado([{ id: "c", dorsal: 10, rolPlantilla: "entrenador" }], 10)).toBe(false);
  });
});

describe("getAuthErrorMessage", () => {
  it("traduce códigos de Firebase y oculta el inglés", () => {
    expect(getAuthErrorMessage({ code: "auth/invalid-credential" })).toMatch(/incorrectos/i);
    expect(getAuthErrorMessage({ code: "auth/popup-closed-by-user" })).toMatch(/cerrado/i);
    expect(getAuthErrorMessage({ message: "Firebase: Error (auth/whatever)." })).toMatch(/whatever/i);
    expect(getAuthErrorMessage({ code: "auth/internal-error" })).toMatch(/completar el acceso/i);
    expect(getAuthErrorMessage({ code: "auth/unauthorized-domain" })).toMatch(/675basket.com/i);
    expect(getAuthErrorMessage({})).toMatch(/iniciar sesión/i);
  });
});

describe("formatRolLabel", () => {
  it("capitaliza el rol", () => {
    expect(formatRolLabel("entrenador")).toBe("Entrenador");
    expect(formatRolLabel("superadmin")).toBe("Superadmin");
    expect(formatRolLabel("coordinador")).toBe("Coordinador");
    expect(formatRolLabel("preparador_fisico")).toBe("Preparador físico");
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
  it("distingue partido, físico y entreno", () => {
    expect(normalizarTipoSesion({ tipo: "partido" })).toBe("partido");
    expect(normalizarTipoSesion({ tipo: "fisico" })).toBe("fisico");
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

  it("encuentra el próximo entreno futuro, no solo hoy o mañana", () => {
    const hoy = new Date(2026, 7, 17);
    const sesiones = [{ fecha: "2026-08-20", tipo: "entreno", tematica: "Defensa" }];
    const { proximoEntreno } = getProximosEventosInicio(sesiones, hoy);
    expect(proximoEntreno?.tematica).toBe("Defensa");
  });
});

describe("sugerirFechaLibre", () => {
  it("devuelve hoy si está libre, si no la siguiente", () => {
    const hoy = new Date(2026, 7, 17);
    expect(sugerirFechaLibre([], hoy)).toBe("2026-08-17");
    expect(sugerirFechaLibre([{ fecha: "2026-08-17" }], hoy)).toBe("2026-08-18");
  });

  it("permite partido el mismo día que otro partido, pero no con entreno", () => {
    const hoy = new Date(2026, 7, 17);
    expect(sugerirFechaLibre([{ fecha: "2026-08-17", tipo: "partido" }], "partido", hoy)).toBe("2026-08-17");
    expect(sugerirFechaLibre([{ fecha: "2026-08-17", tipo: "entreno" }], "partido", hoy)).toBe("2026-08-18");
  });

  it("no vuelve al primer día ocupado si no hay hueco en el rango", () => {
    const hoy = new Date(2026, 7, 17);
    const ocupadas = [
      { fecha: "2026-08-17", tipo: "entreno" },
      { fecha: "2026-08-18", tipo: "entreno" },
      { fecha: "2026-08-19", tipo: "entreno" },
    ];
    expect(sugerirFechaLibre(ocupadas, "entreno", hoy, 3)).toBe("2026-08-20");
  });
});

describe("getMetricasEvento", () => {
  it("cuenta confirmadas", () => {
    const m = getMetricasEvento({
      asistencias: { a: true, b: false, c: true },
    });
    expect(m).toEqual({ confirmadas: 2, total: 3 });
  });

  it("no cuenta al staff de plantilla en la convocatoria", () => {
    const m = getMetricasEvento(
      { asistencias: { a: true, b: false, e1: true } },
      [{ id: "e1", rolPlantilla: "entrenador" }]
    );
    expect(m).toEqual({ confirmadas: 1, total: 2 });
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

  it("rango incompleto no devuelve todas las sesiones", () => {
    expect(filtrarSesionesPorPeriodo(sesiones, "rango")).toHaveLength(0);
    expect(filtrarSesionesPorPeriodo(sesiones, "rango", "2026-08-01", "")).toHaveLength(0);
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
    expect(stats[0].entrenos.total).toBe(2);
    expect(stats[0].partidos.total).toBe(1);
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

  it("no cuenta el doblaje como ausencia ni en el porcentaje", () => {
    const jugadoras = [{ id: "j1", nombre: "Ana", dorsal: 1 }];
    const sesiones = [
      { tipo: "entreno", fecha: "2026-08-01", asistencias: { j1: true }, valoraciones: { j1: 4 } },
      { tipo: "entreno", fecha: "2026-08-02", asistencias: { j1: false }, motivosAusencia: { j1: "doblaje" } },
      { tipo: "entreno", fecha: "2026-08-03", asistencias: { j1: false }, motivosAusencia: { j1: "salud" } },
    ];
    const stats = calcularEstadisticasJugadoras(jugadoras, sesiones);
    expect(stats[0].entrenos.presentes).toBe(1);
    expect(stats[0].entrenos.ausencias).toBe(1);
    expect(stats[0].entrenos.doblaje).toBe(1);
    expect(stats[0].entrenos.salud).toBe(1);
    expect(porcentajeAsistencia(stats[0].entrenos)).toBe(50);
  });

  it("en partidos solo cuenta no convocado y lesionado", () => {
    const jugadoras = [{ id: "j1", nombre: "Ana", dorsal: 1 }];
    const sesiones = [
      { tipo: "partido", fecha: "2026-08-01", asistencias: { j1: true }, valoraciones: { j1: 4 } },
      { tipo: "partido", fecha: "2026-08-02", asistencias: { j1: false }, motivosAusencia: { j1: "no_convocado" } },
      { tipo: "partido", fecha: "2026-08-03", asistencias: { j1: false }, motivosAusencia: { j1: "lesionado" } },
      { tipo: "partido", fecha: "2026-08-04", asistencias: { j1: false }, motivosAusencia: { j1: "salud" } },
    ];
    const stats = calcularEstadisticasJugadoras(jugadoras, sesiones);
    expect(stats[0].partidos.presentes).toBe(1);
    expect(stats[0].partidos.ausencias).toBe(3);
    expect(stats[0].partidos.noConvocado).toBe(1);
    expect(stats[0].partidos.lesionado).toBe(2); // lesionado + salud legacy
    expect(stats[0].partidos.justificada).toBe(0);
    expect(stats[0].partidos.salud).toBe(0);
  });

  it("combina entrenos y partidos y desglosa ausencias", () => {
    const combinadas = combinarStatsJugadora(
      { total: 2, presentes: 1, ausencias: 1, justificada: 1, noJustificada: 0, salud: 0, doblaje: 1, noConvocado: 0, lesionado: 0, notaMedia: 4, notasCount: 1 },
      { total: 1, presentes: 0, ausencias: 1, justificada: 0, noJustificada: 0, salud: 0, doblaje: 0, noConvocado: 1, lesionado: 0, notaMedia: 5, notasCount: 1 },
    );
    expect(combinadas.total).toBe(3);
    expect(combinadas.ausencias).toBe(2);
    expect(combinadas.justificada).toBe(1);
    expect(combinadas.noConvocado).toBe(1);
    expect(combinadas.doblaje).toBe(1);
    expect(combinadas.notaMedia).toBe(4.5);
    expect(porcentajeAsistencia(combinadas)).toBe(33);
  });

  it("cuenta ausencias de un entrenador de plantilla", () => {
    const staff = [{ id: "e1", nombre: "Marta", rolPlantilla: "entrenador" }];
    const sesiones = [
      { tipo: "entreno", fecha: "2026-08-01", asistencias: { e1: true } },
      { tipo: "entreno", fecha: "2026-08-02", asistencias: { e1: false }, motivosAusencia: { e1: "salud" } },
    ];
    const stats = calcularEstadisticasJugadoras(staff, sesiones);
    expect(stats[0].entrenos.presentes).toBe(1);
    expect(stats[0].entrenos.ausencias).toBe(1);
    expect(stats[0].entrenos.salud).toBe(1);
    expect(stats[0].entrenos.notaMedia).toBe(null);
  });

  it("el total solo cuenta sesiones con registro de la jugadora", () => {
    const jugadoras = [{ id: "j1", nombre: "Ana", dorsal: 1 }];
    const sesiones = [
      { tipo: "entreno", fecha: "2026-08-01", asistencias: { j1: true } },
      { tipo: "entreno", fecha: "2026-08-02", asistencias: { j2: true } },
    ];
    const stats = calcularEstadisticasJugadoras(jugadoras, sesiones);
    expect(stats[0].entrenos.total).toBe(1);
    expect(stats[0].entrenos.presentes).toBe(1);
  });
});
