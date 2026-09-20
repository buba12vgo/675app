import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("AUTH-01 muestra formulario de acceso", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Correo electrónico")).toBeVisible();
    await expect(page.getByPlaceholder("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: /Iniciar sesión con Google/i })).toBeVisible();
  });

  test("AUTH-03 credenciales inválidas muestran error", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Correo electrónico").fill("noexiste@test.com");
    await page.getByPlaceholder("Contraseña").fill("wrongpass");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.locator("text=/Firebase|invalid|credencial|password/i").first()).toBeVisible({ timeout: 10000 });
  });

  test("AUTH-06 abre Cómo funciona la app", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Cómo funciona la app" }).click();
    await expect(page.getByRole("heading", { name: "Cómo funciona la app" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "6. Dashboard" })).toBeVisible();
    await expect(page.getByText(/Jugador\/a/)).toBeVisible();
    await expect(page.getByText(/puede generar datos de prueba/i)).toHaveCount(0);
    await page.getByRole("button", { name: "Volver" }).click();
    await expect(page.getByPlaceholder("Correo electrónico")).toBeVisible();
  });
});
