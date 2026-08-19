import { useState, useEffect } from "react";
import { formatRolLabel } from "../lib/appUtils.js";

export function UsuarioClubRow({
  usuario,
  clubes,
  onGuardar,
  onQuitarClub,
  saving,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const clubOptions = (() => {
    const list = [...clubes];
    if (usuario.clubId && !list.some((club) => club.id === usuario.clubId)) {
      list.push({
        id: usuario.clubId,
        nombre: usuario.clubNombre || "Club asignado",
      });
    }
    return list;
  })();

  const [clubId, setClubId] = useState(usuario.clubId || "");
  const [rol, setRol] = useState(usuario.rol === "coordinador" ? "coordinador" : "entrenador");

  useEffect(() => {
    setClubId(usuario.clubId || "");
    setRol(usuario.rol === "coordinador" ? "coordinador" : "entrenador");
  }, [usuario.clubId, usuario.rol, usuario.id]);

  const effectiveClubId = clubId || usuario.clubId || "";

  const selectStyle = {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: text,
    fontFamily: "inherit",
    minWidth: 0,
  };

  return (
    <div
      style={{
        background: cardBgElevated,
        border: `1px solid ${inputBorder}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: text, fontWeight: 700, fontSize: 15 }}>
          {usuario.nombre?.trim() || usuario.email || "Usuario"}
        </div>
        <div style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>{usuario.email}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accentLight, background: accentSoft, padding: "3px 8px", borderRadius: 6 }}>
            {formatRolLabel(usuario.rol)}
          </span>
          {usuario.clubNombre && (
            <span style={{ fontSize: 12, color: textMuted }}>{usuario.clubNombre}</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <select value={clubId} onChange={(e) => setClubId(e.target.value)} style={{ ...selectStyle, flex: "1 1 140px" }}>
          <option value="">Sin club</option>
          {clubOptions.map((club) => (
            <option key={club.id} value={club.id}>{club.nombre}</option>
          ))}
        </select>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          style={{ ...selectStyle, flex: "0 0 130px" }}
          disabled={!effectiveClubId}
        >
          <option value="entrenador">Entrenador</option>
          <option value="coordinador">Coordinador</option>
        </select>
        <button
          type="button"
          onClick={() => onGuardar(usuario, clubId, rol)}
          disabled={saving || (rol === "coordinador" && !effectiveClubId)}
          style={{
            background: accent,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 700,
            fontSize: 13,
            cursor: saving ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {usuario.clubId && (
          <button
            type="button"
            onClick={() => onQuitarClub(usuario.id)}
            disabled={saving}
            style={{
              background: "transparent",
              color: textMuted,
              border: `1px solid ${inputBorder}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 600,
              fontSize: 13,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Quitar club
          </button>
        )}
      </div>
    </div>
  );
}

export function SuperadminUsuariosPanel({
  usuarios,
  usuariosLoading,
  clubes,
  filtroClub,
  onFiltroClubChange,
  onGuardarUsuario,
  onQuitarClub,
  savingUserId,
  notice,
  accent,
  accentLight,
  accentSoft,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  const editables = usuarios.filter((u) => u.rol !== "superadmin");
  const filtrados = filtroClub === "todos"
    ? editables
    : filtroClub === "sin_club"
      ? editables.filter((u) => !u.clubId)
      : editables.filter((u) => u.clubId === filtroClub);

  return (
    <div className="content-medium" style={{ width: "97%", margin: "0 auto" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 28, textAlign: "center", marginBottom: 8 }}>
        Usuarios por club
      </h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
        Asigna club y rol a cada usuario. Solo puede haber un coordinador por club.
      </p>
      {notice && (
        <div style={{ color: accentLight, background: accentSoft, border: `1px solid rgba(100, 116, 139, 0.35)`, marginBottom: 16, fontSize: 14, padding: "12px 16px", borderRadius: 12, textAlign: "center", fontWeight: 600 }}>
          {notice}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => onFiltroClubChange("todos")}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: `1px solid ${filtroClub === "todos" ? accent : inputBorder}`,
            background: filtroClub === "todos" ? accentSoft : "transparent",
            color: filtroClub === "todos" ? accentLight : textMuted,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => onFiltroClubChange("sin_club")}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: `1px solid ${filtroClub === "sin_club" ? accent : inputBorder}`,
            background: filtroClub === "sin_club" ? accentSoft : "transparent",
            color: filtroClub === "sin_club" ? accentLight : textMuted,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sin club
        </button>
        {clubes.map((club) => (
          <button
            key={club.id}
            type="button"
            onClick={() => onFiltroClubChange(club.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              border: `1px solid ${filtroClub === club.id ? accent : inputBorder}`,
              background: filtroClub === club.id ? accentSoft : "transparent",
              color: filtroClub === club.id ? accentLight : textMuted,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {club.nombre}
          </button>
        ))}
      </div>
      {usuariosLoading ? (
        <div className="empty-state-text" style={{ fontSize: 16, padding: "12px 0" }}>Cargando usuarios…</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state-text" style={{ fontSize: 16, padding: "12px 0" }}>No hay usuarios en este filtro.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtrados.map((usuario) => (
            <UsuarioClubRow
              key={usuario.id}
              usuario={usuario}
              clubes={clubes}
              onGuardar={onGuardarUsuario}
              onQuitarClub={onQuitarClub}
              saving={savingUserId === usuario.id}
              accent={accent}
              accentLight={accentLight}
              accentSoft={accentSoft}
              text={text}
              textSecondary={textSecondary}
              textMuted={textMuted}
              inputBorder={inputBorder}
              inputBg={inputBg}
              cardBgElevated={cardBgElevated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
