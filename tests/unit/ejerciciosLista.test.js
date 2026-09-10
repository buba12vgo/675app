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

  it("permite varias líneas en un mismo ejercicio", () => {
    const serialized = serializeEjerciciosLista([
      "Calentamiento\nTrote suave",
      "Tiro\nDesde esquina",
    ]);
    expect(serialized.startsWith("[")).toBe(true);
    expect(parseEjerciciosLista(serialized)).toEqual([
      "Calentamiento\nTrote suave",
      "Tiro\nDesde esquina",
    ]);
  });

  it("serializa listas de una línea como texto simple", () => {
    expect(serializeEjerciciosLista(["Fondo", " Tiro ", ""])).toBe("Fondo\nTiro");
  });

  it("round-trip conserva un único ejercicio multilínea", () => {
    const items = ["Línea uno\nLínea dos"];
    expect(parseEjerciciosLista(serializeEjerciciosLista(items))).toEqual(items);
  });

  it("lee bloques separados por línea en blanco", () => {
    expect(parseEjerciciosLista("Calentamiento\nTrote\n\nTiro")).toEqual([
      "Calentamiento\nTrote",
      "Tiro",
    ]);
  });

  it("reordena sin perder ítems", () => {
    expect(moverEjercicio(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moverEjercicio(["a", "b"], 0, 0)).toEqual(["a", "b"]);
    expect(moverEjercicio(["a"], 3, 0)).toEqual(["a"]);
  });
});
