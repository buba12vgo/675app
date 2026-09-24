import { describe, it, expect } from "vitest";
import {
  ROL_PLANTILLA_JUGADOR,
  ROL_PLANTILLA_ENTRENADOR,
  ROL_PLANTILLA_AYUDANTE,
  normalizeRolPlantilla,
  esJugadorPlantilla,
  esStaffPlantilla,
  etiquetaRolPlantilla,
  marcaRolPlantilla,
  dorsalParaGuardar,
  normalizarDorsalEntrada,
  ordenarPlantilla,
} from "../../src/lib/plantillaRoles.js";

describe("plantillaRoles", () => {
  it("trata documentos antiguos como jugador", () => {
    expect(normalizeRolPlantilla(undefined)).toBe(ROL_PLANTILLA_JUGADOR);
    expect(esJugadorPlantilla({ dorsal: 4 })).toBe(true);
    expect(esJugadorPlantilla({ rolPlantilla: ROL_PLANTILLA_ENTRENADOR })).toBe(false);
    expect(esStaffPlantilla({ rolPlantilla: ROL_PLANTILLA_ENTRENADOR })).toBe(true);
    expect(esStaffPlantilla({ dorsal: 4 })).toBe(false);
  });

  it("etiqueta y marca los roles del roster", () => {
    expect(etiquetaRolPlantilla(ROL_PLANTILLA_JUGADOR)).toBe("Jugador/a");
    expect(etiquetaRolPlantilla(ROL_PLANTILLA_ENTRENADOR)).toBe("Entrenador");
    expect(etiquetaRolPlantilla(ROL_PLANTILLA_AYUDANTE)).toBe("Ayudante");
    expect(marcaRolPlantilla(ROL_PLANTILLA_ENTRENADOR)).toBe("ENT");
    expect(marcaRolPlantilla(ROL_PLANTILLA_AYUDANTE)).toBe("AYU");
  });

  it("solo guarda dorsal en jugador/a", () => {
    expect(dorsalParaGuardar(ROL_PLANTILLA_JUGADOR, "12")).toBe(12);
    expect(dorsalParaGuardar(ROL_PLANTILLA_ENTRENADOR, "12")).toBe(null);
    expect(dorsalParaGuardar(ROL_PLANTILLA_AYUDANTE, "7")).toBe(null);
    expect(dorsalParaGuardar(ROL_PLANTILLA_JUGADOR, "")).toBe(null);
  });

  it("acepta el 0 y el 00", () => {
    expect(normalizarDorsalEntrada("0")).toBe("0");
    expect(normalizarDorsalEntrada("00")).toBe("00");
    expect(normalizarDorsalEntrada("07")).toBe("7");
    expect(dorsalParaGuardar(ROL_PLANTILLA_JUGADOR, "0")).toBe(0);
    expect(dorsalParaGuardar(ROL_PLANTILLA_JUGADOR, "00")).toBe("00");
  });

  it("ordena staff primero y jugadores por dorsal", () => {
    const lista = ordenarPlantilla([
      { id: "j2", nombre: "Bea", dorsal: 10, rolPlantilla: ROL_PLANTILLA_JUGADOR },
      { id: "a1", nombre: "Luis", rolPlantilla: ROL_PLANTILLA_AYUDANTE },
      { id: "j1", nombre: "Ana", dorsal: 4 },
      { id: "e1", nombre: "Marta", rolPlantilla: ROL_PLANTILLA_ENTRENADOR },
    ]);
    expect(lista.map((p) => p.id)).toEqual(["e1", "a1", "j1", "j2"]);
  });
});
