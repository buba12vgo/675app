export const CLUB_LOGO_PRESETS = [
  { match: /novo\s*basket/i, url: "/logos/novo-basket.png" },
  { match: /salesianos/i, url: "/logos/salesianos.png" },
  { match: /celta/i, url: "/logos/celta-femenino.png" },
];

export function getPresetClubLogoUrl(nombre) {
  if (!nombre) return null;
  const preset = CLUB_LOGO_PRESETS.find(({ match }) => match.test(nombre));
  return preset?.url ?? null;
}

export function resolveClubLogoUrl({ logoUrl, nombre }) {
  if (logoUrl) return logoUrl;
  return getPresetClubLogoUrl(nombre);
}
