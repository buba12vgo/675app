import { CoordinacionPanel } from "../components/CoordinacionPanel.jsx";
import { EquiposListaContainer } from "../components/EquiposListaContainer.jsx";
import { ClubDashboard } from "../components/ClubDashboard.jsx";

const COORDINADOR_TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "equipos", label: "Equipos" },
  { key: "coordinacion", label: "Coordinación" },
];

export function CoordinadorDashboard({
  coordinadorVista,
  onCoordinadorVistaChange,
  accentSoft: _accentSoft,
  accentLight: _accentLight,
  textMuted: _textMuted,
  inputBorder: _inputBorder,
  cardBgElevated: _cardBgElevated,
  text,
  clubNombre,
  coordinacionProps,
  equiposListaProps,
  dashboardProps,
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
        {COORDINADOR_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onCoordinadorVistaChange(key)}
            className={`segmented-control__btn${coordinadorVista === key ? " segmented-control__btn--active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      {coordinadorVista === "dashboard" ? (
        <ClubDashboard {...dashboardProps} />
      ) : coordinadorVista === "coordinacion" ? (
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
