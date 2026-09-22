import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export function logoObjectPath(uid, tipo, entityId, ext) {
  const safeUid = String(uid || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeEntity = String(entityId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeTipo = tipo === "equipo" ? "equipo" : "club";
  const safeExt = String(ext || "png").replace(/[^a-z0-9]/g, "") || "png";
  return `logos/${safeUid}/${safeTipo}_${safeEntity}.${safeExt}`;
}

export async function uploadLogoBytes(path, blob, contentType) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

export async function deleteLogoAtPath(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    if (err?.code === "storage/object-not-found") return;
    throw err;
  }
}
