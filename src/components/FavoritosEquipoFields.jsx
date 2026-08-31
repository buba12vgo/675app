import { MAX_EQUIPOS_FAVORITOS, normalizeEquiposFavoritos } from "../lib/equiposFavoritos.js";

export function FavoritosEquipoFields({
  equipos = [],
  value,
  onChange,
  disabled,
  max = MAX_EQUIPOS_FAVORITOS,
  label,
  text,
  textMuted,
  inputBorder,
  inputBg,
}) {
  const limit = Math.max(1, Number(max) || MAX_EQUIPOS_FAVORITOS);
  const ids = normalizeEquiposFavoritos(value, limit);
  const slots = Array.from({ length: limit }, (_, index) => ids[index] || "");
  const fieldLabel = label || `Equipos favoritos (máx. ${limit})`;

  const selectStyle = {
    padding: "8px 10px",
    fontSize: 13,
    borderRadius: 8,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: text,
    fontFamily: "inherit",
    width: "100%",
  };

  const options = [...equipos].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

  const setSlot = (index, nextId) => {
    const next = [...slots];
    next[index] = nextId;
    onChange(normalizeEquiposFavoritos(next, limit));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ color: textMuted, fontSize: 12, fontWeight: 600 }}>{fieldLabel}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {slots.map((current, index) => (
          <select
            key={index}
            value={current}
            onChange={(e) => setSlot(index, e.target.value)}
            disabled={disabled}
            aria-label={`Equipo favorito ${index + 1}`}
            style={{ ...selectStyle, flex: "1 1 140px" }}
          >
            <option value="">Ninguno</option>
            {options.map((equipo) => (
              <option key={equipo.id} value={equipo.id} disabled={equipo.id !== current && slots.includes(equipo.id)}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}
