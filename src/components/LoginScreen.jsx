import { useState } from "react";
import { BlurredBackground } from "./BlurredBackground.jsx";
import { CourtWatermark } from "./CourtWatermark.jsx";
import { ThemeToggleButton } from "./ThemeToggleButton.jsx";
import { IconBasketball, IconEye, IconEyeOff, IconHelp } from "./icons.jsx";

export function LoginScreen({
  isDarkMode,
  colorMode,
  onToggleColorMode,
  text: _text,
  error,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onEmailLogin,
  onGoogleLogin,
  errorMsg,
  onOpenTutorial,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <BlurredBackground isDark={isDarkMode} />
      <CourtWatermark className="login-court" />
      <header className="login-topbar">
        <div className="login-topbar__brand">
          <IconBasketball size={22} />
          <span>675app</span>
        </div>
        <ThemeToggleButton colorMode={colorMode} onToggle={onToggleColorMode} />
      </header>
      <main className="login-main">
        <div className="login-card">
          <div className="login-card__emblem" aria-hidden="true">
            <span className="login-card__emblem-ring" />
            <IconBasketball size={28} />
          </div>
          <p className="login-card__wordmark">
            675<span>app</span>
          </p>
          <p className="login-card__lead">Entra para seguir con tu equipo</p>
          <form className="login-form" onSubmit={onEmailLogin} autoComplete="off">
            <div className="login-field">
              <label className="login-field__label" htmlFor="login-email">
                Correo electrónico
              </label>
              <input
                id="login-email"
                className="login-field__input"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="login-field">
              <label className="login-field__label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="login-field__control">
                <input
                  id="login-password"
                  className="login-field__input login-field__input--with-toggle"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="login-submit">
              Ingresar
            </button>
          </form>
          <p className="login-divider">o continúa con</p>
          <button type="button" className="login-google" onClick={onGoogleLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Iniciar sesión con Google
          </button>
          {errorMsg && (
            <div className="login-error" role="alert" style={{ color: error }}>
              {errorMsg}
            </div>
          )}
        </div>
      </main>
      <footer className="login-footer">
        {onOpenTutorial ? (
          <button type="button" className="login-tutorial-link" onClick={onOpenTutorial}>
            <IconHelp size={16} />
            Cómo funciona la app
          </button>
        ) : null}
        <p className="login-footer__kicker">Pizarra táctica · Categorías base · Club 675</p>
      </footer>
    </div>
  );
}
