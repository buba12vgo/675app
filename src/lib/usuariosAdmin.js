export function payloadGuardarUsuarioClub({
  clubId,
  clubNombre,
  rolFinal,
  equiposFavoritos,
}) {
  return {
    clubId,
    clubNombre,
    rol: rolFinal,
    solicitudClubId: null,
    solicitudClubNombre: null,
    equiposFavoritos,
  };
}

export function usuariosTrasGuardarClub(usuarios, usuarioId, payload) {
  return (usuarios || []).map((u) => (u.id === usuarioId ? { ...u, ...payload } : u));
}
