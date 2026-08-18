import { getClubInitials } from "../lib/appUtils.js";

export function ClubInitialsMark({ clubNombre, accentLight, accentSoft, accentBorder, className = "team-context-logo" }) {
  return (
    <div
      className={className}
      aria-hidden={!clubNombre}
      style={{
        background: accentSoft,
        color: accentLight,
        border: `1px solid ${accentBorder}`,
      }}
    >
      {getClubInitials(clubNombre)}
    </div>
  );
}
