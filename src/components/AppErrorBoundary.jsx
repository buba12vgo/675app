import { Component } from "react";

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="app-error-boundary"
          role="alert"
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            background: "#F7F3ED",
            color: "#0F172A",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>Ha ocurrido un error. Recarga la página.</p>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              font: "inherit",
              fontWeight: 700,
              color: "#fff",
              background: "#B45309",
              border: 0,
              borderRadius: 12,
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
