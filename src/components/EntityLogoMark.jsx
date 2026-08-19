import { ClubInitialsMark } from "./ClubInitialsMark.jsx";

export function EntityLogoMark({
  logoUrl,
  nombre,
  accentLight,
  accentSoft,
  accentBorder,
  className = "team-context-logo",
  size = 42,
  altPrefix = "Escudo de",
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={nombre ? `${altPrefix} ${nombre}` : "Escudo"}
        className={`club-logo-mark ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <ClubInitialsMark
      clubNombre={nombre}
      accentLight={accentLight}
      accentSoft={accentSoft}
      accentBorder={accentBorder}
      className={className}
    />
  );
}
