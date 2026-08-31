import { describe, it, expect, beforeEach, vi } from "vitest";
import { DEFAULT_THEME, getStoredTheme } from "../../src/theme.js";

function mockLocalStorage(initial = null) {
  let value = initial;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((key, next) => {
      value = next;
    }),
  };
}

describe("getStoredTheme", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("devuelve modo claro por defecto sin preferencia guardada", () => {
    vi.stubGlobal("localStorage", mockLocalStorage());
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    expect(getStoredTheme()).toBe("light");
  });

  it("respeta el tema guardado en localStorage", () => {
    vi.stubGlobal("localStorage", mockLocalStorage("dark"));
    expect(getStoredTheme()).toBe("dark");

    vi.stubGlobal("localStorage", mockLocalStorage("light"));
    expect(getStoredTheme()).toBe("light");
  });

  it("ignora valores inválidos y usa modo claro", () => {
    vi.stubGlobal("localStorage", mockLocalStorage("system"));
    expect(getStoredTheme()).toBe("light");
  });
});
