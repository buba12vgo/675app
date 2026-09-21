import { CONTACT_EMAIL, CONTACT_MAILTO } from "../lib/contact.js";

export function UserOptionsPanel({
  userNombre,
  onNombreChange,
  onSubmit,
  saving,
  email,
  accent,
  accentLight,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  clubNombre,
  clubId,
  solicitudClubNombre,
  solicitudClubId,
  clubes,
  onSolicitarClub,
  esEntrenador,
  onOpenTutorial,
}) {
  return (
    <div className="user-options-panel content-medium tactical-page" style={{ width: "96%", margin: "0 auto" }}>
      <h2 className="tactical-title">Opciones</h2>
      <p className="tactical-lead">Personaliza tu perfil en la app.</p>
      {onOpenTutorial ? (
        <button
          type="button"
          className="login-tutorial-link"
          onClick={onOpenTutorial}
          style={{ marginBottom: 20 }}
        >
          Cómo funciona la app
        </button>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="user-options-form tactical-card"
      >
        <label htmlFor="user-nombre" className="field-label">
          Tu nombre
        </label>
        <input
          id="user-nombre"
          type="text"
          value={userNombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Ej. Buba"
          maxLength={80}
          required
        />
        {email && (
          <div style={{ marginTop: 14, fontSize: 13, color: textMuted }}>
            Cuenta: {email}
          </div>
        )}
        <button
          type="submit"
          className="btn-primary btn-primary--block"
          style={{ marginTop: 18 }}
          disabled={saving || !userNombre.trim()}
        >
          {saving ? "Guardando…" : "Guardar nombre"}
        </button>
      </form>

      {esEntrenador && (
        <div className="user-options-club tactical-card">
          <div className="field-label">Tu club</div>
          {clubNombre ? (
            <div style={{ color: accentLight, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{clubNombre}</div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14, marginBottom: 8 }}>Sin club asignado</div>
          )}
          {solicitudClubId && (
            <div className="notice-banner" style={{ marginBottom: 12 }}>
              {clubNombre
                ? <>Cambio pendiente a <span style={{ color: accentLight, fontWeight: 700 }}>{solicitudClubNombre}</span>. El superadmin debe aprobarlo.</>
                : <>Solicitud pendiente para <span style={{ color: accentLight, fontWeight: 700 }}>{solicitudClubNombre}</span>.</>}
            </div>
          )}
          <div style={{ color: textSecondary, fontSize: 13, lineHeight: 1.5, marginBottom: clubes?.length ? 12 : 0 }}>
            {clubNombre
              ? "Para cambiar de club, solicítalo abajo. Solo el superadmin puede aprobar el cambio."
              : "Solicita un club desde la pantalla principal. Solo el superadmin puede aprobarlo."}
          </div>
          {clubNombre && clubes?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {clubes
                .filter((club) => club.id !== clubId)
                .map((club) => (
                  <div
                    key={club.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                    }}
                  >
                    <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>{club.nombre}</span>
                    <button
                      type="button"
                      onClick={() => onSolicitarClub?.(club)}
                      disabled={solicitudClubId === club.id}
                      style={{
                        background: solicitudClubId === club.id ? "transparent" : accent,
                        color: solicitudClubId === club.id ? textMuted : "#fff",
                        border: solicitudClubId === club.id ? `1px solid ${inputBorder}` : "none",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: solicitudClubId === club.id ? "default" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                      }}
                    >
                      {solicitudClubId === club.id ? "Solicitado" : "Solicitar cambio"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
      <p className="user-options-contact">
        Contacto: <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
      </p>
    </div>
  );
}
