import { describe, it, expect } from "vitest";
import {
  parseEjerciciosLista,
  serializeEjerciciosLista,
  moverEjercicio,
} from "../../src/lib/ejerciciosLista.js";

describe("ejerciciosLista", () => {
  it("parte el texto legado en líneas y quita numeración", () => {
    expect(parseEjerciciosLista("5 balones\nTécnica de tiro\n")).toEqual([
      "5 balones",
      "Técnica de tiro",
    ]);
    expect(parseEjerciciosLista("1. Fondo\n2) Tiro")).toEqual(["Fondo", "Tiro"]);
    expect(parseEjerciciosLista("")).toEqual([]);
  });

  it("permite varias líneas en un mismo ejercicio (separador en blanco)", () => {
    expect(parseEjerciciosLista("Calentamiento\nTrote suave\n\nTiro\nDesde esquina")).toEqual([
      "Calentamiento\nTrote suave",
      "Tiro\nDesde esquina",
    ]);
  });

  it("serializa con línea en blanco entre ejercicios", () => {
    expect(serializeEjerciciosLista(["Fondo", " Tiro ", ""])).toBe("Fondo\n\nTiro");
    expect(serializeEjerciciosLista(["Línea 1\nLínea 2", "Otro"])).toBe("Línea 1\nLínea 2\n\nOtro");
  });

  it("round-trip conserva multilínea", () => {
    const items = ["Calentamiento\nMovilidad", "5x5"];
    expect(parseEjerciciosLista(serializeEjerciciosLista(items))).toEqual(items);
  });

  it("reordena sin perder ítems", () => {
    expect(moverEjercicio(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moverEjercicio(["a", "b"], 0, 0)).toEqual(["a", "b"]);
    expect(moverEjercicio(["a"], 3, 0)).toEqual(["a"]);
  });
});
