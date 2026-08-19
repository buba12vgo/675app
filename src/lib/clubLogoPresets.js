export const CLUB_LOGO_PRESETS = [
  {
    match: /novo\s*basket/i,
    url: "/logos/novo-basket.png",
    variant: "circle",
    background: "#ffffff",
  },
  {
    match: /salesianos/i,
    url: "/logos/salesianos.png",
    variant: "rounded",
    background: "#000000",
  },
  {
    match: /celta/i,
    url: "/logos/celta-femenino.png",
    variant: "circle",
    background: "#6eb4d6",
  },
];

export function getPresetClubLogoUrl(nombre) {
  if (!nombre) return null;
  const preset = CLUB_LOGO_PRESETS.find(({ match }) => match.test(nombre));
  return preset?.url ?? null;
}

export function getLogoFrameStyle({ logoUrl, nombre }) {
  const presetByName = nombre
    ? CLUB_LOGO_PRESETS.find(({ match }) => match.test(nombre))
    : null;
  const presetByUrl =
    logoUrl && typeof logoUrl === "string"
      ? CLUB_LOGO_PRESETS.find(({ url }) => logoUrl.includes(url))
      : null;
  const preset = presetByName || presetByUrl;

  if (preset) {
    return {
      variant: preset.variant,
      background: preset.background,
    };
  }

  return {
    variant: "rounded",
    background: "var(--color-card-elevated)",
  };
}

export function resolveClubLogoUrl({ logoUrl, nombre }) {
  if (logoUrl) return logoUrl;
  return getPresetClubLogoUrl(nombre);
}
