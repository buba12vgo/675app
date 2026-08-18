export function DemoSeedCard({
  onSeed,
  seeding,
  notice,
  accent,
  text,
  textSecondary,
  inputBorder,
  cardBgElevated,
  description = "Rellena cada club con 6 equipos, 10 jugadoras por equipo y entrenamientos aleatorios.",
}) {
  return (
    <div
      className="demo-seed-card"
      style={{
        width: "97%",
        marginBottom: 20,
        padding: "16px 18px",
        background: cardBgElevated,
        borderRadius: 12,
        border: `1px solid ${inputBorder}`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ color: text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
        Datos de prueba
      </div>
      <div style={{ color: textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
        {description}
      </div>
      <button
        type="button"
        onClick={onSeed}
        disabled={seeding}
        style={{
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "10px 16px",
          fontWeight: 700,
          fontSize: 14,
          cursor: seeding ? "wait" : "pointer",
          opacity: seeding ? 0.75 : 1,
          fontFamily: "inherit",
        }}
      >
        {seeding ? "Generando datos…" : "Generar datos de prueba"}
      </button>
      {notice && (
        <div className="demo-seed-notice" style={{ marginTop: 12, color: accent, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
          {notice}
        </div>
      )}
    </div>
  );
}
