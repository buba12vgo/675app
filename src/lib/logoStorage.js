export function logoObjectPath(uid, tipo, entityId, ext) {
  const safeUid = String(uid || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeEntity = String(entityId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeTipo = tipo === "equipo" ? "equipo" : "club";
  const safeExt = String(ext || "png").replace(/[^a-z0-9]/g, "") || "png";
  return `logos/${safeUid}/${safeTipo}_${safeEntity}.${safeExt}`;
}

async function storageApi() {
  const [{ getApp }, { getStorage, ref, uploadBytes, getDownloadURL, deleteObject }] = await Promise.all([
    import("firebase/app"),
    import("firebase/storage"),
  ]);
  const storage = getStorage(getApp());
  return { storage, ref, uploadBytes, getDownloadURL, deleteObject };
}

export async function uploadLogoBytes(path, blob, contentType) {
  const { storage, ref, uploadBytes, getDownloadURL } = await storageApi();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}

export async function deleteLogoAtPath(path) {
  if (!path) return;
  const { storage, ref, deleteObject } = await storageApi();
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    if (err?.code === "storage/object-not-found") return;
    throw err;
  }
}
