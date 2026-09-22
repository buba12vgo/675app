import { doc, runTransaction } from "firebase/firestore";

export function dorsalReservaId(equipoId, dorsal) {
  const n = Number(dorsal);
  return `${equipoId}_${String(n).padStart(2, "0")}`;
}

function dorsalOcupadoError() {
  const err = new Error("dorsal-ocupado");
  err.code = "dorsal-ocupado";
  return err;
}

/**
 * Reserva el dorsal del equipo en la misma transacción que el alta o el cambio.
 * Si otro jugador vivo ya lo tiene, falla con code dorsal-ocupado.
 */
export async function guardarJugadoraConDorsal(db, {
  ref,
  payload,
  equipoId,
  clubId,
  dorsal,
  dorsalAnterior = null,
  mode,
}) {
  await runTransaction(db, async (tx) => {
    const nuevaRef = dorsal != null ? doc(db, "Dorsales", dorsalReservaId(equipoId, dorsal)) : null;
    const sueltaAnterior = dorsalAnterior != null && Number(dorsalAnterior) !== Number(dorsal);
    const anteriorRef = sueltaAnterior
      ? doc(db, "Dorsales", dorsalReservaId(equipoId, dorsalAnterior))
      : null;

    const nuevaSnap = nuevaRef ? await tx.get(nuevaRef) : null;
    const anteriorSnap = anteriorRef ? await tx.get(anteriorRef) : null;

    if (nuevaSnap?.exists()) {
      const ownerId = nuevaSnap.data()?.jugadoraId;
      if (ownerId && ownerId !== ref.id) {
        const ownerSnap = await tx.get(doc(db, "Jugadoras", ownerId));
        if (ownerSnap.exists()) throw dorsalOcupadoError();
      }
    }

    if (mode === "delete") {
      if (nuevaSnap?.exists() && nuevaSnap.data()?.jugadoraId === ref.id) tx.delete(nuevaRef);
      tx.delete(ref);
      return;
    }

    if (nuevaRef) {
      tx.set(nuevaRef, {
        equipoId,
        clubId,
        dorsal: Number(dorsal),
        jugadoraId: ref.id,
      });
    }
    if (anteriorSnap?.exists() && anteriorSnap.data()?.jugadoraId === ref.id) {
      tx.delete(anteriorRef);
    }
    if (mode === "create") tx.set(ref, payload);
    else tx.update(ref, payload);
  });
}
