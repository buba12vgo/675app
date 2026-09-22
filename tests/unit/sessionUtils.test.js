import { describe, it, expect } from "vitest";
import {
  SesionAlreadyExistsError,
  isSesionAlreadyExistsError,
  mensajeErrorCrearSesion,
} from "../../src/lib/sessionUtils.js";

describe("mensajeErrorCrearSesion", () => {
  it("distingue entreno, físico y partido cuando ya existe", () => {
    const exists = new SesionAlreadyExistsError();
    expect(isSesionAlreadyExistsError(exists)).toBe(true);
    expect(mensajeErrorCrearSesion(exists, "entreno")).toBe("Ya hay un entreno este día.");
    expect(mensajeErrorCrearSesion(exists, "fisico")).toBe("Ya hay un entrenamiento físico este día.");
    expect(mensajeErrorCrearSesion(exists, "partido")).toBe("No se pudo crear el partido. Inténtalo de nuevo.");
  });

  it("trata permission-denied como posible sesión ya creada", () => {
    expect(mensajeErrorCrearSesion({ code: "permission-denied" }, "entreno")).toBe(
      "No se pudo crear la sesión. Puede que ya exista."
    );
  });

  it("usa el mensaje genérico en otros errores", () => {
    expect(mensajeErrorCrearSesion(new Error("offline"), "entreno")).toBe("Error creando la sesión.");
  });
});
