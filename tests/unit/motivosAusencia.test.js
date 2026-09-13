import { describe, it, expect } from "vitest";
import {
  MOTIVO_JUSTIFICADA,
  MOTIVO_NO_JUSTIFICADA,
  MOTIVO_SALUD,
  MOTIVO_DOBLAJE,
  MOTIVO_NO_CONVOCADO,
  MOTIVO_LESIONADO,
  MOTIVO_PARTIDO_DEFAULT,
  normalizeMotivoAusencia,
  normalizeMotivosAusenciaMap,
  motivoAusenciaParaGuardar,
  motivosAusenciaParaTipo,
  motivoAusenciaDefaultParaTipo,
} from "../../src/lib/motivosAusencia.js";

describe("motivosAusencia", () => {
  it("acepta motivos de entreno y de partido", () => {
    expect(normalizeMotivoAusencia("justificada")).toBe(MOTIVO_JUSTIFICADA);
    expect(normalizeMotivoAusencia("salud")).toBe(MOTIVO_SALUD);
    expect(normalizeMotivoAusencia("doblaje")).toBe(MOTIVO_DOBLAJE);
    expect(normalizeMotivoAusencia("no_convocado")).toBe(MOTIVO_NO_CONVOCADO);
    expect(normalizeMotivoAusencia("lesionado")).toBe(MOTIVO_LESIONADO);
    expect(normalizeMotivoAusencia("otra")).toBe(null);
  });

  it("devuelve motivos de partido según género", () => {
    expect(motivosAusenciaParaTipo("partido", "femenino").map((m) => m.label)).toEqual([
      "No convocada",
      "Lesionada",
    ]);
    expect(motivosAusenciaParaTipo("partido", "masculino").map((m) => m.label)).toEqual([
      "No convocado",
      "Lesionado",
    ]);
    expect(motivosAusenciaParaTipo("entreno").map((m) => m.id)).toContain(MOTIVO_DOBLAJE);
  });

  it("usa default distinto en partido", () => {
    expect(motivoAusenciaDefaultParaTipo("partido")).toBe(MOTIVO_PARTIDO_DEFAULT);
    expect(motivoAusenciaDefaultParaTipo("entreno")).toBe(MOTIVO_NO_JUSTIFICADA);
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
    expect(motivoAusenciaParaGuardar(
      { a: false, b: false },
      { a: MOTIVO_LESIONADO },
      ["a", "b"],
      "partido"
    )).toEqual({
      a: MOTIVO_LESIONADO,
      b: MOTIVO_NO_CONVOCADO,
    });
  });
});
