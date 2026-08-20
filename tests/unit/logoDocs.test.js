import { describe, expect, it } from "vitest";
import { clubLogoDocId, equipoLogoDocId, isInlineDataUrl, shortLogoUrl } from "../../src/lib/logoDocs.js";

describe("logoDocs", () => {
  it("genera ids estables", () => {
    expect(clubLogoDocId("abc")).toBe("club_abc");
    expect(equipoLogoDocId("xyz")).toBe("equipo_xyz");
  });

  it("detecta data URLs y deja pasar rutas cortas", () => {
    expect(isInlineDataUrl("data:image/png;base64,abc")).toBe(true);
    expect(isInlineDataUrl("/logos/celta-femenino.png")).toBe(false);
    expect(shortLogoUrl("data:image/png;base64,abc")).toBe(null);
    expect(shortLogoUrl("/logos/celta-femenino.png")).toBe("/logos/celta-femenino.png");
  });
});
