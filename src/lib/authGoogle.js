const GOOGLE_REDIRECT_KEY = "675app.googleRedirect";

export function isStandaloneApp(win = typeof window !== "undefined" ? window : null) {
  if (!win) return false;
  const standalone = Boolean(win.matchMedia?.("(display-mode: standalone)")?.matches);
  const iosStandalone = win.navigator?.standalone === true;
  return standalone || iosStandalone;
}

export function googleLoginUsesRedirect(nav = typeof navigator !== "undefined" ? navigator : null, win = typeof window !== "undefined" ? window : null) {
  if (isStandaloneApp(win)) return false;
  if (!nav) return false;
  const ua = nav.userAgent || "";
  const iOS = /iPad|iPhone|iPod/.test(ua) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  return iOS || /Android/i.test(ua);
}

export function markGoogleRedirectPending() {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearGoogleRedirectPending() {
  try {
    sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasGoogleRedirectPending() {
  try {
    return sessionStorage.getItem(GOOGLE_REDIRECT_KEY) === "1";
  } catch {
    return false;
  }
}
