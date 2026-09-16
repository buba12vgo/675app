import { EmptyState } from "../components/EmptyState.jsx";

export function SolicitarClubView({
  accentLight,
  solicitudClubId,
  solicitudClubNombre,
  selectClubLoading,
  clubes,
  onSolicitarClub,
}) {
  return (
    <div className="section-heading tactical-page" style={{ marginTop: 24 }}>
      <h2 className="tactical-title">Paso 1</h2>
      <p className="tactical-lead">Solicita unirte a tu Club</p>
      {solicitudClubId && (
        <div className="notice-banner" style={{ marginTop: 8, width: "98%" }}>
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
