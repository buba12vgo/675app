import { test, expect } from "@playwright/test";
import { loginAsCoach, enterFirstTeam, openTeamTab } from "./helpers/auth.js";

test.describe("Entrenador", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page);
  });

  test("COACH-02 ve equipos de su club", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Entrar" }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Equipos del Club/i)).toBeVisible();
  });

  test("COACH-05 y TEAM-01 navegan todas las pestañas del equipo", async ({ page }) => {
    await enterFirstTeam(page);

    for (const tab of ["Inicio", "Calendario", "Estadísticas", "Plantilla"]) {
      await openTeamTab(page, tab);
      await expect(page.locator("button.app-nav-btn--mobile").filter({ hasText: tab })).toBeVisible();
    }
  });

  test("TEAM-02 inicio muestra tarjetas de eventos", async ({ page }) => {
    await enterFirstTeam(page);
    await openTeamTab(page, "Inicio");
    await expect(page.getByText("Próximo entreno")).toBeVisible();
    await expect(page.getByText("Próximo partido")).toBeVisible();
  });

  test("TEAM-03 calendario muestra grilla", async ({ page }) => {
    await enterFirstTeam(page);
    await openTeamTab(page, "Calendario");
    await expect(page.getByText("Gestión de Calendario")).toBeVisible();
    await expect(page.getByText("Entreno")).toBeVisible();
    await expect(page.getByText("Partido")).toBeVisible();
  });

  test("TEAM-05 estadísticas muestra filtros de periodo", async ({ page }) => {
    await enterFirstTeam(page);
    await openTeamTab(page, "Estadísticas");
    await expect(page.getByRole("button", { name: "Semanal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mensual" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Personalizado" })).toBeVisible();
  });

  test("TEAM-07 plantilla carga sin error de permisos", async ({ page }) => {
    await enterFirstTeam(page);
    await openTeamTab(page, "Plantilla");
    await expect(page.getByText(/Plantilla de Jugador(as|es)/)).toBeVisible();
    await expect(page.getByText(/No tienes permiso/i)).not.toBeVisible();
    await expect(page.getByPlaceholder("Nombre")).toBeVisible();
  });

  test("TEAM-09 opciones en header muestra perfil", async ({ page }) => {
    await enterFirstTeam(page);
    await page.getByRole("button", { name: "Opciones" }).click();
    await expect(page.getByRole("heading", { name: "Opciones" })).toBeVisible();
    await expect(page.getByText("Tu club")).toBeVisible();
  });

  test("TEAM-09b opciones no está en menú inferior", async ({ page }) => {
    await enterFirstTeam(page);
    await expect(page.locator("button.app-nav-btn--mobile").filter({ hasText: "Opciones" })).toHaveCount(0);
    await expect(page.locator("button.app-nav-btn--mobile").filter({ hasText: "Opc." })).toHaveCount(0);
  });

  test("UI-01 toggle tema claro/oscuro", async ({ page }) => {
    const html = page.locator("html");
    const wasDark = await html.evaluate((el) => el.classList.contains("dark"));
    await page.getByTitle(/Modo claro|Modo oscuro/i).click();
    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    expect(isDark).toBe(!wasDark);
  });

  test("UI-02 preview dispositivos", async ({ page }) => {
    await expect(page.locator(".app-shell")).toHaveAttribute("data-device-preview", "mobile");
    await page.getByRole("button", { name: "Vista tablet (768px)" }).click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-device-preview", "tablet");
    await page.getByRole("button", { name: "Vista PC (1200px)" }).click();
    await expect(page.locator(".app-shell")).toHaveAttribute("data-device-preview", "desktop");
  });
});
