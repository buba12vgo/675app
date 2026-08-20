import { normalizeEquiposFavoritos } from "../lib/equiposFavoritos.js";

export function FavoritosEquipoFields({
  equipos = [],
  value,
  onChange,
  disabled,
  label = "Equipos favoritos (máx. 2)",
  text,
  textMuted,
  inputBorder,
  inputBg,
}) {
  const ids = normalizeEquiposFavoritos(value);
  const first = ids[0] || "";
  const second = ids[1] || "";

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
    const slots = [first, second];
    slots[index] = nextId;
    onChange(normalizeEquiposFavoritos(slots));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ color: textMuted, fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[0, 1].map((index) => {
          const current = index === 0 ? first : second;
          const other = index === 0 ? second : first;
          return (
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
                <option key={equipo.id} value={equipo.id} disabled={equipo.id === other}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          );
        })}
      </div>
    </div>
  );
}
