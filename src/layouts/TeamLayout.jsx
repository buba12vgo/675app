import { formatTipoCanasta, formatGeneroEquipo } from "../lib/appUtils.js";
import { TeamContextHeader } from "../components/TeamContextHeader.jsx";
import { TabNav } from "../components/TabNav.jsx";

export function TeamLayout({
  clubNombre,
  equipoNombre,
  equipoMeta,
  onCambiarEquipo,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  textSecondary,
  textMuted,
  tabsMenu,
  tab,
  setTab,
  accent,
  inputBorder,
  tabContent,
}) {
  const contextProps = {
    clubNombre,
    equipoNombre,
    equipoMeta,
    onCambiarEquipo,
    accentLight,
    accentSoft,
    accentBorder,
    text,
    textSecondary,
    textMuted,
  };
  const tabNavProps = { tabsMenu, tab, setTab, accent, accentSoft, textMuted, inputBorder };

  return (
    <div className="app-team-layout">
      <aside className="app-team-sidebar">
        <TeamContextHeader {...contextProps} variant="sidebar" />
        <TabNav {...tabNavProps} variant="desktop" />
      </aside>
      <div className="app-team-content">
        <TeamContextHeader {...contextProps} variant="compact" />
        <div className="app-tab-panel">
          {tabContent ?? (
            <div style={{ color: textMuted, textAlign: "center", padding: "24px 12px" }}>
              Selecciona una sección del menú.
            </div>
          )}
        </div>
        <div className="app-mobile-nav-spacer" aria-hidden="true" />
        <TabNav {...tabNavProps} variant="mobile" />
      </div>
    </div>
  );
}
