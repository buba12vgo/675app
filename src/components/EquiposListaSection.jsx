import { useState } from "react";
import { EquipoListRow } from "./EquipoListRow.jsx";
import { CrearEquipoForm } from "./CrearEquipoForm.jsx";
import { CrearEquipoCard } from "./CrearEquipoCard.jsx";

export function EquiposListaSection({
  titulo,
  mostrarClub,
  permitirCrear,
  userClubId,
  equiposVisibles,
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
  const [mostrarFormularioCrear, setMostrarFormularioCrear] = useState(false);
  const puedeCrear = permitirCrear && permitirCrearForm;

  const handleCrearEquipoSubmit = async (event) => {
    const created = await onCrearEquipo(event);
    if (created) setMostrarFormularioCrear(false);
  };

  if (mostrarFormularioCrear && puedeCrear) {
    return (
      <div className="section-heading">
        <span className="section-heading__accent">{titulo}</span>
        <CrearEquipoForm
          onSubmit={handleCrearEquipoSubmit}
          onBack={() => setMostrarFormularioCrear(false)}
          nuevoEquipoNombre={nuevoEquipoNombre}
          onNuevoEquipoNombreChange={onNuevoEquipoNombreChange}
          nuevoEquipoTipoCanasta={nuevoEquipoTipoCanasta}
          onNuevoEquipoTipoCanastaChange={onNuevoEquipoTipoCanastaChange}
          nuevoEquipoGenero={nuevoEquipoGenero}
          onNuevoEquipoGeneroChange={onNuevoEquipoGeneroChange}
          crearEquipoLoading={crearEquipoLoading}
          accent={accent}
          onAccent={onAccent}
          text={text}
          textSecondary={textSecondary}
          textMuted={textMuted}
          inputBorder={inputBorder}
          inputBg={inputBg}
          cardBgElevated={cardBgElevated}
        />
      </div>
    );
  }

  return (
    <div className="section-heading">
      <span className="section-heading__accent">{titulo}</span>
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div className="empty-state-text" style={{ fontSize: 17, padding: "12px 0", gridColumn: "1 / -1" }}>
            Cargando equipos...
          </div>
        ) : (
          <>
            {!equiposVisibles.length && !puedeCrear && (
              <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
                No hay equipos registrados.
              </div>
            )}
            {!equiposVisibles.length && puedeCrear && (
              <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
                No hay equipos aún. Pulsa «Crear equipo» para añadir el primero.
              </div>
            )}
            {equiposVisibles.map((equipo) => (
              <EquipoListRow
                key={equipo.id}
                equipo={equipo}
                clubNombre={getClubNombre(equipo.clubId)}
                mostrarClub={mostrarClub}
                canEdit={equipoEditProps.canEditEquipo(equipo)}
                isEditing={equipoEditProps.equipoEditandoId === equipo.id}
                editNombre={equipoEditProps.editEquipoNombre}
                setEditNombre={equipoEditProps.setEditEquipoNombre}
                editGenero={equipoEditProps.editEquipoGenero}
                setEditGenero={equipoEditProps.setEditEquipoGenero}
                editTipoCanasta={equipoEditProps.editEquipoTipoCanasta}
                setEditTipoCanasta={equipoEditProps.setEditEquipoTipoCanasta}
                saving={equipoEditProps.savingEquipoId === equipo.id}
                onStartEdit={equipoEditProps.onStartEditEquipo}
                onCancelEdit={equipoEditProps.onCancelEditEquipo}
                onSave={equipoEditProps.onSaveEquipo}
                onEntrar={onEntrarEquipo}
                onUploadLogo={(file) => equipoEditProps.onUploadEquipoLogo(equipo.id, file)}
                onRemoveLogo={() => equipoEditProps.onRemoveEquipoLogo(equipo.id)}
                logoUploading={equipoEditProps.savingEquipoLogoId === equipo.id}
                clubLogoUrl={getClubLogo?.(equipo.clubId) ?? null}
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
                borderAccent={equipo.clubId === userClubId ? accent : textMuted}
              />
            ))}
            {puedeCrear && (
              <CrearEquipoCard
                onClick={() => setMostrarFormularioCrear(true)}
                accent={accent}
                accentLight={accentLight}
                accentSoft={accentSoft}
                textMuted={textMuted}
                inputBorder={inputBorder}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
