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
};

export function getAuthErrorMessage(error) {
  const code = error?.code || "";
  return LOGIN_MESSAGES[code] || "No se pudo iniciar sesión. Inténtalo de nuevo.";
}
