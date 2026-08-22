import { IconUsers } from "./icons.jsx";
import { PlantillaForm } from "./PlantillaForm.jsx";
import { PlantillaJugadoraRow } from "./PlantillaJugadoraRow.jsx";

export function PlantillaTab({
  equipoLabels,
  text,
  textMuted,
  accent,
  plantillaFormProps,
  jugadorasLoading,
  jugadoras,
  onOpenFicha,
  plantillaRowProps,
}) {
  return (
    <div
      className="plantilla-tab"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 27, width: "100%" }}
    >
      <h2
        style={{
          color: text,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.02em",
          marginBottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <IconUsers size={22} color={accent} />
        {equipoLabels.plantillaTitulo}
      </h2>
      <PlantillaForm {...plantillaFormProps} />
      <div
        className="content-medium"
        style={{
          width: "99%",
          margin: "0 auto",
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 11,
        }}
      >
        {jugadorasLoading ? (
          <div
            style={{
              color: textMuted,
              fontSize: 16,
              fontStyle: "italic",
              padding: "12px 0",
              fontWeight: 500,
            }}
          >
            {equipoLabels.cargandoJugadores}
          </div>
        ) : jugadoras.length === 0 ? (
          <div style={{ color: textMuted, fontStyle: "italic", fontSize: 15.5 }}>
            {equipoLabels.noHayJugadoresPlantilla}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", marginTop: 4 }}>
            {jugadoras.map((j) => (
              <PlantillaJugadoraRow
                key={j.id}
                jugadora={j}
                onOpenFicha={onOpenFicha}
                isEditing={plantillaRowProps.isEditingId === j.id}
                editNombre={plantillaRowProps.editNombre}
                setEditNombre={plantillaRowProps.setEditNombre}
                editDorsal={plantillaRowProps.editDorsal}
                setEditDorsal={plantillaRowProps.setEditDorsal}
                editApodo={plantillaRowProps.editApodo}
                setEditApodo={plantillaRowProps.setEditApodo}
                editLoading={plantillaRowProps.editLoading}
                onStartEdit={plantillaRowProps.onStartEdit}
                onCancelEdit={plantillaRowProps.onCancelEdit}
                onSaveEdit={plantillaRowProps.onSaveEdit}
                onDelete={plantillaRowProps.onDelete}
                accent={plantillaRowProps.accent}
                accentShadow={plantillaRowProps.accentShadow}
                inputBorder={plantillaRowProps.inputBorder}
                inputBg={plantillaRowProps.inputBg}
                surface={plantillaRowProps.surface}
                text={plantillaRowProps.text}
                textSecondary={plantillaRowProps.textSecondary}
                error={plantillaRowProps.error}
                labels={plantillaRowProps.labels}
              />
            ))}
            {onOpenFicha ? (
              <p className="stats-ficha-hint" style={{ color: textMuted }}>
                Pulsa una {equipoLabels.jugador.toLowerCase()} para ver su ficha.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
