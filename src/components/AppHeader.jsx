import { formatRolLabel } from "../lib/appUtils.js";
import { AppBrand } from "./AppBrand.jsx";
import { DevicePreviewControl } from "./DevicePreviewControl.jsx";
import { ThemeToggleButton } from "./ThemeToggleButton.jsx";
import { IconSettings } from "./icons.jsx";

export function AppHeader({
  compact,
  barStyle,
  inputBorder,
  accent,
  text,
  textMuted,
  accentLight: _accentLight,
  cardBgElevated,
  userData,
  canSeedDemoData,
  seedingDemo,
  onSeedDemo,
  devicePreview,
  onDevicePreviewChange,
  showDevicePreview,
  colorMode,
  onToggleColorMode,
  onOpenOpciones,
  onLogout,
  onGoHome,
}) {
  if (compact) {
    return (
      <header className="app-header app-header--compact">
        <div className="app-header-bar app-header-bar--compact" style={barStyle}>
          <AppBrand text={text} fontSize={20} onGoHome={onGoHome} />
          <div className="app-header-compact-actions">
            <button
              type="button"
              className="app-header-options-btn app-header-options-btn--icon-only"
              onClick={onOpenOpciones}
              aria-label="Opciones"
              style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
            >
              <IconSettings size={18} color={textMuted} />
            </button>
            <ThemeToggleButton colorMode={colorMode} onToggle={onToggleColorMode} />
            <button type="button" className="app-header-logout app-header-logout--inline" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="app-header-bar" style={barStyle}>
        <div className="app-header-row app-header-row--primary">
          <AppBrand text={text} fontSize={22} onGoHome={onGoHome} />
        </div>
        <div className="app-header-row app-header-row--tools">
          <span className="app-header-role">
            <span className="app-header-role__chip">{formatRolLabel(userData?.rol)}</span>
            {userData?.nombre?.trim() ? (
              <span className="app-header-role__name">{userData.nombre.trim()}</span>
            ) : null}
          </span>
          <button
            type="button"
            className="app-header-options-btn"
            onClick={onOpenOpciones}
            style={{ color: textMuted, borderColor: inputBorder, background: cardBgElevated }}
            aria-label="Opciones"
          >
            <IconSettings size={16} color={textMuted} />
            <span className="app-header-options-btn__label">Opciones</span>
          </button>
          {canSeedDemoData && (
            <button
              type="button"
              className="app-header-seed-btn"
              onClick={onSeedDemo}
              disabled={seedingDemo}
              style={{
                color: accent,
                borderColor: inputBorder,
                background: cardBgElevated,
                opacity: seedingDemo ? 0.75 : 1,
                cursor: seedingDemo ? "wait" : "pointer",
              }}
            >
              <span className="app-header-seed-btn__long">{seedingDemo ? "Generando…" : "Datos prueba"}</span>
              <span className="app-header-seed-btn__short">{seedingDemo ? "…" : "Demo"}</span>
            </button>
          )}
          {showDevicePreview ? (
            <DevicePreviewControl mode={devicePreview} onChange={onDevicePreviewChange} />
          ) : null}
          <ThemeToggleButton colorMode={colorMode} onToggle={onToggleColorMode} />
          <button type="button" className="app-header-logout app-header-logout--inline" onClick={onLogout} tabIndex={0}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
