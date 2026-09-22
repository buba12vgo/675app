import { describe, expect, it } from "vitest";
import { googleLoginUsesRedirect, isStandaloneApp } from "../../src/lib/authGoogle.js";

describe("googleLoginUsesRedirect", () => {
  it("en iPhone usa redirección", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
    };
    const win = { matchMedia: () => ({ matches: false }), navigator: nav };
    expect(googleLoginUsesRedirect(nav, win)).toBe(true);
  });

  it("en la app instalada no redirige, para no dejar la pantalla en blanco", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
      standalone: true,
    };
    const win = { matchMedia: () => ({ matches: true }), navigator: nav };
    expect(isStandaloneApp(win)).toBe(true);
    expect(googleLoginUsesRedirect(nav, win)).toBe(false);
  });
});
