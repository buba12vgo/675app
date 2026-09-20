import { describe, it, expect } from "vitest";
import { payloadGuardarUsuarioClub, usuariosTrasGuardarClub } from "../../src/lib/usuariosAdmin.js";

describe("usuariosAdmin", () => {
  it("al asignar coordinador no degrada a los coordinadores del mismo club", () => {
    const usuarios = [
      { id: "c1", clubId: "club-a", rol: "coordinador", email: "c1@test.com" },
      { id: "c2", clubId: "club-a", rol: "entrenador", email: "c2@test.com", equiposFavoritos: ["eq-1"] },
    ];
    const payload = payloadGuardarUsuarioClub({
      clubId: "club-a",
      clubNombre: "Club A",
      rolFinal: "coordinador",
      equiposFavoritos: ["eq-1"],
    });
    const next = usuariosTrasGuardarClub(usuarios, "c2", payload);
    expect(next.filter((u) => u.rol === "coordinador").map((u) => u.id)).toEqual(["c1", "c2"]);
    expect(next.find((u) => u.id === "c1").rol).toBe("coordinador");
  });
});
