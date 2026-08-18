import { TeamLayout } from "../layouts/TeamLayout.jsx";
import { CoordinadorDashboard } from "./CoordinadorDashboard.jsx";
import { EntrenadorEquiposView } from "./EntrenadorEquiposView.jsx";
import { SolicitarClubView } from "./SolicitarClubView.jsx";

export function ClubMemberContent({
  hasClub,
  equipoActivo,
  esCoordinador,
  teamLayoutProps,
  coordinadorDashboardProps,
  entrenadorEquiposProps,
  solicitarClubProps,
}) {
  if (!hasClub) {
    return <SolicitarClubView {...solicitarClubProps} />;
  }

  if (equipoActivo) {
    return <TeamLayout {...teamLayoutProps} />;
  }

  if (esCoordinador) {
    return <CoordinadorDashboard {...coordinadorDashboardProps} />;
  }

  return <EntrenadorEquiposView {...entrenadorEquiposProps} />;
}
