const MOBILE_TAB_LABELS = {
  home: "Inicio",
  sesiones: "Calend.",
  players: "Estad.",
  plantilla: "Plant.",
};

export function TabNav({ tabsMenu, tab, setTab, accent, accentSoft, textMuted, variant = "mobile" }) {
  const isDesktop = variant === "desktop";

  const handleTabClick = (key) => {
    setTab(key);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={isDesktop ? "app-nav-desktop" : "app-nav-mobile"}
      style={isDesktop ? { background: "transparent" } : undefined}
    >
      {tabsMenu.map(({ key, label, Icon }) => {
        const active = tab === key;
        const displayLabel = isDesktop ? label : (MOBILE_TAB_LABELS[key] || label);
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTabClick(key)}
            className={`app-nav-btn ${isDesktop ? "app-nav-btn--desktop" : "app-nav-btn--mobile"}`}
            style={{
              background: active ? accentSoft : "transparent",
              color: active ? accent : textMuted,
              fontWeight: active ? 700 : 500,
            }}
            tabIndex={0}
            title={label}
          >
            <Icon size={isDesktop ? 20 : 20} color={active ? accent : textMuted} />
            <span className="app-nav-btn__label">{displayLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
