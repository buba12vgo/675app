export function BlurredBackground({ isDark = true }) {
  return (
    <div
      className={`app-backdrop ${isDark ? "app-backdrop--dark" : "app-backdrop--light"}`}
      aria-hidden="true"
    >
      <div className="app-backdrop__photo" />
      <div className="app-backdrop__court" />
      <div className="app-backdrop__veil" />
    </div>
  );
}
