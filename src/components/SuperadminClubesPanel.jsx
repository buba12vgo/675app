import { DemoSeedCard } from "./DemoSeedCard.jsx";
import { EntityLogoMark } from "./EntityLogoMark.jsx";
import { LogoUpload } from "./LogoUpload.jsx";
import { IconGear } from "./icons.jsx";
import { resolveClubLogoUrl } from "../lib/clubLogoPresets.js";

export function SuperadminClubesPanel({
  userData,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  onAccent,
  cardBgElevated,
  onQuitarMiClub,
  demoSeedProps,
  solicitudesLoading,
  solicitudesClub,
  onAprobarSolicitud,
  onRechazarSolicitud,
  nuevoClubNombre,
  onNuevoClubNombreChange,
  onCrearClub,
  gestionLoading,
  clubes,
  onSelectClub,
  onUploadClubLogo,
  onRemoveClubLogo,
  savingClubLogoId,
  clubEditandoId,
  editClubNombre,
  onEditClubNombreChange,
  savingClubId,
  deletingClubId,
  onStartEditClub,
  onCancelEditClub,
  onSaveClub,
  onDeleteClub,
}) {
  return (
    <>
      <h2
        style={{
          color: accent,
          fontWeight: "bold",
          marginBottom: 16,
          fontSize: 30,
          letterSpacing: 0.7,
          textAlign: "center",
          textShadow: "0 4px 18px rgba(100, 116, 139, 0.13)",
        }}
      >
        Panel de Gestión de Clubes
      </h2>
      <div
        style={{
          width: "97%",
          marginBottom: 22,
          padding: "14px 18px",
          background: cardBgElevated,
          borderRadius: 12,
          border: `1px solid ${inputBorder}`,
        }}
      >
        {userData?.clubId ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ color: textSecondary, fontSize: 14 }}>
              Mi club: <span style={{ color: accentLight, fontWeight: 700 }}>{userData.clubNombre}</span>
            </div>
            <button
              type="button"
              onClick={onQuitarMiClub}
              style={{
                background: "transparent",
                color: textMuted,
                border: `1px solid ${inputBorder}`,
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Quitar
            </button>
          </div>
        ) : (
          <div style={{ color: textMuted, fontSize: 14, lineHeight: 1.5 }}>
            Asigna un club como propio para crear y gestionar tus equipos.
          </div>
        )}
      </div>
      <DemoSeedCard {...demoSeedProps} />
      {solicitudesLoading ? (
        <div className="empty-state-text" style={{ width: "97%", marginBottom: 16, fontSize: 15 }}>
          Cargando solicitudes de club…
        </div>
      ) : (
        solicitudesClub.length > 0 && (
          <div
            style={{
              width: "97%",
              marginBottom: 20,
              padding: "16px 18px",
              background: cardBgElevated,
              borderRadius: 12,
              border: `1px solid ${inputBorder}`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ color: text, fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
              Solicitudes de club pendientes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {solicitudesClub.map((usuario) => (
                <div
                  key={usuario.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: text, fontWeight: 600, fontSize: 14 }}>
                      {usuario.nombre?.trim() || usuario.email || "Entrenador"}
                    </div>
                    <div style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>
                      {usuario.clubNombre ? (
                        <>
                          Cambio de <span style={{ fontWeight: 600 }}>{usuario.clubNombre}</span> a{" "}
                          <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span>
                        </>
                      ) : (
                        <>
                          Solicita:{" "}
                          <span style={{ color: accentLight, fontWeight: 700 }}>{usuario.solicitudClubNombre}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => onAprobarSolicitud(usuario)}
                      style={{
                        background: accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => onRechazarSolicitud(usuario)}
                      style={{
                        background: "transparent",
                        color: textMuted,
                        border: `1px solid ${inputBorder}`,
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
      <form
        onSubmit={onCrearClub}
        className="content-wide form-shell"
        style={{ width: "96%", marginBottom: 30 }}
      >
        <input
          type="text"
          placeholder="Nuevo nombre de Club"
          value={nuevoClubNombre}
          onChange={(e) => onNuevoClubNombreChange(e.target.value)}
          required
          style={{
            flex: 1,
            padding: "15px 20px",
            fontSize: 17.5,
            border: "none",
            borderRadius: "14px 0 0 14px",
            background: inputBg,
            color: text,
            outline: "none",
            transition: "box-shadow .16s",
            fontWeight: 500,
          }}
          disabled={gestionLoading}
          onFocus={(e) => {
            e.target.parentNode.style.boxShadow = `0 0 0 2.5px ${accent}`;
          }}
          onBlur={(e) => {
            e.target.parentNode.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          style={{
            background: accent,
            color: onAccent,
            border: "none",
            borderRadius: "0 14px 14px 0",
            padding: "15px 22px",
            fontWeight: "bold",
            fontSize: 17,
            cursor: "pointer",
            minHeight: 53,
            boxShadow: "0 2px 9px rgba(100, 116, 139, 0.08)",
            letterSpacing: 0.3,
          }}
          disabled={gestionLoading || !nuevoClubNombre.trim()}
        >
          Crear
        </button>
      </form>
      <div
        style={{
          width: "97%",
          marginTop: 8,
          marginBottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div style={{ color: text, fontWeight: 700, fontSize: 17, marginBottom: 9, letterSpacing: ".03em" }}>
          Clubes registrados:
        </div>
        {gestionLoading ? (
          <div className="empty-state-text" style={{ padding: "18px 0 0 6px", fontSize: 17 }}>
            Cargando...
          </div>
        ) : clubes.length === 0 ? (
          <div className="empty-state-text" style={{ padding: "10px 0 0 5px", fontSize: 16.5 }}>
            No hay clubes registrados.
          </div>
        ) : (
          <div className="responsive-grid-list" style={{ width: "100%" }}>
            {clubes.map((club) => {
              const clubLogoUrl = resolveClubLogoUrl({
                logoUrl: club.logoUrl,
                nombre: club.nombre,
              });
              const isEditing = clubEditandoId === club.id;
              const isBusy = savingClubId === club.id || deletingClubId === club.id;

              if (isEditing) {
                return (
                  <div
                    key={club.id}
                    className="entity-list-card entity-list-card--editing"
                    style={{ borderLeftColor: userData?.clubId === club.id ? accent : textMuted }}
                  >
                    <input
                      type="text"
                      value={editClubNombre}
                      onChange={(e) => onEditClubNombreChange(e.target.value)}
                      placeholder="Nombre del club"
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
                      disabled={isBusy}
                    />
                    <LogoUpload
                      compact
                      title="Escudo del club"
                      logoUrl={clubLogoUrl}
                      entityName={club.nombre}
                      canEdit
                      uploading={savingClubLogoId === club.id}
                      onUpload={(file) => onUploadClubLogo(club.id, file)}
                      onRemove={() => onRemoveClubLogo(club.id)}
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
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="entity-list-card__action"
                        onClick={() => onSaveClub(club.id)}
                        disabled={isBusy || !editClubNombre.trim()}
                        style={{ flex: "1 1 100px", opacity: isBusy ? 0.7 : 1 }}
                      >
                        {savingClubId === club.id ? "Guardando…" : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEditClub}
                        disabled={isBusy}
                        style={{
                          flex: "1 1 100px",
                          background: "transparent",
                          color: textMuted,
                          border: `1px solid ${inputBorder}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: isBusy ? "wait" : "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
              <div
                key={club.id}
                className="entity-list-card"
                style={{ borderLeftColor: userData?.clubId === club.id ? accent : textMuted }}
              >
                <div className="entity-list-card__body">
                  <div className="entity-list-card__title-row">
                    <EntityLogoMark
                      logoUrl={clubLogoUrl}
                      nombre={club.nombre}
                      accentLight={accentLight}
                      accentSoft={accentSoft}
                      accentBorder={inputBorder}
                      className="entity-list-card__logo"
                      size={40}
                    />
                    <span className="entity-list-card__title">{club.nombre}</span>
                    {userData?.clubId === club.id && (
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          color: accentLight,
                          background: accentSoft,
                          padding: "3px 8px",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        MI CLUB
                      </span>
                    )}
                  </div>
                  <LogoUpload
                    compact
                    title="Escudo del club"
                    logoUrl={clubLogoUrl}
                    entityName={club.nombre}
                    canEdit
                    uploading={savingClubLogoId === club.id}
                    onUpload={(file) => onUploadClubLogo(club.id, file)}
                    onRemove={() => onRemoveClubLogo(club.id)}
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
                </div>
                <div className="entity-list-card__actions">
                  <button
                    type="button"
                    className="entity-list-card__icon-btn"
                    onClick={() => onStartEditClub(club)}
                    aria-label={`Editar ${club.nombre}`}
                    title="Editar club"
                    disabled={isBusy}
                    style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
                  >
                    <IconGear size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClub(club)}
                    disabled={isBusy}
                    style={{
                      background: "transparent",
                      color: "#e57373",
                      border: "1px solid rgba(229, 115, 115, 0.45)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: isBusy ? "wait" : "pointer",
                      fontFamily: "inherit",
                      opacity: isBusy ? 0.7 : 1,
                    }}
                  >
                    {deletingClubId === club.id ? "Eliminando…" : "Eliminar"}
                  </button>
                  {userData?.clubId !== club.id && (
                    <button type="button" className="entity-list-card__action" onClick={() => onSelectClub(club)}>
                      Mi club
                    </button>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </>
  );
}
