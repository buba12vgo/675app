import { describe, expect, it } from "vitest";
import { rangoConsultaSesiones } from "../../src/lib/appUtils.js";
import { dorsalReservaId } from "../../src/lib/dorsales.js";

describe("rangoConsultaSesiones", () => {
  const hoy = new Date(2026, 8, 22);

  it("acota el calendario y los próximos días", () => {
    const rango = rangoConsultaSesiones({
      mes: 8,
      anio: 2026,
      tab: "calendario",
      periodo: "mensual",
      hoy,
    });
    expect(rango.inicio).toBe("2026-08-25");
    expect(rango.fin).toBe("2027-01-20");
  });

  it("en estadísticas Todo no pone tope", () => {
    expect(rangoConsultaSesiones({
      mes: 8,
      anio: 2026,
      tab: "estadisticas",
      periodo: "todo",
      hoy,
    })).toBeNull();
  });

  it("en estadísticas mensuales incluye el mes en curso", () => {
    const rango = rangoConsultaSesiones({
      mes: 0,
      anio: 2026,
      tab: "estadisticas",
      periodo: "mensual",
      hoy,
    });
    expect(rango.inicio <= "2026-09-01").toBe(true);
    expect(rango.fin >= "2026-09-22").toBe(true);
  });
});

describe("dorsalReservaId", () => {
  it("rellena el dorsal a dos cifras", () => {
    expect(dorsalReservaId("eq-a", 7)).toBe("eq-a_07");
    expect(dorsalReservaId("eq-a", 12)).toBe("eq-a_12");
  });
});
