import { IconCoordination } from "./icons.jsx";
import { EquipoListRow } from "./EquipoListRow.jsx";

export function CoordinacionPanel({
  clubNombre,
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
  const entrenadores = usuarios.filter((u) => u.rol === "entrenador");
  const coordinador = usuarios.find((u) => u.rol === "coordinador");

  return (
    <div className="content-medium" style={{ width: "97%", margin: "0 auto", padding: "8px 0 24px" }}>
      <h2 style={{ color: accent, fontWeight: 800, fontSize: 26, textAlign: "center", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <IconCoordination size={24} color={accent} />
        Coordinación
      </h2>
      <p style={{ color: textSecondary, textAlign: "center", marginBottom: 24, fontSize: 14 }}>
        Resumen del club <span style={{ color: accentLight, fontWeight: 700 }}>{clubNombre}</span>
      </p>

      <div style={{ display: "grid", gap: 16 }}>
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
            Entrenadores ({usuariosLoading ? "…" : entrenadores.length})
          </div>
          {usuariosLoading ? (
            <div style={{ color: textMuted, fontSize: 14 }}>Cargando usuarios…</div>
          ) : entrenadores.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 14 }}>No hay entrenadores asignados al club.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {entrenadores.map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 10, background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <span style={{ color: text, fontWeight: 600, fontSize: 14 }}>{u.nombre?.trim() || u.email}</span>
                  <span style={{ color: textMuted, fontSize: 12 }}>{u.email}</span>
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
                  equipo={equipo}
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
                  accent={accent}
                  accentLight={accentLight}
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
