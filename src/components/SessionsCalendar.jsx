import {
  dayNames,
  formatDateYYYYMMDD,
  getCalendarMatrix,
  normalizarTipoSesion,
} from "../lib/appUtils.js";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function SessionsCalendar({
  anioActual,
  mesActual,
  onPrevMonth,
  onNextMonth,
  sesionesEquipo,
  accent,
  colorPartido,
  onSelectDate,
}) {
  const sesionesPorFecha = {};
  sesionesEquipo.forEach((s) => {
    sesionesPorFecha[s.fecha] = s;
  });
  const weeksMatrix = getCalendarMatrix(anioActual, mesActual);

  return (
    <div className="content-wide calendar-panel">
      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={onPrevMonth}
          tabIndex={0}
          aria-label="Mes anterior"
        >
          {"‹"}
        </button>
        <span className="calendar-month-title">
          {MONTH_NAMES[mesActual]} {anioActual}
        </span>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={onNextMonth}
          tabIndex={0}
          aria-label="Mes siguiente"
        >
          {"›"}
        </button>
      </div>
      <div className="calendar-weekdays">
        {dayNames.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>
      <div
        className="calendar-grid"
        style={{ gridTemplateRows: `repeat(${weeksMatrix.length}, 1fr)` }}
      >
        {weeksMatrix.map((semana, widx) =>
          semana.map(({ date, otherMonth }, didx) => {
            const ymd = formatDateYYYYMMDD(date);
            const sesionDia = sesionesPorFecha[ymd];
            const tieneSesion = !!sesionDia;
            const esPartido = tieneSesion && normalizarTipoSesion(sesionDia) === "partido";
            const hoy = formatDateYYYYMMDD(new Date());
            const colorEvento = esPartido ? colorPartido : accent;
            return (
              <button
                key={widx + "-" + didx}
                type="button"
                disabled={otherMonth}
                onClick={() => onSelectDate(ymd)}
                className={`calendar-day${otherMonth ? " calendar-day--other" : ""}${ymd === hoy ? " calendar-day--today" : ""}`}
                style={{
                  borderColor: tieneSesion ? colorEvento : undefined,
                }}
                tabIndex={otherMonth ? -1 : 0}
              >
                {date.getDate()}
                {tieneSesion && (
                  <span
                    className="calendar-day__dot"
                    style={{ background: colorEvento }}
                  />
                )}
                {ymd === hoy && (
                  <span className="calendar-day__today-mark" title="Hoy" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
