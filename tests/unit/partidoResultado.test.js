import { describe, it, expect } from "vitest";
import {
  normalizePuntosPartido,
  formatearResultadoPartido,
  resultadoPartidoEstado,
  etiquetaResultadoPartido,
  etiquetaMarcadorLocal,
  etiquetaMarcadorRival,
} from "../../src/lib/partidoResultado.js";

describe("partidoResultado", () => {
  it("normaliza enteros ≥ 0 y rechaza inválidos", () => {
    expect(normalizePuntosPartido(0)).toBe(0);
    expect(normalizePuntosPartido("78")).toBe(78);
    expect(normalizePuntosPartido(" 12 ")).toBe(12);
    expect(normalizePuntosPartido("")).toBe(null);
    expect(normalizePuntosPartido(null)).toBe(null);
    expect(normalizePuntosPartido(-1)).toBe(null);
    expect(normalizePuntosPartido("x")).toBe(null);
  });

  it("formatea marcador solo si ambos puntos están", () => {
    expect(formatearResultadoPartido(78, 65)).toBe("78-65");
    expect(formatearResultadoPartido("78", "65")).toBe("78-65");
    expect(formatearResultadoPartido(78, null)).toBe(null);
    expect(formatearResultadoPartido("", 65)).toBe(null);
  });

  it("clasifica victoria, derrota y empate", () => {
    expect(resultadoPartidoEstado(80, 70)).toBe("victoria");
    expect(resultadoPartidoEstado(60, 70)).toBe("derrota");
    expect(resultadoPartidoEstado(70, 70)).toBe("empate");
    expect(resultadoPartidoEstado(null, 70)).toBe(null);
  });

  it("etiqueta con marcador y estado", () => {
    expect(etiquetaResultadoPartido(80, 70)).toBe("80-70 · Victoria");
    expect(etiquetaResultadoPartido(60, 70)).toBe("60-70 · Derrota");
    expect(etiquetaResultadoPartido(70, 70)).toBe("70-70 · Empate");
    expect(etiquetaResultadoPartido("", "")).toBe(null);
  });

  it("usa el club y el rival en el marcador, con reserva si faltan", () => {
    expect(etiquetaMarcadorLocal("Salesianos Vigo")).toBe("Salesianos Vigo");
    expect(etiquetaMarcadorLocal("  ")).toBe("A favor");
    expect(etiquetaMarcadorLocal(null)).toBe("A favor");
    expect(etiquetaMarcadorRival("CB Rivas")).toBe("CB Rivas");
    expect(etiquetaMarcadorRival("")).toBe("En contra");
    expect(etiquetaMarcadorRival("  rival  ")).toBe("rival");
  });
});
