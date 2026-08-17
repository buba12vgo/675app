export const coachEmail = process.env.TEST_COACH_EMAIL || "entrenador@test.com";
export const coachPassword = process.env.TEST_COACH_PASSWORD || "123456";
export const superadminEmail = process.env.TEST_SUPERADMIN_EMAIL || "";
export const superadminPassword = process.env.TEST_SUPERADMIN_PASSWORD || "";

export async function loginWithEmail(page, email, password) {
  await page.goto("/");
  await page.getByPlaceholder("Correo electrónico").fill(email);
  await page.getByPlaceholder("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

export async function loginAsCoach(page) {
  await loginWithEmail(page, coachEmail, coachPassword);
  await page.getByRole("button", { name: "Salir" }).waitFor({ timeout: 20000 });
}

export async function loginAsSuperadmin(page) {
  if (!superadminEmail || !superadminPassword) {
    return false;
  }
  await loginWithEmail(page, superadminEmail, superadminPassword);
  await page.getByText("Superadmin", { exact: false }).waitFor({ timeout: 20000 });
  return true;
}

export function teamTab(page, label) {
  return page.locator("button.app-nav-btn--mobile").filter({ hasText: label });
}

export async function enterFirstTeam(page) {
  const entrar = page.getByRole("button", { name: "Entrar" }).first();
  await entrar.waitFor({ timeout: 15000 });
  await entrar.click();
  await page.locator(".app-team-layout").waitFor({ timeout: 15000 });
  await teamTab(page, "Inicio").waitFor({ state: "visible", timeout: 15000 });
}

export async function openTeamTab(page, label) {
  await teamTab(page, label).click();
}
