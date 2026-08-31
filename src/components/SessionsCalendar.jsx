import {
  dayNames,
  formatDateYYYYMMDD,
  getCalendarMatrix,
  normalizarTipoSesion,
  TIPO_SESION_ENTRENO,
  TIPO_SESION_FISICO,
  TIPO_SESION_PARTIDO,
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
  colorFisico,
  onSelectDate,
}) {
  const sesionesPorFecha = {};
  sesionesEquipo.forEach((s) => {
    if (!sesionesPorFecha[s.fecha]) sesionesPorFecha[s.fecha] = [];
    sesionesPorFecha[s.fecha].push(s);
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
            const sesionesDia = sesionesPorFecha[ymd] || [];
            const tieneSesion = sesionesDia.length > 0;
            const tipos = new Set(sesionesDia.map((s) => normalizarTipoSesion(s)));
            const hoy = formatDateYYYYMMDD(new Date());
            const borderColor = tipos.has(TIPO_SESION_PARTIDO)
              ? colorPartido
              : tipos.has(TIPO_SESION_FISICO) && !tipos.has(TIPO_SESION_ENTRENO)
                ? colorFisico
                : tieneSesion
                  ? accent
                  : undefined;
            return (
              <button
                key={widx + "-" + didx}
                type="button"
                disabled={otherMonth}
                onClick={() => onSelectDate(ymd)}
                className={`calendar-day${otherMonth ? " calendar-day--other" : ""}${ymd === hoy ? " calendar-day--today" : ""}`}
                style={{
                  borderColor,
                }}
                tabIndex={otherMonth ? -1 : 0}
              >
                {date.getDate()}
                {tieneSesion && (
                  <span className="calendar-day__dots">
                    {tipos.has(TIPO_SESION_ENTRENO) && (
                      <span className="calendar-day__dot" style={{ background: accent }} />
                    )}
                    {tipos.has(TIPO_SESION_PARTIDO) && (
                      <span className="calendar-day__dot" style={{ background: colorPartido }} />
                    )}
                    {tipos.has(TIPO_SESION_FISICO) && (
                      <span className="calendar-day__dot" style={{ background: colorFisico }} />
                    )}
                  </span>
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
