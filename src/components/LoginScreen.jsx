import { BlurredBackground } from "./BlurredBackground.jsx";
import { ThemeToggleButton } from "./ThemeToggleButton.jsx";
import { AppBrand } from "./AppBrand.jsx";

export function LoginScreen({
  isDarkMode,
  colorMode,
  onToggleColorMode,
  text,
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
  return (
    <div className="login-page">
      <BlurredBackground isDark={isDarkMode} />
      <div className="login-page__toolbar">
        <ThemeToggleButton colorMode={colorMode} onToggle={onToggleColorMode} />
      </div>
      <div className="login-card">
        <AppBrand text={text} fontSize={28} markSize={52} />
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
            <input
              id="login-password"
              className="login-field__input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-submit">
            Ingresar
          </button>
        </form>
        <p className="login-divider">o continúa con</p>
        <button type="button" className="login-google" onClick={onGoogleLogin}>
          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
            <g>
              <path fill="#4285F4" d="M45.34 24.49c0-1.59-.14-3.16-.41-4.66H24v8.84h12.06c-.52 2.72-2.18 5.04-4.72 6.59v5.47h7.62c4.47-4.11 7.05-10.16 7.05-16.24z" />
              <path fill="#34A853" d="M24 47c6.17 0 11.39-2.05 15.18-5.56l-7.62-5.47c-2.12 1.43-4.84 2.26-7.56 2.26-5.8 0-10.72-3.92-12.5-9.2h-7.7v5.75C7.5 42.09 15.17 47 24 47z" />
              <path fill="#FBBC05" d="M11.5 28.03A13.63 13.63 0 0 1 10 24c0-1.39.24-2.75.5-4.03v-5.75h-7.7A23.77 23.77 0 0 0 0 24c0 3.74.9 7.29 2.5 10.3l7.7-5.75z" />
              <path fill="#EA4335" d="M24 9.5c3.36 0 6.37 1.15 8.75 3.42l6.56-6.41C35.37 2.05 30.15 0 24 0 15.17 0 7.5 4.91 2.5 13.7l7.7 5.75c1.78-5.28 6.7-9.2 12.5-9.2z" />
            </g>
          </svg>
          Iniciar sesión con Google
        </button>
        {errorMsg && (
          <div className="login-error" role="alert" style={{ color: error }}>
            {errorMsg}
          </div>
        )}
        {onOpenTutorial ? (
          <button type="button" className="login-tutorial-link" onClick={onOpenTutorial}>
            Cómo funciona la app
          </button>
        ) : null}
      </div>
    </div>
  );
}
