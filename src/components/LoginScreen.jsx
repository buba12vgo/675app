import { BlurredBackground } from "./BlurredBackground.jsx";
import { ThemeToggleButton } from "./ThemeToggleButton.jsx";
import { AppBrand } from "./AppBrand.jsx";

export function LoginScreen({
  isDarkMode,
  colorMode,
  onToggleColorMode,
  glassCardStyle,
  inputBorder,
  cardShadow,
  accent,
  text,
  textSecondary,
  textMuted,
  inputBg,
  surface,
  error,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onEmailLogin,
  onGoogleLogin,
  errorMsg,
}) {
  return (
    <div className="login-page" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <BlurredBackground isDark={isDarkMode} />
      <div className="login-page__toolbar">
        <ThemeToggleButton colorMode={colorMode} onToggle={onToggleColorMode} />
      </div>
      <div
        className="login-card"
        style={{
          ...glassCardStyle,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          border: `1px solid ${inputBorder}`,
          boxShadow: cardShadow,
        }}
      >
        <AppBrand accent={accent} text={text} fontSize={26} />
        <div style={{ color: textSecondary, fontSize: 16, marginTop: 4, fontWeight: 500 }}>
          Inicia sesión para continuar
        </div>
        <form
          onSubmit={onEmailLogin}
          style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}
          autoComplete="off"
        >
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoComplete="username"
            style={{
              padding: "13px 16px",
              fontSize: 15,
              background: inputBg,
              color: text,
              border: `1px solid ${inputBorder}`,
              borderRadius: 12,
              outline: "none",
              transition: "border .18s",
            }}
            onFocus={(e) => {
              e.target.style.border = `1.5px solid ${accent}`;
            }}
            onBlur={(e) => {
              e.target.style.border = `1px solid ${inputBorder}`;
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              padding: "13px 16px",
              fontSize: 15,
              background: inputBg,
              color: text,
              border: `1px solid ${inputBorder}`,
              borderRadius: 12,
              outline: "none",
              transition: "border .18s",
            }}
            onFocus={(e) => {
              e.target.style.border = `1.5px solid ${accent}`;
            }}
            onBlur={(e) => {
              e.target.style.border = `1px solid ${inputBorder}`;
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "13px 0",
              background: accent,
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all .12s",
              boxShadow: "0 4px 16px rgba(100, 116, 139, 0.35)",
              letterSpacing: ".2px",
            }}
          >
            Ingresar
          </button>
        </form>
        <div style={{ textAlign: "center", color: textMuted, margin: "4px 0", fontSize: 12, fontWeight: 500 }}>
          — o continúa con —
        </div>
        <button
          type="button"
          onClick={onGoogleLogin}
          style={{
            background: surface,
            color: text,
            border: `1px solid ${inputBorder}`,
            padding: "12px 0",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
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
          <div
            role="alert"
            style={{
              color: error,
              marginTop: 8,
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 500,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
