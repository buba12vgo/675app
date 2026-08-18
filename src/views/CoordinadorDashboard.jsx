import { CoordinacionPanel } from "../components/CoordinacionPanel.jsx";
import { EquiposListaContainer } from "../components/EquiposListaContainer.jsx";

const COORDINADOR_TABS = [
  { key: "equipos", label: "Equipos" },
  { key: "coordinacion", label: "Coordinación" },
];

export function CoordinadorDashboard({
  coordinadorVista,
  onCoordinadorVistaChange,
  accentSoft,
  accentLight,
  textMuted,
  inputBorder,
  cardBgElevated,
  text,
  clubNombre,
  coordinacionProps,
  equiposListaProps,
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
          maxWidth: 420,
        }}
      >
        {COORDINADOR_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onCoordinadorVistaChange(key)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 9,
              border:
                coordinadorVista === key
                  ? "1px solid rgba(42, 101, 112, 0.35)"
                  : "1px solid transparent",
              background: coordinadorVista === key ? accentSoft : "transparent",
              color: coordinadorVista === key ? accentLight : textMuted,
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
      {coordinadorVista === "coordinacion" ? (
        <CoordinacionPanel {...coordinacionProps} />
      ) : (
        <EquiposListaContainer
          {...equiposListaProps}
          titulo={
            <>
              Equipos del Club: <span style={{ color: text }}>{clubNombre}</span>
            </>
          }
          mostrarClub={false}
          permitirCrear={true}
        />
      )}
    </>
  );
}
