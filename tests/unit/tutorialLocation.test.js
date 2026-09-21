import { describe, it, expect } from "vitest";
import { isTutorialLocation, setTutorialLocation, TUTORIAL_PATH } from "../../src/lib/tutorialLocation.js";

describe("tutorialLocation", () => {
  it("detecta /como-funciona y el hash", () => {
    expect(isTutorialLocation({ pathname: "/como-funciona", hash: "" })).toBe(true);
    expect(isTutorialLocation({ pathname: "/como-funciona/", hash: "#tutorial-entrar" })).toBe(true);
    expect(isTutorialLocation({ pathname: "/", hash: "#como-funciona" })).toBe(true);
    expect(isTutorialLocation({ pathname: "/", hash: "#tutorial-entrar" })).toBe(false);
    expect(isTutorialLocation({ pathname: "/", hash: "" })).toBe(false);
  });

  it("abre y cierra la ruta del tutorial", () => {
    const calls = [];
    const historyApi = { pushState: (...args) => calls.push(args) };
    setTutorialLocation(true, historyApi, { pathname: "/", hash: "" });
    expect(calls[0][2]).toBe(TUTORIAL_PATH);
    setTutorialLocation(false, historyApi, { pathname: "/como-funciona", hash: "" });
    expect(calls[1][2]).toBe("/");
  });
});
