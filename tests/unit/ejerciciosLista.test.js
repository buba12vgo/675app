import { describe, it, expect } from "vitest";
import {
  parseEjerciciosLista,
  serializeEjerciciosLista,
  moverEjercicio,
} from "../../src/lib/ejerciciosLista.js";

describe("ejerciciosLista", () => {
  it("parte el texto en líneas y quita numeración", () => {
    expect(parseEjerciciosLista("5 balones\nTécnica de tiro\n")).toEqual([
      "5 balones",
      "Técnica de tiro",
    ]);
    expect(parseEjerciciosLista("1. Fondo\n2) Tiro")).toEqual(["Fondo", "Tiro"]);
    expect(parseEjerciciosLista("")).toEqual([]);
  });

  it("serializa de nuevo a texto", () => {
    expect(serializeEjerciciosLista(["Fondo", " Tiro ", ""])).toBe("Fondo\nTiro");
  });

  it("reordena sin perder ítems", () => {
    expect(moverEjercicio(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(moverEjercicio(["a", "b"], 0, 0)).toEqual(["a", "b"]);
    expect(moverEjercicio(["a"], 3, 0)).toEqual(["a"]);
  });
});
