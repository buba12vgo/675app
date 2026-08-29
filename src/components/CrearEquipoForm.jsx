import {
  GENERO_FEMENINO,
  GENERO_MASCULINO,
  TIPO_CANASTA_GRANDE,
  TIPO_CANASTA_MINI,
} from "../lib/appUtils.js";
import { IconChevronLeft } from "./icons.jsx";

export function CrearEquipoForm({
  titulo = "Nuevo equipo",
  nuevoEquipoNombre,
  onNuevoEquipoNombreChange,
  nuevoEquipoTipoCanasta,
  onNuevoEquipoTipoCanastaChange,
  nuevoEquipoGenero,
  onNuevoEquipoGeneroChange,
  crearEquipoLoading,
  onSubmit,
  onBack,
  accent: _accent,
  onAccent: _onAccent,
  text,
  textSecondary,
  textMuted,
  inputBorder,
  inputBg,
  cardBgElevated,
}) {
  return (
    <div className="content-medium crear-equipo-panel" style={{ width: "96%", margin: "8px auto 0" }}>
      <button
        type="button"
        className="crear-equipo-panel__back"
        onClick={onBack}
        disabled={crearEquipoLoading}
        style={{ color: textMuted, borderColor: inputBorder }}
      >
        <IconChevronLeft size={16} color={textMuted} />
        <span>Volver a equipos</span>
      </button>

      <h3 className="crear-equipo-panel__title" style={{ color: text }}>
        {titulo}
      </h3>

      <form
        onSubmit={onSubmit}
        className="crear-equipo-panel__form"
        style={{
          background: cardBgElevated,
          border: `1px solid ${inputBorder}`,
        }}
      >
        <input
          type="text"
          placeholder="Nombre del equipo"
          value={nuevoEquipoNombre}
          onChange={(e) => onNuevoEquipoNombreChange(e.target.value)}
          required
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            border: `1px solid ${inputBorder}`,
            borderRadius: 10,
            background: inputBg,
            color: text,
            outline: "none",
            fontWeight: 500,
            fontFamily: "inherit",
          }}
          disabled={crearEquipoLoading}
        />
        <div className="crear-equipo-panel__fields">
          <label style={{ color: textSecondary }}>
            Canasta
            <select
              value={nuevoEquipoTipoCanasta}
              onChange={(e) => onNuevoEquipoTipoCanastaChange(e.target.value)}
              disabled={crearEquipoLoading}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                border: `1px solid ${inputBorder}`,
                borderRadius: 10,
                background: inputBg,
                color: text,
                fontFamily: "inherit",
              }}
            >
              <option value={TIPO_CANASTA_GRANDE}>Canasta grande</option>
              <option value={TIPO_CANASTA_MINI}>Minibasket</option>
            </select>
          </label>
          <label style={{ color: textSecondary }}>
            Categoría
            <select
              value={nuevoEquipoGenero}
              onChange={(e) => onNuevoEquipoGeneroChange(e.target.value)}
              disabled={crearEquipoLoading}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                border: `1px solid ${inputBorder}`,
                borderRadius: 10,
                background: inputBg,
                color: text,
                fontFamily: "inherit",
              }}
            >
              <option value={GENERO_FEMENINO}>Femenino</option>
              <option value={GENERO_MASCULINO}>Masculino</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={crearEquipoLoading || !nuevoEquipoNombre.trim()}
        >
          {crearEquipoLoading ? "Creando…" : "Crear equipo"}
        </button>
      </form>
    </div>
  );
}
