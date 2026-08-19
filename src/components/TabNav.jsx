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

  const mobileNavStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  };

  const mobileButtonLayoutStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <nav
      className={isDesktop ? "app-nav-desktop" : "app-nav-mobile"}
      style={isDesktop ? { background: "transparent" } : mobileNavStyle}
    >
      {tabsMenu.map(({ key, label, Icon }) => {
        const active = tab === key;
        const displayLabel = isDesktop ? label : (MOBILE_TAB_LABELS[key] || label);
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTabClick(key)}
            className={isDesktop ? "app-nav-btn app-nav-btn--desktop" : "app-nav-btn app-nav-btn--mobile"}
            style={{
              ...(isDesktop ? {} : mobileButtonLayoutStyle),
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
