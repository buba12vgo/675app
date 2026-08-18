import { IconCalendar } from "./icons.jsx";
import { SessionsCalendar } from "./SessionsCalendar.jsx";
import { SessionDayPanel } from "./SessionDayPanel.jsx";

export function CalendarioTab({
  text,
  textMuted,
  accent,
  colorPartido,
  fechaSesionSeleccionada,
  anioActual,
  mesActual,
  onPrevMonth,
  onNextMonth,
  sesionesEquipo,
  onSelectDate,
  sessionDayPanelProps,
}) {
  return (
    <div
      className="content-block"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 27,
        width: "100%",
        alignItems: "center",
        padding: "13px 0 33px 0",
      }}
    >
      <h2
        style={{
          color: text,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.02em",
          marginBottom: 2,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <IconCalendar size={22} color={accent} />
        Gestión de Calendario
      </h2>
      {!fechaSesionSeleccionada && (
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 12.5,
            color: textMuted,
            marginBottom: -8,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: accent,
                display: "inline-block",
              }}
            />
            Entreno
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: colorPartido,
                display: "inline-block",
              }}
            />
            Partido
          </span>
        </div>
      )}
      {!fechaSesionSeleccionada && (
        <SessionsCalendar
          anioActual={anioActual}
          mesActual={mesActual}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          sesionesEquipo={sesionesEquipo}
          accent={accent}
          colorPartido={colorPartido}
          onSelectDate={onSelectDate}
        />
      )}
      {fechaSesionSeleccionada && (
        <SessionDayPanel {...sessionDayPanelProps} />
      )}
    </div>
  );
}
