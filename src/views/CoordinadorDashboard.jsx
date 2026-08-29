import { CoordinacionPanel } from "../components/CoordinacionPanel.jsx";
import { EquiposListaContainer } from "../components/EquiposListaContainer.jsx";

const COORDINADOR_TABS = [
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
}) {
  return (
    <>
      <div
        className="segmented-control"
        style={{
          marginBottom: 24,
          width: "100%",
          maxWidth: 420,
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
