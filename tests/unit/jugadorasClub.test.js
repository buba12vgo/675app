import { describe, it, expect } from "vitest";
import {
  normalizeTextoBusqueda,
  normalizeExternasIds,
  combinarJugadorasSesion,
  filtrarJugadorasClub,
} from "../../src/lib/jugadorasClub.js";

const equipos = [
  { id: "eq-1", nombre: "Senior" },
  { id: "eq-2", nombre: "Cadete" },
];

const plantilla = [{ id: "j1", nombre: "Ana", dorsal: 4, equipoId: "eq-1" }];
const club = [
  { id: "j1", nombre: "Ana", dorsal: 4, equipoId: "eq-1" },
  { id: "j2", nombre: "Lucía Pérez", apodo: "Lu", dorsal: 9, equipoId: "eq-2" },
  { id: "j3", nombre: "Marta", dorsal: 11, equipoId: "eq-2" },
];

describe("jugadorasClub", () => {
  it("normaliza búsqueda sin acentos", () => {
    expect(normalizeTextoBusqueda("  LucÍA ")).toBe("lucia");
  });

  it("combina plantilla con externas del club", () => {
    const lista = combinarJugadorasSesion(plantilla, club, ["j2", "j1"], equipos);
    expect(lista.map((j) => j.id)).toEqual(["j1", "j2"]);
    expect(lista[0].esExterna).toBe(false);
    expect(lista[1].esExterna).toBe(true);
    expect(lista[1].equipoNombre).toBe("Cadete");
  });

  it("filtra otras plantillas por nombre, apodo, dorsal o equipo", () => {
    expect(filtrarJugadorasClub(club, { equipoActivoId: "eq-1", idsYaEnSesion: [], busqueda: "lu", equipos }).map((j) => j.id)).toEqual(["j2"]);
    expect(filtrarJugadorasClub(club, { equipoActivoId: "eq-1", idsYaEnSesion: [], busqueda: "11", equipos }).map((j) => j.id)).toEqual(["j3"]);
    expect(filtrarJugadorasClub(club, { equipoActivoId: "eq-1", idsYaEnSesion: ["j2"], busqueda: "cadete", equipos }).map((j) => j.id)).toEqual(["j3"]);
    expect(filtrarJugadorasClub(club, { equipoActivoId: "eq-1", busqueda: "" })).toEqual([]);
  });

  it("normaliza ids externos únicos", () => {
    expect(normalizeExternasIds(["j2", "j2", "  ", "j3"])).toEqual(["j2", "j3"]);
  });
});
