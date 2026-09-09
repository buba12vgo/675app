import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("AUTH-01 muestra formulario de acceso", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Correo electrónico")).toBeVisible();
    await expect(page.getByPlaceholder("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: /Iniciar sesión con Google/i })).toBeVisible();
  });

  test("AUTH-02 carga en modo claro por defecto", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("theme"));
    await page.goto("/");
    const isDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));
    expect(isDark).toBe(false);
  });

  test("AUTH-03 credenciales inválidas muestran error", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Correo electrónico").fill("noexiste@test.com");
    await page.getByPlaceholder("Contraseña").fill("wrongpass");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.locator("text=/Firebase|invalid|credencial|password/i").first()).toBeVisible({ timeout: 10000 });
  });
});
