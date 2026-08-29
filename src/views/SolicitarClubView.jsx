import { EmptyState } from "../components/EmptyState.jsx";

export function SolicitarClubView({
  accent,
  accentLight,
  accentSoft,
  accentBorder,
  text,
  solicitudClubId,
  solicitudClubNombre,
  selectClubLoading,
  clubes,
  onSolicitarClub,
}) {
  return (
    <div className="section-heading" style={{ marginTop: 65, fontSize: 23, fontWeight: 800 }}>
      <div>
        Paso 1:
        <br />
        <span style={{ color: accent }}>Solicita unirte a tu Club</span>
      </div>
      {solicitudClubId && (
        <div
          style={{
            marginTop: 20,
            width: "98%",
            padding: "14px 16px",
            borderRadius: 12,
            background: accentSoft,
            border: `1px solid ${accentBorder}`,
            color: text,
            fontSize: 14,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          Tu solicitud para{" "}
          <span style={{ color: accentLight, fontWeight: 700 }}>{solicitudClubNombre}</span> está pendiente
          de aprobación por el superadmin.
        </div>
      )}
      <div
        style={{
          marginTop: 35,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 15,
        }}
      >
        {selectClubLoading ? (
          <EmptyState title="Cargando clubes…" />
        ) : clubes.length === 0 ? (
          <EmptyState
            title="No hay clubes disponibles"
            hint="Cuando el superadmin cree uno, aparecerá aquí."
          />
        ) : (
          <div className="content-medium responsive-grid-list" style={{ width: "98%" }}>
            {clubes.map((club) => (
              <div key={club.id} className="entity-list-card">
                <div className="entity-list-card__body">
                  <div className="entity-list-card__title-row">
                    <span className="entity-list-card__dot">●</span>
                    <span className="entity-list-card__title">{club.nombre}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="entity-list-card__action"
                  onClick={() => onSolicitarClub(club)}
                  disabled={solicitudClubId === club.id}
                >
                  {solicitudClubId === club.id ? "Solicitado" : "Solicitar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
