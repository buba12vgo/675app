import { describe, it, expect } from "vitest";
import {
  MAX_EQUIPOS_FAVORITOS,
  MAX_EQUIPOS_FAVORITOS_PREPARADOR,
  maxEquiposFavoritosParaRol,
  normalizeEquiposFavoritos,
  isEquipoFavorito,
  toggleEquipoFavorito,
  equiposFavoritosLlenos,
  filterEquiposPorFavoritos,
} from "../../src/lib/equiposFavoritos.js";

describe("equiposFavoritos", () => {
  it("normaliza a cuatro ids únicos por defecto", () => {
    expect(normalizeEquiposFavoritos(["a", "a", "b", "c", "d", "e"])).toEqual(["a", "b", "c", "d"]);
    expect(normalizeEquiposFavoritos(["  ", null, "x"])).toEqual(["x"]);
    expect(MAX_EQUIPOS_FAVORITOS).toBe(4);
    expect(MAX_EQUIPOS_FAVORITOS_PREPARADOR).toBe(10);
  });

  it("permite hasta 10 para preparador físico", () => {
    expect(maxEquiposFavoritosParaRol("preparador_fisico")).toBe(10);
    expect(maxEquiposFavoritosParaRol("entrenador")).toBe(4);
    const diez = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
    expect(normalizeEquiposFavoritos(diez, 10)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(equiposFavoritosLlenos(diez.slice(0, 10), 10)).toBe(true);
    expect(toggleEquipoFavorito(diez.slice(0, 10), "11", 10)).toEqual(diez.slice(0, 10));
  });

  it("añade y quita favoritos sin pasar de cuatro", () => {
    expect(toggleEquipoFavorito([], "eq-1")).toEqual(["eq-1"]);
    expect(toggleEquipoFavorito(["eq-1"], "eq-1")).toEqual([]);
    expect(toggleEquipoFavorito(["eq-1", "eq-2", "eq-3", "eq-4"], "eq-5")).toEqual(["eq-1", "eq-2", "eq-3", "eq-4"]);
    expect(equiposFavoritosLlenos(["eq-1", "eq-2", "eq-3", "eq-4"])).toBe(true);
    expect(equiposFavoritosLlenos(["eq-1", "eq-2"])).toBe(false);
    expect(isEquipoFavorito(["eq-1"], "eq-1")).toBe(true);
  });

  it("filtra la lista en el orden de los favoritos", () => {
    const equipos = [
      { id: "b", nombre: "B" },
      { id: "a", nombre: "A" },
      { id: "c", nombre: "C" },
    ];
    expect(filterEquiposPorFavoritos(equipos, ["a", "c"]).map((e) => e.id)).toEqual(["a", "c"]);
    expect(filterEquiposPorFavoritos(equipos, ["a"], { mostrarTodos: true })).toHaveLength(3);
    expect(filterEquiposPorFavoritos(equipos, [])).toHaveLength(3);
  });
});
