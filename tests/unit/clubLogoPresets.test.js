import { describe, expect, it } from "vitest";
import { getPresetClubLogoUrl, resolveClubLogoUrl } from "../../src/lib/clubLogoPresets.js";

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
