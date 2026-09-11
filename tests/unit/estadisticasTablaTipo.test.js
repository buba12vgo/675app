import { describe, it, expect } from "vitest";
import { ordenarFilasEstadisticas } from "../../src/lib/ordenarEstadisticas.js";

const filas = [
  {
    jugadora: { id: "a", nombre: "Ana", dorsal: 2 },
    entrenos: { total: 7, presentes: 5, ausencias: 2, notaMedia: 3.0 },
  },
  {
    jugadora: { id: "b", nombre: "Bea", dorsal: 1 },
    entrenos: { total: 7, presentes: 7, ausencias: 0, notaMedia: 4.5 },
  },
  {
    jugadora: { id: "c", nombre: "Carla", dorsal: 3 },
    entrenos: { total: 7, presentes: 6, ausencias: 1, notaMedia: null },
  },
];

describe("ordenarFilasEstadisticas", () => {
  it("ordena nota de mayor a menor y deja sin nota al final", () => {
    const ordered = ordenarFilasEstadisticas(filas, {
      sortKey: "notaMedia",
      sortDir: "desc",
      statsKey: "entrenos",
    });
    expect(ordered.map((r) => r.jugadora.id)).toEqual(["b", "a", "c"]);
  });

  it("ordena asistencias de mayor a menor", () => {
    const ordered = ordenarFilasEstadisticas(filas, {
      sortKey: "presentes",
      sortDir: "desc",
      statsKey: "entrenos",
    });
    expect(ordered.map((r) => r.jugadora.dorsal)).toEqual([1, 3, 2]);
  });

  it("ordena por nombre ascendente", () => {
    const ordered = ordenarFilasEstadisticas(filas, {
      sortKey: "nombre",
      sortDir: "asc",
      statsKey: "entrenos",
    });
    expect(ordered.map((r) => r.jugadora.nombre)).toEqual(["Ana", "Bea", "Carla"]);
  });
});
