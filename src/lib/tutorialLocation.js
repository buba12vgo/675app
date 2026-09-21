export const TUTORIAL_PATH = "/como-funciona";
export const TUTORIAL_HASH = "como-funciona";

function normalizePath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}

export function isTutorialLocation(location = typeof window !== "undefined" ? window.location : null) {
  if (!location) return false;
  if (normalizePath(location.pathname) === TUTORIAL_PATH) return true;
  const hash = String(location.hash || "").replace(/^#/, "");
  return hash === TUTORIAL_HASH;
}

export function setTutorialLocation(open, historyApi = typeof window !== "undefined" ? window.history : null, location = typeof window !== "undefined" ? window.location : null) {
  if (!historyApi || !location || typeof historyApi.pushState !== "function") return;
  const onTutorial = isTutorialLocation(location);
  if (open && !onTutorial) {
    historyApi.pushState({ tutorial: true }, "", TUTORIAL_PATH);
    return;
  }
  if (!open && onTutorial) {
    historyApi.pushState({}, "", "/");
  }
}
