import { SuperadminClubesPanel } from "./SuperadminClubesPanel.jsx";
import { SuperadminEquiposPanel } from "./SuperadminEquiposPanel.jsx";
import { SuperadminUsuariosPanel } from "./SuperadminUsuariosPanel.jsx";

const SUPERADMIN_TABS = [
  { key: "clubes", label: "Clubes" },
  { key: "equipos", label: "Equipos" },
  { key: "usuarios", label: "Usuarios" },
];

export function SuperadminPanel({
  superadminVista,
  onSuperadminVistaChange,
  accent,
  accentLight,
  accentSoft,
  textMuted,
  inputBorder,
  cardBgElevated,
  userData,
  clubesPanelProps,
  equiposPanelProps,
  superadminUsuariosProps,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          padding: 4,
          background: cardBgElevated,
          borderRadius: 12,
          border: `1px solid ${inputBorder}`,
          width: "100%",
          maxWidth: 520,
        }}
      >
        {SUPERADMIN_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSuperadminVistaChange(key)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 9,
              border: superadminVista === key ? "1px solid rgba(100, 116, 139, 0.35)" : "1px solid transparent",
              background: superadminVista === key ? accentSoft : "transparent",
              color: superadminVista === key ? accentLight : textMuted,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {superadminVista === "clubes" ? (
        <SuperadminClubesPanel {...clubesPanelProps} />
      ) : superadminVista === "usuarios" ? (
        <SuperadminUsuariosPanel {...superadminUsuariosProps} />
      ) : (
        <SuperadminEquiposPanel {...equiposPanelProps} />
      )}
    </>
  );
}
