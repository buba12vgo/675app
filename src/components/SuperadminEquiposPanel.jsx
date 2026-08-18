import { DemoSeedCard } from "./DemoSeedCard.jsx";
import { EquiposListaContainer } from "./EquiposListaContainer.jsx";

export function SuperadminEquiposPanel({
  userData,
  demoSeedProps,
  equiposFiltroSuperadmin,
  onEquiposFiltroChange,
  accent,
  accentLight,
  accentSoft,
  textMuted,
  inputBorder,
  equiposListaProps,
}) {
  return (
    <>
      <DemoSeedCard {...demoSeedProps} />
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 8,
          width: "100%",
        }}
      >
        {[
          { key: "todos", label: "Todos los equipos" },
          ...(userData?.clubId ? [{ key: "propio", label: `Mi club (${userData.clubNombre})` }] : []),
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onEquiposFiltroChange(key)}
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              border: `1px solid ${equiposFiltroSuperadmin === key ? accent : inputBorder}`,
              background: equiposFiltroSuperadmin === key ? accentSoft : "transparent",
              color: equiposFiltroSuperadmin === key ? accentLight : textMuted,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {!userData?.clubId && (
        <div
          style={{
            color: textMuted,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Puedes entrar en cualquier equipo. Para crear los tuyos, asigna un club en la pestaña Clubes.
        </div>
      )}
      <EquiposListaContainer
        {...equiposListaProps}
        titulo={
          equiposFiltroSuperadmin === "propio"
            ? `Equipos de ${userData.clubNombre}`
            : "Todos los equipos"
        }
        mostrarClub={equiposFiltroSuperadmin === "todos"}
        permitirCrear={equiposFiltroSuperadmin === "propio"}
      />
    </>
  );
}
