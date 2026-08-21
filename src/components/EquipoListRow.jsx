import {
  formatTipoCanasta,
  formatGeneroEquipo,
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "../lib/appUtils.js";
import { IconGear, IconStar } from "./icons.jsx";
import { EntityLogoMark } from "./EntityLogoMark.jsx";
import { LogoUpload } from "./LogoUpload.jsx";
import { MAX_EQUIPOS_FAVORITOS } from "../lib/equiposFavoritos.js";

export function EquipoListRow({
  equipo,
  clubNombre,
  mostrarClub,
  canEdit,
  isEditing,
  editNombre,
  setEditNombre,
  editGenero,
  setEditGenero,
  editTipoCanasta,
  setEditTipoCanasta,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  canDelete,
  deleting,
  onEntrar,
  onUploadLogo,
  onRemoveLogo,
  logoUploading,
  clubLogoUrl,
  accent,
  accentLight,
  accentSoft,
  onAccent,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated: _cardBgElevated,
  borderAccent,
  canFavorite,
  isFavorite,
  favoriteDisabled,
  onToggleFavorite,
}) {
  const displayLogoUrl = equipo.logoUrl || clubLogoUrl || null;
  const logoLabel = equipo.logoUrl ? equipo.nombre : clubNombre || equipo.nombre;

  const selectStyle = {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: text,
    fontFamily: "inherit",
    width: "100%",
  };

  if (isEditing) {
    return (
      <div className="entity-list-card entity-list-card--editing" style={{ borderLeftColor: borderAccent || accent, flexDirection: "column", alignItems: "stretch", gap: 12 }}>
        <input
          type="text"
          value={editNombre}
          onChange={(e) => setEditNombre(e.target.value)}
          placeholder="Nombre del equipo"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 15,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            fontFamily: "inherit",
            fontWeight: 600,
          }}
          disabled={saving}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 5, color: textSecondary, fontSize: 12, fontWeight: 600 }}>
            Canasta
            <select value={editTipoCanasta} onChange={(e) => setEditTipoCanasta(e.target.value)} style={selectStyle} disabled={saving}>
              <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
              <option value={TIPO_CANASTA_MINI}>Minibasket</option>
            </select>
          </label>
          <label style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 5, color: textSecondary, fontSize: 12, fontWeight: 600 }}>
            Categoría
            <select value={editGenero} onChange={(e) => setEditGenero(e.target.value)} style={selectStyle} disabled={saving}>
              <option value={GENERO_FEMENINO}>Femenino</option>
              <option value={GENERO_MASCULINO}>Masculino</option>
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="entity-list-card__action"
            onClick={() => onSave(equipo.id)}
            disabled={saving || !editNombre.trim()}
            style={{ flex: "1 1 100px", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={saving}
            style={{
              flex: "1 1 100px",
              background: "transparent",
              color: textMuted,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 600,
              fontSize: 14,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
        </div>
        {canEdit && onUploadLogo && (
          <LogoUpload
            compact
            title="Escudo del equipo"
            logoUrl={displayLogoUrl}
            entityName={equipo.nombre}
            canEdit
            uploading={logoUploading}
            onUpload={onUploadLogo}
            onRemove={onRemoveLogo}
            accent={accent}
            onAccent={onAccent}
            text={text}
            textSecondary={textSecondary}
            textMuted={textMuted}
            inputBorder={inputBorder}
            inputBg={inputBg}
            accentLight={accentLight}
            accentSoft={accentSoft}
            accentBorder={inputBorder}
            markSize={44}
          />
        )}
      </div>
    );
  }

  return (
    <div className="entity-list-card" style={{ borderLeftColor: borderAccent || accent }}>
      <div className="entity-list-card__body">
        <div className="entity-list-card__title-row">
          <EntityLogoMark
            logoUrl={displayLogoUrl}
            nombre={logoLabel}
            accentLight={accentLight}
            accentSoft={accentSoft}
            accentBorder={inputBorder}
            className="entity-list-card__logo"
            size={40}
          />
          <span className="entity-list-card__title">{equipo.nombre}</span>
        </div>
        {mostrarClub && clubNombre && (
          <span className="entity-list-card__meta">{clubNombre}</span>
        )}
        <span className="entity-list-card__meta">
          {formatTipoCanasta(equipo.tipoCanasta)} · {formatGeneroEquipo(equipo.genero)}
        </span>
      </div>
      <div className="entity-list-card__actions">
        {canFavorite && onToggleFavorite ? (
          <button
            type="button"
            className="entity-list-card__icon-btn"
            onClick={() => onToggleFavorite(equipo.id)}
            disabled={deleting || favoriteDisabled}
            aria-label={isFavorite ? `Quitar ${equipo.nombre} de favoritos` : `Marcar ${equipo.nombre} como favorito`}
            aria-pressed={isFavorite}
            title={isFavorite ? "Quitar de favoritos" : favoriteDisabled ? `Ya tienes ${MAX_EQUIPOS_FAVORITOS} favoritos` : "Marcar como favorito"}
            style={{
              color: isFavorite ? accent : textMuted,
              borderColor: isFavorite ? `${accent}55` : inputBorder,
              background: isFavorite ? `${accent}14` : "transparent",
            }}
          >
            <IconStar size={17} color={isFavorite ? accent : textMuted} filled={isFavorite} />
          </button>
        ) : null}
        {canEdit && (
          <button
            type="button"
            className="entity-list-card__icon-btn"
            onClick={() => onStartEdit(equipo)}
            aria-label={`Editar ${equipo.nombre}`}
            title="Editar equipo"
            disabled={deleting}
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
          >
            <IconGear size={17} />
          </button>
        )}
        {canDelete && onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(equipo)}
            disabled={deleting}
            aria-label={`Eliminar ${equipo.nombre}`}
            style={{
              background: "transparent",
              color: "#e57373",
              border: "1px solid rgba(229, 115, 115, 0.45)",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 600,
              fontSize: 13,
              cursor: deleting ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        ) : null}
        <button type="button" className="entity-list-card__action" onClick={() => onEntrar(equipo)} disabled={deleting}>
          Entrar
        </button>
      </div>
    </div>
  );
}
