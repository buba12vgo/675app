const LOGIN_MESSAGES = {
  "auth/invalid-email": "El correo no es válido.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/user-not-found": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-login-credentials": "Correo o contraseña incorrectos.",
  "auth/too-many-requests": "Demasiados intentos. Prueba más tarde.",
  "auth/popup-closed-by-user": "Has cerrado la ventana de Google.",
  "auth/cancelled-popup-request": "Se canceló el inicio de sesión con Google.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permite ventanas emergentes.",
  "auth/network-request-failed": "Sin conexión. Comprueba internet e inténtalo de nuevo.",
  "auth/account-exists-with-different-credential": "Ese correo ya está registrado con otro método de acceso.",
  "auth/unauthorized-domain": "Este sitio no puede usar el acceso de Google. Entra desde 675basket.com.",
  "auth/operation-not-supported-in-this-environment": "Este navegador no abre la ventana de Google. Prueba con Chrome o Safari.",
  "auth/web-storage-unsupported": "El navegador bloquea el acceso de Google. Permite cookies e inténtalo de nuevo.",
  "auth/internal-error": "Google no pudo completar el acceso. Inténtalo otra vez.",
  "auth/invalid-app-credential": "Google rechazó el acceso de esta web. Inténtalo de nuevo en 675basket.com.",
  "auth/timeout": "Google tardó demasiado. Inténtalo de nuevo.",
  "auth/missing-iframe-start": "El navegador bloqueó el acceso de Google. Permite cookies e inténtalo de nuevo.",
  "auth/user-cancelled": "Has cancelado el acceso con Google.",
  "auth/redirect-cancelled-by-user": "Has cancelado el acceso con Google.",
  "auth/operation-not-allowed": "El acceso con Google no está activado.",
  "auth/app-not-authorized": "Esta web no está autorizada para el acceso de Google.",
};

function readAuthCode(error) {
  if (typeof error?.code === "string" && error.code.startsWith("auth/")) return error.code;
  const match = String(error?.message || "").match(/auth\/[a-z0-9-]+/);
  return match ? match[0] : "";
}

export function getAuthErrorMessage(error) {
  const code = readAuthCode(error);
  if (LOGIN_MESSAGES[code]) return LOGIN_MESSAGES[code];
  if (code) return `No se pudo iniciar sesión (${code.replace("auth/", "")}). Inténtalo de nuevo.`;
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}
