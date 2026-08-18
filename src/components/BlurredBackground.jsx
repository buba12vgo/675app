export function BlurredBackground({ isDark = true }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-25%",
          backgroundImage: "url(/bg-basketball.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: isDark
            ? "blur(56px) saturate(0.25) brightness(0.5) hue-rotate(185deg)"
            : "blur(56px) saturate(0.45) brightness(0.92) hue-rotate(185deg)",
          transform: "scale(1.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "linear-gradient(160deg, rgba(11,17,32,0.94) 0%, rgba(11,17,32,0.82) 50%, rgba(42,101,112,0.14) 100%)"
            : "linear-gradient(160deg, rgba(248,250,252,0.94) 0%, rgba(241,245,249,0.88) 50%, rgba(42,101,112,0.10) 100%)",
        }}
      />
    </div>
  );
}
