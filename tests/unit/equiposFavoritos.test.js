import { describe, it, expect } from "vitest";
import {
  MAX_EQUIPOS_FAVORITOS,
  normalizeEquiposFavoritos,
  isEquipoFavorito,
  toggleEquipoFavorito,
  equiposFavoritosLlenos,
  filterEquiposPorFavoritos,
} from "../../src/lib/equiposFavoritos.js";

describe("equiposFavoritos", () => {
  it("normaliza a dos ids únicos", () => {
    expect(normalizeEquiposFavoritos(["a", "a", "b", "c"])).toEqual(["a", "b"]);
    expect(normalizeEquiposFavoritos(["  ", null, "x"])).toEqual(["x"]);
    expect(MAX_EQUIPOS_FAVORITOS).toBe(2);
  });

  it("añade y quita favoritos sin pasar de dos", () => {
    expect(toggleEquipoFavorito([], "eq-1")).toEqual(["eq-1"]);
    expect(toggleEquipoFavorito(["eq-1"], "eq-1")).toEqual([]);
    expect(toggleEquipoFavorito(["eq-1", "eq-2"], "eq-3")).toEqual(["eq-1", "eq-2"]);
    expect(equiposFavoritosLlenos(["eq-1", "eq-2"])).toBe(true);
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
