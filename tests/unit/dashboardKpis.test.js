import { describe, it, expect } from "vitest";
import {
  agregarKpis,
  balancePartidos,
  calcularKpisEquipo,
  calcularKpisEquipos,
  formatearPct,
  porcentajeAbsentismo,
} from "../../src/lib/dashboardKpis.js";

const equipo = { id: "eq-1", nombre: "Cadete A" };

describe("dashboardKpis", () => {
  it("cuenta plantilla, sesiones y partidos sin bajar a jugadora", () => {
    const jugadoras = [
      { id: "j1", equipoId: "eq-1", dorsal: 4 },
      { id: "j2", equipoId: "eq-1", dorsal: 7 },
      { id: "e1", equipoId: "eq-1", rolPlantilla: "entrenador" },
      { id: "x1", equipoId: "eq-2", dorsal: 1 },
    ];
    const sesiones = [
      {
        equipoId: "eq-1",
        tipo: "entreno",
        fecha: "2026-09-01",
        asistencias: { j1: true, j2: false, e1: true },
        motivosAusencia: { j2: "no_justificada" },
        valoraciones: { j1: 4 },
      },
      {
        equipoId: "eq-1",
        tipo: "partido",
        fecha: "2026-09-08",
        asistencias: { j1: true, j2: true },
        puntosFavor: 70,
        puntosContra: 55,
      },
      { equipoId: "eq-2", tipo: "entreno", fecha: "2026-09-02", asistencias: { x1: true } },
    ];
    const kpis = calcularKpisEquipo({ equipo, jugadoras, sesiones, periodo: "todo" });
    expect(kpis.jugadoras).toBe(2);
    expect(kpis.staff).toBe(1);
    expect(kpis.entrenos).toBe(1);
    expect(kpis.partidos).toBe(1);
    expect(kpis.sesiones).toBe(2);
    expect(kpis.presentes).toBe(1);
    expect(kpis.ausencias).toBe(1);
    expect(kpis.absentismoPct).toBe(50);
    expect(kpis.victorias).toBe(1);
    expect(kpis.notaMedia).toBe(4);
    expect(balancePartidos(kpis)).toBe("1-0-0");
  });

  it("ignora doblaje en el absentismo y no usa asistencia de partidos", () => {
    const jugadoras = [{ id: "j1", equipoId: "eq-1", dorsal: 4 }];
    const sesiones = [
      {
        equipoId: "eq-1",
        tipo: "entreno",
        fecha: "2026-09-01",
        asistencias: { j1: false },
        motivosAusencia: { j1: "doblaje" },
      },
      {
        equipoId: "eq-1",
        tipo: "partido",
        fecha: "2026-09-02",
        asistencias: { j1: false },
        motivosAusencia: { j1: "no_convocado" },
      },
    ];
    const kpis = calcularKpisEquipo({ equipo, jugadoras, sesiones, periodo: "todo" });
    expect(kpis.presentes).toBe(0);
    expect(kpis.ausencias).toBe(0);
    expect(kpis.absentismoPct).toBe(null);
    expect(formatearPct(kpis.absentismoPct)).toBe("—");
    expect(porcentajeAbsentismo(8, 2)).toBe(20);
  });

  it("agrega KPIs de varios equipos", () => {
    const filas = calcularKpisEquipos({
      equipos: [equipo, { id: "eq-2", nombre: "Cadete" }],
      jugadoras: [
        { id: "j1", equipoId: "eq-1", dorsal: 4 },
        { id: "j2", equipoId: "eq-2", dorsal: 5 },
      ],
      sesiones: [
        { equipoId: "eq-1", tipo: "entreno", fecha: "2026-09-01", asistencias: { j1: true } },
        {
          equipoId: "eq-2",
          tipo: "partido",
          fecha: "2026-09-01",
          asistencias: { j2: true },
          puntosFavor: 40,
          puntosContra: 50,
        },
      ],
      periodo: "todo",
    });
    const total = agregarKpis(filas);
    expect(total.jugadoras).toBe(2);
    expect(total.entrenos).toBe(1);
    expect(total.partidos).toBe(1);
    expect(total.derrotas).toBe(1);
    expect(balancePartidos(total)).toBe("0-0-1");
  });
});
