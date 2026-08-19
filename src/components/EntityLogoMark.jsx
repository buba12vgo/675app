import { useEffect, useState } from "react";
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
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [logoUrl]);

  if (logoUrl && !imageFailed) {
    return (
      <img
        src={logoUrl}
        alt={nombre ? `${altPrefix} ${nombre}` : "Escudo"}
        className={`club-logo-mark ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
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
