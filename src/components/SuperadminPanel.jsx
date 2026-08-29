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
  accent: _accent,
  accentLight: _accentLight,
  accentSoft: _accentSoft,
  textMuted: _textMuted,
  inputBorder: _inputBorder,
  cardBgElevated: _cardBgElevated,
  userData: _userData,
  clubesPanelProps,
  equiposPanelProps,
  superadminUsuariosProps,
}) {
  return (
    <>
      <div
        className="segmented-control"
        style={{
          marginBottom: 24,
          width: "100%",
          maxWidth: 520,
        }}
      >
        {SUPERADMIN_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSuperadminVistaChange(key)}
            className={`segmented-control__btn${superadminVista === key ? " segmented-control__btn--active" : ""}`}
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
