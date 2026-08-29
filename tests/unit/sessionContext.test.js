import { describe, it, expect, beforeEach } from "vitest";
import {
  SESSION_CONTEXT_KEY,
  parseSessionContext,
  getSessionContext,
  persistSessionContext,
  clearSessionContext,
} from "../../src/lib/sessionContext.js";

function mockSessionStorage() {
  const store = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

describe("parseSessionContext", () => {
  it("rechaza payloads sin usuario", () => {
    expect(parseSessionContext({ tab: "home", equipoId: "eq-1" })).toBeNull();
    expect(parseSessionContext(null)).toBeNull();
  });

  it("normaliza pestaña inválida a Inicio", () => {
    expect(parseSessionContext({ userId: "u1", tab: "admin", equipoId: "eq-1" })).toEqual({
      userId: "u1",
      equipoId: "eq-1",
      tab: "home",
    });
  });

  it("conserva pestaña y equipo válidos", () => {
    expect(parseSessionContext({ userId: "u1", tab: "sesiones", equipoId: "eq-1" })).toEqual({
      userId: "u1",
      equipoId: "eq-1",
      tab: "sesiones",
    });
  });
});

describe("sessionStorage de contexto", () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it("guarda y recupera el contexto", () => {
    persistSessionContext({ userId: "u1", equipoId: "eq-9", tab: "plantilla" });
    expect(getSessionContext()).toEqual({
      userId: "u1",
      equipoId: "eq-9",
      tab: "plantilla",
    });
    expect(JSON.parse(sessionStorage.getItem(SESSION_CONTEXT_KEY)).tab).toBe("plantilla");
  });

  it("borra el contexto", () => {
    persistSessionContext({ userId: "u1", tab: "home" });
    clearSessionContext();
    expect(getSessionContext()).toBeNull();
  });
});
