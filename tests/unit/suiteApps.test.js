import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CURRENT_SUITE_APP, SUITE_APPS } from "../../src/lib/suiteApps.js";

const vercel = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));

describe("suite bajo 675basket.com", () => {
  it("enlaza Pizarra y Planner en la misma pestaña, con ruta base", () => {
    expect(SUITE_APPS.map((app) => [app.name, app.href])).toEqual([
      ["675 Basket", "/"],
      ["675 Pizarra", "/whiteboard/"],
      ["675 Planner", "/planner/"],
    ]);
    expect(CURRENT_SUITE_APP).toBe("basket");
  });

  it("reescribe las rutas de la suite antes del fallback de la SPA", () => {
    const sources = vercel.rewrites.map((rule) => rule.source);
    expect(sources.at(-1)).toBe("/(.*)");
    expect(sources.indexOf("/whiteboard")).toBeLessThan(sources.indexOf("/(.*)"));
    expect(sources.indexOf("/whiteboard/:path*")).toBeLessThan(sources.indexOf("/(.*)"));
    expect(sources.indexOf("/planner")).toBeLessThan(sources.indexOf("/(.*)"));
    expect(sources.indexOf("/planner/:path*")).toBeLessThan(sources.indexOf("/(.*)"));
    const bySource = Object.fromEntries(vercel.rewrites.map((rule) => [rule.source, rule.destination]));
    expect(bySource["/whiteboard"]).toBe("https://675whiteboard.vercel.app/whiteboard");
    expect(bySource["/whiteboard/:path*"]).toBe("https://675whiteboard.vercel.app/whiteboard/:path*");
    expect(bySource["/planner"]).toBe("https://675planner.vercel.app/planner");
    expect(bySource["/planner/:path*"]).toBe("https://675planner.vercel.app/planner/:path*");
  });
});
