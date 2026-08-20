import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { equipoLogoDocId } from "./logoDocs.js";

const BATCH_LIMIT = 400;

async function commitOps(db, ops) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    ops.slice(i, i + BATCH_LIMIT).forEach((op) => op(batch));
    await batch.commit();
  }
}

export async function deleteEquipoCascade(db, equipoId) {
  const [jugadorasSnap, sesionesSnap] = await Promise.all([
    getDocs(query(collection(db, "Jugadoras"), where("equipoId", "==", equipoId))),
    getDocs(query(collection(db, "Sesiones"), where("equipoId", "==", equipoId))),
  ]);

  const ops = [];
  sesionesSnap.docs.forEach((sesionDoc) => {
    ops.push((batch) => batch.delete(sesionDoc.ref));
  });
  jugadorasSnap.docs.forEach((jugadoraDoc) => {
    ops.push((batch) => batch.delete(jugadoraDoc.ref));
  });
  ops.push((batch) => batch.delete(doc(db, "Logos", equipoLogoDocId(equipoId))));
  ops.push((batch) => batch.delete(doc(db, "Equipos", equipoId)));

  await commitOps(db, ops);

  return {
    jugadoras: jugadorasSnap.size,
    sesiones: sesionesSnap.size,
  };
}

export async function deleteClubCascade(db, clubId) {
  const equiposSnap = await getDocs(query(collection(db, "Equipos"), where("clubId", "==", clubId)));
  const equipos = equiposSnap.docs;
  const equipoIds = equipos.map((equipoDoc) => equipoDoc.id);

  const [jugadorasSnap, logosSnap, usuariosSnap, solicitudesSnap] = await Promise.all([
    getDocs(query(collection(db, "Jugadoras"), where("clubId", "==", clubId))),
    getDocs(query(collection(db, "Logos"), where("clubId", "==", clubId))),
    getDocs(query(collection(db, "Usuarios"), where("clubId", "==", clubId))),
    getDocs(query(collection(db, "Usuarios"), where("solicitudClubId", "==", clubId))),
  ]);

  const sesionesDocs = [];
  for (const equipoId of equipoIds) {
    const sesSnap = await getDocs(query(collection(db, "Sesiones"), where("equipoId", "==", equipoId)));
    sesionesDocs.push(...sesSnap.docs);
  }

  const assignedUserIds = new Set(usuariosSnap.docs.map((userDoc) => userDoc.id));
  const ops = [];

  sesionesDocs.forEach((sesionDoc) => {
    ops.push((batch) => batch.delete(sesionDoc.ref));
  });
  jugadorasSnap.docs.forEach((jugadoraDoc) => {
    ops.push((batch) => batch.delete(jugadoraDoc.ref));
  });
  logosSnap.docs.forEach((logoDoc) => {
    ops.push((batch) => batch.delete(logoDoc.ref));
  });
  equipos.forEach((equipoDoc) => {
    ops.push((batch) => batch.delete(equipoDoc.ref));
  });
  usuariosSnap.docs.forEach((userDoc) => {
    const rol = userDoc.data().rol === "superadmin" ? "superadmin" : "entrenador";
    ops.push((batch) =>
      batch.update(userDoc.ref, {
        clubId: null,
        clubNombre: null,
        rol,
        solicitudClubId: null,
        solicitudClubNombre: null,
      })
    );
  });
  solicitudesSnap.docs.forEach((userDoc) => {
    if (assignedUserIds.has(userDoc.id)) return;
    ops.push((batch) =>
      batch.update(userDoc.ref, {
        solicitudClubId: null,
        solicitudClubNombre: null,
      })
    );
  });
  ops.push((batch) => batch.delete(doc(db, "Clubes", clubId)));

  await commitOps(db, ops);

  return {
    equipos: equipos.length,
    jugadoras: jugadorasSnap.size,
    sesiones: sesionesDocs.length,
    usuarios: usuariosSnap.size,
  };
}
