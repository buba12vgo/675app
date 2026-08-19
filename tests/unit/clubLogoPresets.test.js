import { describe, expect, it } from "vitest";
import { getPresetClubLogoUrl, resolveClubLogoUrl, getLogoFrameStyle } from "../../src/lib/clubLogoPresets.js";

describe("clubLogoPresets", () => {
  it("asigna escudos por nombre de club", () => {
    expect(getPresetClubLogoUrl("Novo Basket Vigo")).toBe("/logos/novo-basket.png");
    expect(getPresetClubLogoUrl("Salesianos Coruña")).toBe("/logos/salesianos.png");
    expect(getPresetClubLogoUrl("Celta Femenino")).toBe("/logos/celta-femenino.png");
  });

  it("prioriza logoUrl guardado en Firestore", () => {
    expect(
      resolveClubLogoUrl({
        logoUrl: "data:image/png;base64,abc",
        nombre: "Celta Femenino",
      })
    ).toBe("data:image/png;base64,abc");
  });
});

describe("getLogoFrameStyle", () => {
  it("usa marco circular y fondo azul para Celta", () => {
    expect(getLogoFrameStyle({ nombre: "Celta Femenino", logoUrl: "/logos/celta-femenino.png" })).toEqual({
      variant: "circle",
      background: "#6eb4d6",
    });
  });

  it("usa marco cuadrado y fondo negro para Salesianos", () => {
    expect(getLogoFrameStyle({ nombre: "Salesianos Vigo" })).toEqual({
      variant: "rounded",
      background: "#000000",
    });
  });
});
