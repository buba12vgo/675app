export function UserOptionsPanel({
  userNombre,
  onNombreChange,
  onSubmit,
  saving,
  email,
  accent,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
  clubNombre,
  clubId,
  solicitudClubNombre,
  solicitudClubId,
  clubes,
  onSolicitarClub,
  esEntrenador,
}) {
  return (
    <div className="user-options-panel content-medium" style={{ width: "96%", margin: "0 auto", padding: "8px 0 24px" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 26, textAlign: "center", marginBottom: 8 }}>Opciones</h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 24, fontSize: 14 }}>
        Personaliza tu perfil en la app.
      </p>
      <form
        onSubmit={onSubmit}
        className="user-options-form"
        style={{
          background: cardBgElevated,
          border: `1px solid ${inputBorder}`,
          borderRadius: 16,
          padding: "20px 18px",
        }}
      >
        <label htmlFor="user-nombre" style={{ display: "block", color: text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
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
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 16px",
            fontSize: 16,
            borderRadius: 12,
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: text,
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        {email && (
          <div style={{ marginTop: 14, fontSize: 13, color: textMuted }}>
            Cuenta: {email}
          </div>
        )}
        <button
          type="submit"
          disabled={saving || !userNombre.trim()}
          style={{
            marginTop: 18,
            width: "100%",
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 16px",
            fontWeight: 700,
            fontSize: 15,
            cursor: saving ? "wait" : "pointer",
            opacity: saving || !userNombre.trim() ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          {saving ? "Guardando…" : "Guardar nombre"}
        </button>
      </form>

      {esEntrenador && (
        <div
          style={{
            marginTop: 20,
            background: cardBgElevated,
            border: `1px solid ${inputBorder}`,
            borderRadius: 16,
            padding: "20px 18px",
          }}
        >
          <div style={{ color: text, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Tu club</div>
          {clubNombre ? (
            <div style={{ color: accentLight, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{clubNombre}</div>
          ) : (
            <div style={{ color: textMuted, fontSize: 14, marginBottom: 8 }}>Sin club asignado</div>
          )}
          {solicitudClubId && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: accentSoft,
                border: `1px solid ${accentBorder}`,
                color: text,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
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
    </div>
  );
}
