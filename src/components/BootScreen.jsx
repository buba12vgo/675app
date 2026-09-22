export function BootScreen({ message = "Cargando 675app…" }) {
  return (
    <div
      className="boot-screen"
      role="status"
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#F7F3ED",
        color: "#0F172A",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>{message}</p>
    </div>
  );
}
