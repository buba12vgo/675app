import { test, expect } from "@playwright/test";
import { loginAsSuperadmin, superadminEmail } from "./helpers/auth.js";

test.describe("Superadmin", () => {
  test.skip(!superadminEmail, "Define TEST_SUPERADMIN_EMAIL y TEST_SUPERADMIN_PASSWORD");

  test.beforeEach(async ({ page }) => {
    const ok = await loginAsSuperadmin(page);
    test.skip(!ok, "No se pudo iniciar sesión como superadmin");
  });

  test("SA-01 panel clubes y equipos", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Clubes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Equipos" })).toBeVisible();
  });

  test("SA-07 botón datos de prueba visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Datos prueba/i })).toBeVisible();
  });

  test("SA-05 filtro equipos todos / mi club", async ({ page }) => {
    await page.getByRole("button", { name: "Equipos" }).click();
    await expect(page.getByRole("button", { name: /Todos los equipos/i })).toBeVisible();
  });
});
