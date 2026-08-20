import { EquiposListaSection } from "./EquiposListaSection.jsx";

export function EquiposListaContainer({
  esSuperadmin,
  equipos,
  userClubId,
  titulo,
  mostrarClub,
  permitirCrear,
  equiposLoading,
  permitirCrearForm,
  nuevoEquipoNombre,
  onNuevoEquipoNombreChange,
  nuevoEquipoTipoCanasta,
  onNuevoEquipoTipoCanastaChange,
  nuevoEquipoGenero,
  onNuevoEquipoGeneroChange,
  crearEquipoLoading,
  onCrearEquipo,
  equipoEditProps,
  onEntrarEquipo,
  getClubNombre,
  getClubLogo,
  getEquipoLogo,
  accent,
  accentLight,
  accentSoft,
  onAccent,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const equiposVisibles = esSuperadmin
    ? equipos
    : equipos.filter((equipo) => equipo.clubId === userClubId);

  return (
    <EquiposListaSection
      titulo={titulo}
      mostrarClub={mostrarClub}
      permitirCrear={permitirCrear}
      userClubId={userClubId}
      equiposVisibles={equiposVisibles}
      equiposLoading={equiposLoading}
      permitirCrearForm={permitirCrearForm}
      nuevoEquipoNombre={nuevoEquipoNombre}
      onNuevoEquipoNombreChange={onNuevoEquipoNombreChange}
      nuevoEquipoTipoCanasta={nuevoEquipoTipoCanasta}
      onNuevoEquipoTipoCanastaChange={onNuevoEquipoTipoCanastaChange}
      nuevoEquipoGenero={nuevoEquipoGenero}
      onNuevoEquipoGeneroChange={onNuevoEquipoGeneroChange}
      crearEquipoLoading={crearEquipoLoading}
      onCrearEquipo={onCrearEquipo}
      equipoEditProps={equipoEditProps}
      onEntrarEquipo={onEntrarEquipo}
      getClubNombre={getClubNombre}
      getClubLogo={getClubLogo}
      getEquipoLogo={getEquipoLogo}
      accent={accent}
      accentLight={accentLight}
      accentSoft={accentSoft}
      onAccent={onAccent}
      text={text}
      textSecondary={textSecondary}
      textMuted={textMuted}
      inputBorder={inputBorder}
      inputBg={inputBg}
      cardBgElevated={cardBgElevated}
    />
  );
}
