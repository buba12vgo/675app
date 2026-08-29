export const SESSION_CONTEXT_KEY = "675app.session";

export const TEAM_TABS = ["home", "sesiones", "players", "plantilla"];

function canUseStorage() {
  return typeof sessionStorage !== "undefined";
}

export function parseSessionContext(raw) {
  if (!raw || typeof raw !== "object") return null;
  const userId = typeof raw.userId === "string" && raw.userId ? raw.userId : null;
  const equipoId = typeof raw.equipoId === "string" && raw.equipoId ? raw.equipoId : null;
  const tab = TEAM_TABS.includes(raw.tab) ? raw.tab : "home";
  if (!userId) return null;
  return { userId, equipoId, tab };
}

export function getSessionContext() {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CONTEXT_KEY);
    if (!raw) return null;
    return parseSessionContext(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistSessionContext({ userId, equipoId = null, tab = "home" }) {
  if (!canUseStorage()) return;
  const next = parseSessionContext({ userId, equipoId, tab });
  if (!next) return;
  try {
    sessionStorage.setItem(SESSION_CONTEXT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearSessionContext() {
  if (!canUseStorage()) return;
  try {
    sessionStorage.removeItem(SESSION_CONTEXT_KEY);
  } catch {
    /* ignore */
  }
}
