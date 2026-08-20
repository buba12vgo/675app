export function AppErrorBanner({ error, message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        color: error,
        background: "rgba(248,113,113,0.1)",
        border: "1px solid rgba(248,113,113,0.25)",
        marginTop: 28,
        fontSize: 14,
        padding: "12px 16px",
        borderRadius: 12,
        width: "98%",
        textAlign: "center",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}
