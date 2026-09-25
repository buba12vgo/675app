import { describe, it, expect } from "vitest";
import {
  SEXTOS_PARTIDO,
  normalizeSextosJugadora,
  normalizePlanificacionSextos,
  estaEnSexto,
  toggleSexto,
  planificacionParaGuardar,
  etiquetaJugadoraPlanificacion,
  esEquipoMinibasket,
  avisosPlanificacionSextos,
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
    expect(etiquetaJugadoraPlanificacion({ nombre: "Mara", dorsal: 17 })).toBe("17 Mara");
    expect(etiquetaJugadoraPlanificacion({ nombre: "Eva" })).toBe("Eva");
  });
});

describe("avisosPlanificacionSextos", () => {
  const jugadoras = [
    { id: "a", nombre: "Ana", dorsal: 4 },
    { id: "b", nombre: "Lucía", dorsal: 10 },
  ];

  it("no avisa si la planificación está vacía", () => {
    expect(avisosPlanificacionSextos(jugadoras, {})).toEqual([]);
  });

  it("avisa si al acabar el 5º alguien no lleva 2 sextos", () => {
    const avisos = avisosPlanificacionSextos(jugadoras, { a: [1, 2], b: [1, 6] });
    expect(avisos.some((a) => a.includes("5º") && a.includes("10 Lucía"))).toBe(true);
    expect(avisos.some((a) => a.includes("4 Ana"))).toBe(false);
  });

  it("avisa de tres sextos seguidos", () => {
    const avisos = avisosPlanificacionSextos(jugadoras, { a: [1, 2, 3, 5], b: [2, 4] });
    expect(avisos.some((a) => a.includes("3 sextos seguidos") && a.includes("4 Ana (1º-3º)"))).toBe(true);
    expect(avisos.some((a) => a.includes("10 Lucía"))).toBe(false);
  });

  it("no avisa cuando se cumplen las dos normas", () => {
    expect(avisosPlanificacionSextos(jugadoras, { a: [1, 3, 5], b: [2, 4, 6] })).toEqual([]);
  });
});

describe("esEquipoMinibasket", () => {
  it("reconoce minibasket por tipo o por nombre", () => {
    expect(esEquipoMinibasket("minibasket")).toBe(true);
    expect(esEquipoMinibasket("pequena")).toBe(true);
    expect(esEquipoMinibasket("mini")).toBe(true);
    expect(esEquipoMinibasket("grande", "Mini Femenino")).toBe(true);
    expect(esEquipoMinibasket(undefined, "Alevin Masc")).toBe(true);
    expect(esEquipoMinibasket("grande", "Cadete")).toBe(false);
    expect(esEquipoMinibasket(undefined, "Senior")).toBe(false);
  });
});

describe("SEXTOS_PARTIDO", () => {
  it("tiene seis periodos", () => {
    expect(SEXTOS_PARTIDO).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
