import { describe, it, expect } from "vitest";
import {
  MOTIVO_JUSTIFICADA,
  MOTIVO_NO_JUSTIFICADA,
  MOTIVO_SALUD,
  MOTIVO_DOBLAJE,
  normalizeMotivoAusencia,
  normalizeMotivosAusenciaMap,
  motivoAusenciaParaGuardar,
} from "../../src/lib/motivosAusencia.js";

describe("motivosAusencia", () => {
  it("acepta los motivos conocidos incluido doblaje", () => {
    expect(normalizeMotivoAusencia("justificada")).toBe(MOTIVO_JUSTIFICADA);
    expect(normalizeMotivoAusencia("salud")).toBe(MOTIVO_SALUD);
    expect(normalizeMotivoAusencia("doblaje")).toBe(MOTIVO_DOBLAJE);
    expect(normalizeMotivoAusencia("otra")).toBe(null);
  });

  it("limpia el mapa y rellena ausencias al guardar", () => {
    expect(normalizeMotivosAusenciaMap({
      a: "salud",
      b: "x",
      c: MOTIVO_JUSTIFICADA,
      d: MOTIVO_DOBLAJE,
    })).toEqual({
      a: MOTIVO_SALUD,
      c: MOTIVO_JUSTIFICADA,
      d: MOTIVO_DOBLAJE,
    });
    expect(motivoAusenciaParaGuardar(
      { a: true, b: false, c: false, d: false },
      { c: MOTIVO_SALUD, d: MOTIVO_DOBLAJE },
      ["a", "b", "c", "d"]
    )).toEqual({
      b: MOTIVO_NO_JUSTIFICADA,
      c: MOTIVO_SALUD,
      d: MOTIVO_DOBLAJE,
    });
  });
});
