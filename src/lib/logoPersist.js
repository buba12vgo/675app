import { deleteDoc, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import { clubLogoDocId, equipoLogoDocId } from "./logoDocs.js";
import { prepareLogoUpload } from "./logoImage.js";
import { deleteLogoAtPath, logoObjectPath, uploadLogoBytes } from "./logoStorage.js";

function logoDocId(tipo, entityId) {
  return tipo === "equipo" ? equipoLogoDocId(entityId) : clubLogoDocId(entityId);
}

export async function persistLogoToStorage({
  uid,
  tipo,
  entityId,
  clubId,
  fileOrDataUrl,
}) {
  if (!uid) throw new Error("No hay sesión para subir el escudo.");
  const prepared = await prepareLogoUpload(fileOrDataUrl);
  const logoRef = doc(db, "Logos", logoDocId(tipo, entityId));
  const previous = await getDoc(logoRef);
  const previousPath = previous.exists() ? previous.data().storagePath : null;

  try {
    const storagePath = logoObjectPath(uid, tipo, entityId, prepared.ext);
    const logoUrl = await uploadLogoBytes(storagePath, prepared.blob, prepared.contentType);
    await setDoc(logoRef, {
      tipo,
      entityId,
      clubId,
      logoUrl,
      logoSource: "storage",
      storagePath,
      actualizadoEn: new Date(),
    });
    if (previousPath && previousPath !== storagePath) {
      try {
        await deleteLogoAtPath(previousPath);
      } catch {
        /* el puntero nuevo ya está guardado */
      }
    }
    return logoUrl;
  } catch (err) {
    const code = String(err?.code || "");
    const message = String(err?.message || "");
    const storageMissing = code.startsWith("storage/") || /storage/i.test(message);
    if (!storageMissing) throw err;
    await setDoc(logoRef, {
      tipo,
      entityId,
      clubId,
      logoUrl: prepared.dataUrl,
      logoSource: "inline",
      actualizadoEn: new Date(),
    });
    return prepared.dataUrl;
  }
}

export async function deleteStoredLogo(tipo, entityId) {
  const logoRef = doc(db, "Logos", logoDocId(tipo, entityId));
  const previous = await getDoc(logoRef);
  const previousPath = previous.exists() ? previous.data().storagePath : null;
  if (previous.exists()) {
    await deleteDoc(logoRef);
  }
  await deleteLogoAtPath(previousPath);
}

export async function clearLegacyInlineLogo(collectionName, entityId) {
  await updateDoc(doc(db, collectionName, entityId), {
    logoUrl: deleteField(),
    logoSource: deleteField(),
    logoUpdatedAt: deleteField(),
  });
}

export async function deleteStoredLogoPaths(paths) {
  await Promise.all(
    [...new Set((paths || []).filter(Boolean))].map((path) => deleteLogoAtPath(path).catch(() => {}))
  );
}
