import {
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "../lib/appUtils.js";
import { EquipoListRow } from "./EquipoListRow.jsx";

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
  return (
    <div className="section-heading">
      <span className="section-heading__accent">{titulo}</span>
      {permitirCrear && permitirCrearForm && (
        <form
          onSubmit={onCrearEquipo}
          className="content-medium form-shell"
          style={{
            margin: "35px auto 14px auto",
            width: "96%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 18px",
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 14,
          }}
        >
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={nuevoEquipoNombre}
            onChange={(e) => onNuevoEquipoNombreChange(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 16,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              background: inputBg,
              color: text,
              outline: "none",
              fontWeight: 500,
              fontFamily: "inherit",
            }}
            disabled={crearEquipoLoading}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label
              style={{
                flex: "1 1 160px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                color: textSecondary,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Canasta
              <select
                value={nuevoEquipoTipoCanasta}
                onChange={(e) => onNuevoEquipoTipoCanastaChange(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
                <option value={TIPO_CANASTA_MINI}>Minibasket</option>
              </select>
            </label>
            <label
              style={{
                flex: "1 1 160px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                color: textSecondary,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Categoría
              <select
                value={nuevoEquipoGenero}
                onChange={(e) => onNuevoEquipoGeneroChange(e.target.value)}
                disabled={crearEquipoLoading}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 10,
                  background: inputBg,
                  color: text,
                  fontFamily: "inherit",
                }}
              >
                <option value={GENERO_FEMENINO}>Femenino</option>
                <option value={GENERO_MASCULINO}>Masculino</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            style={{
              background: accent,
              color: onAccent,
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: 15,
              cursor: crearEquipoLoading ? "wait" : "pointer",
              fontFamily: "inherit",
              opacity: crearEquipoLoading ? 0.7 : 1,
            }}
            disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()}
          >
            {crearEquipoLoading ? "Creando…" : "Crear equipo"}
          </button>
        </form>
      )}
      <div className="content-medium responsive-grid-list" style={{ width: "98%", margin: "17px auto 0" }}>
        {equiposLoading ? (
          <div className="empty-state-text" style={{ fontSize: 17, padding: "12px 0", gridColumn: "1 / -1" }}>
            Cargando equipos...
          </div>
        ) : equiposVisibles.length === 0 ? (
          <div className="empty-state-text" style={{ fontSize: 16.5, gridColumn: "1 / -1" }}>
            {permitirCrear ? "No hay equipos aún. ¡Crea el primero!" : "No hay equipos registrados."}
          </div>
        ) : (
          equiposVisibles.map((equipo) => (
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
          ))
        )}
      </div>
    </div>
  );
}
