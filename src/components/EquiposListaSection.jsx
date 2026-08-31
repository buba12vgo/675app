import { useState } from "react";
import { EquipoListRow } from "./EquipoListRow.jsx";
import { CrearEquipoForm } from "./CrearEquipoForm.jsx";
import { CrearEquipoCard } from "./CrearEquipoCard.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { MAX_EQUIPOS_FAVORITOS } from "../lib/equiposFavoritos.js";

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
  canFavorite,
  favoritosIds,
  onToggleFavorite,
  savingFavoritos,
  maxFavoritos = MAX_EQUIPOS_FAVORITOS,
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
          <EmptyState className="empty-state--grid" title="Cargando equipos…" />
        ) : (
          <>
            {!equiposVisibles.length && !puedeCrear && (
              <EmptyState
                className="empty-state--grid"
                title="No hay equipos registrados"
                hint="Cuando se cree el primero, aparecerá aquí."
              />
            )}
            {!equiposVisibles.length && puedeCrear && (
              <EmptyState
                className="empty-state--grid"
                title="Todavía no hay equipos"
                hint="Pulsa «Crear equipo» para añadir el primero."
              />
            )}
            {equiposVisibles.map((equipo) => (
              <EquipoListRow
                key={equipo.id}
                equipo={{ ...equipo, logoUrl: getEquipoLogo?.(equipo) || undefined }}
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
                canDelete={equipoEditProps.canDeleteEquipo?.(equipo)}
                onDelete={equipoEditProps.onDeleteEquipo}
                deleting={equipoEditProps.deletingEquipoId === equipo.id}
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
                canFavorite={canFavorite}
                isFavorite={Array.isArray(favoritosIds) && favoritosIds.includes(equipo.id)}
                favoriteDisabled={
                  Boolean(savingFavoritos)
                  || (
                    canFavorite
                    && Array.isArray(favoritosIds)
                    && favoritosIds.length >= maxFavoritos
                    && !favoritosIds.includes(equipo.id)
                  )
                }
                onToggleFavorite={onToggleFavorite}
                maxFavoritos={maxFavoritos}
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
