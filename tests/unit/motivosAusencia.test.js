import { describe, it, expect } from "vitest";
import {
  MOTIVO_JUSTIFICADA,
  MOTIVO_NO_JUSTIFICADA,
  MOTIVO_SALUD,
  normalizeMotivoAusencia,
  normalizeMotivosAusenciaMap,
  motivoAusenciaParaGuardar,
} from "../../src/lib/motivosAusencia.js";

describe("motivosAusencia", () => {
  it("solo acepta los tres motivos", () => {
    expect(normalizeMotivoAusencia("justificada")).toBe(MOTIVO_JUSTIFICADA);
    expect(normalizeMotivoAusencia("salud")).toBe(MOTIVO_SALUD);
    expect(normalizeMotivoAusencia("otra")).toBe(null);
  });

  it("limpia el mapa y rellena ausencias al guardar", () => {
    expect(normalizeMotivosAusenciaMap({ a: "salud", b: "x", c: MOTIVO_JUSTIFICADA })).toEqual({
      a: MOTIVO_SALUD,
      c: MOTIVO_JUSTIFICADA,
    });
    expect(motivoAusenciaParaGuardar(
      { a: true, b: false, c: false },
      { c: MOTIVO_SALUD },
      ["a", "b", "c"]
    )).toEqual({
      b: MOTIVO_NO_JUSTIFICADA,
      c: MOTIVO_SALUD,
    });
  });
});
