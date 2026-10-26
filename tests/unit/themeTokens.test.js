import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_CSS_VARS, withAccentAlpha } from "../../src/theme.js";

const css = readFileSync(new URL("../../src/index.css", import.meta.url), "utf8");
const themeSource = readFileSync(new URL("../../src/theme.js", import.meta.url), "utf8");
const [lightCss, darkCss] = css.split("html.dark");

function valueOf(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*([^;]+);`));
  return match ? match[1].trim() : "";
}

describe("tokens de 675 Basket", () => {
  it("el CSS es la fuente y theme.js no repite la paleta en hex", () => {
    expect(themeSource).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
    expect(themeSource).not.toContain("#7C3AED");
    expect(themeSource).not.toContain("#DC2626");
    expect(themeSource).toContain("blur(var(--blur-glass))");
  });

  it("mapea partido, aviso, sombra y el naranja fuerte a las variables del CSS", () => {
    expect(THEME_CSS_VARS.colorPartido).toBe("--color-partido");
    expect(THEME_CSS_VARS.error).toBe("--color-aviso");
    expect(THEME_CSS_VARS.cardShadow).toBe("--shadow-card");
    expect(THEME_CSS_VARS.accentLight).toBe("--color-accent-strong");
    expect(THEME_CSS_VARS.onAccent).toBe("--color-on-accent");
  });

  it("define en :root cada variable que lee el JS", () => {
    for (const cssVar of Object.values(THEME_CSS_VARS)) {
      expect(lightCss, cssVar).toContain(`${cssVar}:`);
    }
  });

  it("corrige el violeta de partido, el rojo de aviso y el nombre del acento", () => {
    expect(css).not.toContain("--color-accent-light");
    expect(valueOf(lightCss, "--color-accent-strong")).toBe("#9A3412");
    expect(valueOf(darkCss, "--color-accent-strong")).toBe("#F0B27A");
    expect(valueOf(lightCss, "--color-partido")).toBe("#6D28D9");
    expect(valueOf(darkCss, "--color-partido")).toBe("#8B5CF6");
    expect(valueOf(lightCss, "--color-aviso")).toBe("#B91C1C");
    expect(valueOf(darkCss, "--color-aviso")).toBe("#F87171");
    expect(valueOf(lightCss, "--blur-glass")).toBe("10px");
    expect(css).not.toMatch(/backdrop-filter:\s*blur\((?!var\(--blur-glass\))/);
  });

  it("conserva el desenfoque de la foto de fondo", () => {
    expect(css).toContain("filter: blur(20px)");
    expect(css).toContain("filter: blur(18px)");
  });

  it("withAccentAlpha mantiene el hex de 8 dígitos", () => {
    expect(withAccentAlpha("#B45309", "55")).toBe("#B4530955");
    expect(withAccentAlpha("#B45309", "14")).toBe("#B4530914");
    expect(withAccentAlpha("rgb(180, 83, 9)", "44")).toBe("color-mix(in srgb, rgb(180, 83, 9) 26.7%, transparent)");
  });
});
