import { describe, it, expect } from "vitest";
import {
  SEXTOS_PARTIDO,
  normalizeSextosJugadora,
  normalizePlanificacionSextos,
  estaEnSexto,
  toggleSexto,
  planificacionParaGuardar,
  etiquetaJugadoraPlanificacion,
} from "../../src/lib/planificacionSextos.js";

describe("normalizeSextosJugadora", () => {
  it("acepta índices 1-6 y descarta inválidos", () => {
    expect(normalizeSextosJugadora([1, 2, 5, 0, 9, 2])).toEqual([1, 2, 5]);
  });

  it("acepta array de booleanos de 6 posiciones", () => {
    expect(normalizeSextosJugadora([true, true, false, false, true, false])).toEqual([1, 2, 5]);
  });
});

describe("normalizePlanificacionSextos", () => {
  it("limpia mapas vacíos o inválidos", () => {
    expect(normalizePlanificacionSextos(null)).toEqual({});
    expect(normalizePlanificacionSextos([])).toEqual({});
    expect(normalizePlanificacionSextos({ a: [], b: [3] })).toEqual({ b: [3] });
  });
});

describe("toggleSexto", () => {
  it("marca y desmarca un sexto", () => {
    let plan = {};
    plan = toggleSexto(plan, "j1", 1);
    plan = toggleSexto(plan, "j1", 2);
    expect(estaEnSexto(plan, "j1", 1)).toBe(true);
    expect(plan.j1).toEqual([1, 2]);
    plan = toggleSexto(plan, "j1", 1);
    expect(plan.j1).toEqual([2]);
    plan = toggleSexto(plan, "j1", 2);
    expect(plan.j1).toBeUndefined();
  });
});

describe("planificacionParaGuardar", () => {
  it("solo guarda convocadas con algún sexto", () => {
    const plan = { a: [1, 6], b: [2], c: [3] };
    expect(planificacionParaGuardar(plan, ["a", "c"])).toEqual({ a: [1, 6], c: [3] });
  });
});

describe("etiquetaJugadoraPlanificacion", () => {
  it("junta nombre y dorsal", () => {
    expect(etiquetaJugadoraPlanificacion({ nombre: "Mara", dorsal: 17 })).toBe("Mara 17");
    expect(etiquetaJugadoraPlanificacion({ nombre: "Eva" })).toBe("Eva");
  });
});

describe("SEXTOS_PARTIDO", () => {
  it("tiene seis periodos", () => {
    expect(SEXTOS_PARTIDO).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
