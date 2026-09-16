import { IconCalendar } from "./icons.jsx";
import { SessionsCalendar } from "./SessionsCalendar.jsx";
import { SessionDayPanel } from "./SessionDayPanel.jsx";

export function CalendarioTab({
  fechaSesionSeleccionada,
  anioActual,
  mesActual,
  onPrevMonth,
  onNextMonth,
  sesionesEquipo,
  onSelectDate,
  sessionDayPanelProps,
  accent,
  colorPartido,
  colorFisico,
}) {
  return (
    <div className="content-block tactical-page">
      <h2 className="tactical-title">
        <IconCalendar size={22} />
        Gestión de Calendario
      </h2>
      {!fechaSesionSeleccionada && (
        <div className="tactical-legend">
          <span className="tactical-legend__item">
            <span className="tactical-legend__dot tactical-legend__dot--entreno" />
            Entreno
          </span>
          <span className="tactical-legend__item">
            <span className="tactical-legend__dot tactical-legend__dot--partido" />
            Partido
          </span>
          <span className="tactical-legend__item">
            <span className="tactical-legend__dot tactical-legend__dot--fisico" />
            Físico
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
          colorFisico={colorFisico}
          onSelectDate={onSelectDate}
        />
      )}
      {fechaSesionSeleccionada && (
        <SessionDayPanel {...sessionDayPanelProps} />
      )}
    </div>
  );
}
