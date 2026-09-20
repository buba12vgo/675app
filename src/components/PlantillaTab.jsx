import { IconUsers } from "./icons.jsx";
import { PlantillaForm } from "./PlantillaForm.jsx";
import { PlantillaJugadoraRow } from "./PlantillaJugadoraRow.jsx";
import { EmptyState } from "./EmptyState.jsx";

export function PlantillaTab({
  equipoLabels,
  textMuted,
  plantillaFormProps,
  jugadorasLoading,
  jugadoras,
  onOpenFicha,
  plantillaRowProps,
  readOnly = false,
}) {
  return (
    <div className="plantilla-tab tactical-page">
      <h2 className="tactical-title">
        <IconUsers size={22} />
        {equipoLabels.plantillaTitulo}
      </h2>
      {readOnly ? (
        <p className="tactical-lead">
          Solo lectura: puedes consultar la plantilla, pero no modificarla.
        </p>
      ) : (
        <PlantillaForm {...plantillaFormProps} />
      )}
      <div className="content-medium" style={{ width: "99%", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
        {jugadorasLoading ? (
          <EmptyState title={equipoLabels.cargandoJugadores} />
        ) : jugadoras.length === 0 ? (
          <EmptyState
            title={equipoLabels.noHayJugadoresPlantilla}
            hint="Añádela con el formulario de arriba."
          />
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
                editRol={plantillaRowProps.editRol}
                setEditRol={plantillaRowProps.setEditRol}
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
                readOnly={readOnly || plantillaRowProps.readOnly}
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
