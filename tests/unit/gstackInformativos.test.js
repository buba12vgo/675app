import { describe, it, expect } from "vitest";
import { mergeDocsById } from "../../src/lib/deleteClubCascade.js";
import { sanitizeSvgMarkup } from "../../src/lib/logoImage.js";
import { uniqueSessionKey, createSesionDocId } from "../../src/lib/appUtils.js";

describe("mergeDocsById", () => {
  it("une snapshots y deja un doc por id", () => {
    const a = { docs: [{ id: "s1" }, { id: "s2" }] };
    const b = { docs: [{ id: "s2" }, { id: "s3" }] };
    expect(mergeDocsById([a, b]).map((d) => d.id).sort()).toEqual(["s1", "s2", "s3"]);
  });
});

describe("sanitizeSvgMarkup", () => {
  it("quita script, foreignObject y handlers", () => {
    const dirty = `<svg><script>alert(1)</script><g onclick="alert(1)"><rect /></g><foreignObject>x</foreignObject></svg>`;
    const clean = sanitizeSvgMarkup(dirty);
    expect(clean).not.toMatch(/script/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/foreignObject/i);
    expect(clean).toContain("<svg>");
  });
});

describe("uniqueSessionKey", () => {
  it("genera claves distintas sin Math.random", () => {
    const a = uniqueSessionKey();
    const b = uniqueSessionKey();
    expect(a).toMatch(/^[a-z0-9]+$/i);
    expect(a.length).toBeGreaterThanOrEqual(8);
    expect(a).not.toBe(b);
    expect(createSesionDocId("eq1", "2026-10-05", "partido")).toMatch(/^eq1_2026-10-05_partido_/);
  });
});
