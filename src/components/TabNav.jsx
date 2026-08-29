const MOBILE_TAB_LABELS = {
  home: "Inicio",
  sesiones: "Agenda",
  players: "Stats",
  plantilla: "Plantilla",
};

export function TabNav({ tabsMenu, tab, setTab, variant = "mobile" }) {
  const isDesktop = variant === "desktop";

  const handleTabClick = (key) => {
    setTab(key);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className={isDesktop ? "app-nav-desktop" : "app-nav-mobile"}>
      {tabsMenu.map(({ key, label, Icon }) => {
        const active = tab === key;
        const displayLabel = isDesktop ? label : (MOBILE_TAB_LABELS[key] || label);
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTabClick(key)}
            className={`app-nav-btn ${isDesktop ? "app-nav-btn--desktop" : "app-nav-btn--mobile"}${active ? " app-nav-btn--active" : ""}`}
            tabIndex={0}
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={isDesktop ? 20 : 22} />
            <span className="app-nav-btn__label">{displayLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
