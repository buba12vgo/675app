import { IconCoordination } from "./icons.jsx";
import { EquipoListRow } from "./EquipoListRow.jsx";
import { LogoUpload } from "./LogoUpload.jsx";
import { FavoritosEquipoFields } from "./FavoritosEquipoFields.jsx";
import { maxEquiposFavoritosParaRol } from "../lib/equiposFavoritos.js";

export function CoordinacionPanel({
  clubNombre,
  clubLogoUrl,
  onUploadClubLogo,
  onRemoveClubLogo,
  savingClubLogo,
  usuarios,
  usuariosLoading,
  equipos,
  equiposLoading,
  onEntrarEquipo,
  canEditEquipos,
  equipoEditandoId,
  editEquipoNombre,
  setEditEquipoNombre,
  editEquipoGenero,
  setEditEquipoGenero,
  editEquipoTipoCanasta,
  setEditEquipoTipoCanasta,
  savingEquipoId,
  onStartEditEquipo,
  onCancelEditEquipo,
  onSaveEquipo,
  onUploadEquipoLogo,
  onRemoveEquipoLogo,
  savingEquipoLogoId,
  getEquipoLogo,
  onGuardarFavoritos,
  savingUsuarioId,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
  onAccent,
}) {
  const staffFavoritos = usuarios.filter(
    (u) => u.rol === "entrenador" || u.rol === "preparador_fisico"
  );
  const coordinador = usuarios.find((u) => u.rol === "coordinador");

  return (
    <div className="content-medium tactical-page" style={{ width: "97%", margin: "0 auto" }}>
      <h2 className="tactical-title">
        <IconCoordination size={24} />
        Coordinación
      </h2>
      <p className="tactical-lead">
        Resumen del club <strong>{clubNombre}</strong>
      </p>

      <div style={{ display: "grid", gap: 16, width: "100%" }}>
        <div className="club-branding-card">
          <LogoUpload
            title="Escudo del club"
            subtitle={`Identidad visual de ${clubNombre}`}
            logoUrl={clubLogoUrl}
            entityName={clubNombre}
            canEdit
            uploading={savingClubLogo}
            onUpload={onUploadClubLogo}
            onRemove={onRemoveClubLogo}
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
          />
        </div>

        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Coordinador</div>
          {coordinador ? (
            <div style={{ color: accentLight, fontWeight: 700, fontSize: 16 }}>
              {coordinador.nombre?.trim() || coordinador.email}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14 }}>Sin coordinador asignado</div>
          )}
        </div>

        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Entrenadores y preparadores ({usuariosLoading ? "…" : staffFavoritos.length})
          </div>
          {usuariosLoading ? (
            <div style={{ color: textMuted, fontSize: 14 }}>Cargando usuarios…</div>
          ) : staffFavoritos.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 14 }}>No hay entrenadores ni preparadores asignados al club.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {staffFavoritos.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    padding: "12px 12px",
                    borderRadius: 10,
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>
                      {u.nombre?.trim() || u.email}
                      {u.rol === "preparador_fisico" ? (
                        <span style={{ color: textMuted, fontWeight: 500, marginLeft: 8 }}>Preparador físico</span>
                      ) : null}
                    </span>
                    <span style={{ color: textMuted, fontSize: 12 }}>{u.email}</span>
                  </div>
                  <FavoritosEquipoFields
                    equipos={equipos}
                    value={u.equiposFavoritos}
                    onChange={(ids) => onGuardarFavoritos?.(u, ids)}
                    disabled={equiposLoading || savingUsuarioId === u.id}
                    max={maxEquiposFavoritosParaRol(u.rol)}
                    text={text}
                    textMuted={textMuted}
                    inputBorder={inputBorder}
                    inputBg={cardBgElevated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: cardBgElevated, border: `1px solid ${inputBorder}`, borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ color: text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            Equipos ({equiposLoading ? "…" : equipos.length})
          </div>
          {equiposLoading ? (
            <div style={{ color: textMuted, fontSize: 14 }}>Cargando equipos…</div>
          ) : equipos.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 14 }}>No hay equipos en el club.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {equipos.map((equipo) => (
                <EquipoListRow
                  key={equipo.id}
                  equipo={{ ...equipo, logoUrl: getEquipoLogo?.(equipo) || undefined }}
                  mostrarClub={false}
                  canEdit={canEditEquipos}
                  isEditing={equipoEditandoId === equipo.id}
                  editNombre={editEquipoNombre}
                  setEditNombre={setEditEquipoNombre}
                  editGenero={editEquipoGenero}
                  setEditGenero={setEditEquipoGenero}
                  editTipoCanasta={editEquipoTipoCanasta}
                  setEditTipoCanasta={setEditEquipoTipoCanasta}
                  saving={savingEquipoId === equipo.id}
                  onStartEdit={onStartEditEquipo}
                  onCancelEdit={onCancelEditEquipo}
                  onSave={onSaveEquipo}
                  onEntrar={onEntrarEquipo}
                  onUploadLogo={(file) => onUploadEquipoLogo(equipo.id, file)}
                  onRemoveLogo={() => onRemoveEquipoLogo(equipo.id)}
                  logoUploading={savingEquipoLogoId === equipo.id}
                  clubLogoUrl={clubLogoUrl}
                  accent={accent}
                  accentLight={accentLight}
                  accentSoft={accentSoft}
                  text={text}
                  textSecondary={textSecondary}
                  textMuted={textMuted}
                  inputBorder={inputBorder}
                  inputBg={inputBg}
                  cardBgElevated={cardBgElevated}
                  borderAccent={accent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
