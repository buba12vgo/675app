import { useEffect, useState } from "react";
import { ClubInitialsMark } from "./ClubInitialsMark.jsx";
import { getLogoFrameStyle } from "../lib/clubLogoPresets.js";

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
    const { variant, background } = getLogoFrameStyle({ logoUrl, nombre });
    const frameClass =
      variant === "circle" ? "club-logo-frame club-logo-frame--circle" : "club-logo-frame club-logo-frame--rounded";

    return (
      <div
        className={`${frameClass} ${className}`}
        style={{ width: size, height: size, background }}
      >
        <img
          src={logoUrl}
          alt={nombre ? `${altPrefix} ${nombre}` : "Escudo"}
          className="club-logo-mark"
          onError={() => setImageFailed(true)}
        />
      </div>
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
