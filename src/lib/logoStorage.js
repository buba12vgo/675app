import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function validateLogoFile(file) {
  if (!file) return "No se seleccionó ningún archivo.";
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return "Formato no válido. Usa PNG, JPG, WEBP o GIF.";
  }
  if (file.size > MAX_LOGO_BYTES) return "La imagen no puede superar 2 MB.";
  return null;
}

function logoExtension(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadClubLogo(clubId, file) {
  const ext = logoExtension(file);
  const storageRef = ref(storage, `clubes/${clubId}/logo.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadEquipoLogo(equipoId, file) {
  const ext = logoExtension(file);
  const storageRef = ref(storage, `equipos/${equipoId}/logo.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function removeStoragePrefix(prefix) {
  const extensions = ["png", "jpg", "webp", "gif"];
  await Promise.all(
    extensions.map(async (ext) => {
      try {
        await deleteObject(ref(storage, `${prefix}/logo.${ext}`));
      } catch {
        /* ignore missing file */
      }
    })
  );
}
