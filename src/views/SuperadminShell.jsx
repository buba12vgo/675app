import { SuperadminPanel } from "../components/SuperadminPanel.jsx";
import { TeamLayout } from "../layouts/TeamLayout.jsx";

export function SuperadminShell({
  equipoActivo,
  teamLayoutProps,
  superadminVista,
  onSuperadminVistaChange,
  accent,
  accentLight,
  accentSoft,
  textMuted,
  inputBorder,
  cardBgElevated,
  userData,
  clubesPanelProps,
  equiposPanelProps,
  superadminUsuariosProps,
}) {
  if (equipoActivo) {
    return <TeamLayout {...teamLayoutProps} />;
  }

  return (
    <SuperadminPanel
      superadminVista={superadminVista}
      onSuperadminVistaChange={onSuperadminVistaChange}
      accent={accent}
      accentLight={accentLight}
      accentSoft={accentSoft}
      textMuted={textMuted}
      inputBorder={inputBorder}
      cardBgElevated={cardBgElevated}
      userData={userData}
      clubesPanelProps={clubesPanelProps}
      equiposPanelProps={equiposPanelProps}
      superadminUsuariosProps={superadminUsuariosProps}
    />
  );
}
