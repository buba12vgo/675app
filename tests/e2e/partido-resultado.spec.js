import { test, expect } from "@playwright/test";
import { loginAsCoach } from "./helpers/auth.js";

async function ensureTeamList(page) {
  // Si ya estamos dentro de un equipo, salir
  const cambiar = page.getByRole("button", { name: "Cambiar equipo" });
  if (await cambiar.isVisible().catch(() => false)) {
    await cambiar.click();
  }

  const verTodos = page.getByRole("button", { name: "Ver todos los equipos del club" });
  if (await verTodos.isVisible().catch(() => false)) {
    await verTodos.click();
  }

  await expect(page.getByText(/Cargando equipos/i)).toHaveCount(0, { timeout: 30000 });
  const entrar = page.getByRole("button", { name: "Entrar" }).first();
  await expect(entrar).toBeVisible({ timeout: 30000 });
  await entrar.click();
  await page.locator(".app-team-layout").waitFor({ timeout: 15000 });
}

async function openTab(page, label) {
  const mobileAliases = { Calendario: "Agenda", Estadísticas: "Stats" };
  const desktop = page
    .locator("aside button, .app-team-sidebar button")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .first();
  if (await desktop.isVisible().catch(() => false)) {
    await desktop.click();
    return;
  }
  const mobileLabel = mobileAliases[label] || label;
  await page.locator("button.app-nav-btn--mobile").filter({ hasText: mobileLabel }).click();
}

test.describe("Partido resultado", () => {
  test("muestra campos de resultado y guarda marcador", async ({ page }) => {
    await loginAsCoach(page);
    await ensureTeamList(page);

    await openTab(page, "Inicio");
    const programar = page.getByRole("button", { name: "+ Programar partido" });
    const verPartido = page.locator(".home-event-card--partido").getByRole("button", {
      name: "Ver en calendario",
    });
    if (await programar.isVisible().catch(() => false)) {
      await programar.click();
    } else {
      await expect(verPartido).toBeVisible({ timeout: 15000 });
      await verPartido.click();
    }

    await expect(page.getByText("Información del partido")).toBeVisible({ timeout: 20000 });
    const puntosFavor = page.locator("#puntos-favor");
    const puntosContra = page.locator("#puntos-contra");
    const etiquetaFavor = page.locator('label[for="puntos-favor"]');
    const etiquetaContra = page.locator('label[for="puntos-contra"]');
    await expect(puntosFavor).toBeVisible();
    await expect(puntosContra).toBeVisible();
    const clubNombre = (await page.locator(".team-context-club").first().innerText().catch(() => "")).trim();
    if (clubNombre) {
      await expect(etiquetaFavor).toHaveText(clubNombre);
    }

    await page.screenshot({
      path: "/opt/cursor/artifacts/partido_resultado_campos.png",
      fullPage: false,
    });

    await page.getByPlaceholder("Nombre del equipo rival").fill("Rival E2E Resultado");
    await expect(etiquetaContra).toHaveText("Rival E2E Resultado");
    await puntosFavor.fill("78");
    await puntosContra.fill("65");
    await expect(page.getByText("78-65 · Victoria")).toBeVisible();

    await page.getByRole("button", { name: "Guardar Partido" }).click();
    await expect(page.getByText("Guardado")).toBeVisible({ timeout: 15000 });

    await expect(puntosFavor).toHaveValue("78");
    await expect(puntosContra).toHaveValue("65");

    await page.screenshot({
      path: "/opt/cursor/artifacts/partido_resultado_guardado.png",
      fullPage: false,
    });

    const volver = page.getByRole("button", { name: /Volver al día/i });
    if (await volver.isVisible().catch(() => false)) {
      await volver.click();
      await expect(page.getByText(/78-65/)).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: "/opt/cursor/artifacts/partido_resultado_lista_dia.png",
        fullPage: false,
      });
    }
  });
});
