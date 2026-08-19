export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_INLINE_MAX_CHARS = 750_000;

const MIME_BY_EXTENSION = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export function getFileMimeType(file) {
  if (file?.type) return file.type;
  const ext = file?.name?.split(".").pop()?.toLowerCase();
  return MIME_BY_EXTENSION[ext] || "";
}

export function validateLogoFile(file) {
  if (!file) return "No se seleccionó ningún archivo.";
  const mime = getFileMimeType(file);
  if (!LOGO_ACCEPT.split(",").includes(mime)) {
    return "Formato no válido. Usa PNG, JPG, WEBP, GIF o SVG.";
  }
  if (file.size > LOGO_MAX_BYTES) return "La imagen no puede superar 2 MB.";
  return null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

function optimizeRasterLogo(file, maxDim = 256) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxDim / Math.max(image.width, image.height, 1));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      let dataUrl = canvas.toDataURL("image/png");
      if (dataUrl.length > LOGO_INLINE_MAX_CHARS) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      }
      if (dataUrl.length > LOGO_INLINE_MAX_CHARS) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.65);
      }

      if (dataUrl.length > LOGO_INLINE_MAX_CHARS) {
        reject(new Error("La imagen sigue siendo demasiado grande. Prueba con otra más pequeña."));
        return;
      }

      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar la imagen seleccionada."));
    };

    image.src = objectUrl;
  });
}

async function optimizeLogoToDataUrl(file) {
  const mime = getFileMimeType(file);
  if (mime === "image/svg+xml") {
    const dataUrl = await readFileAsDataUrl(file);
    if (typeof dataUrl !== "string" || dataUrl.length > LOGO_INLINE_MAX_CHARS) {
      throw new Error("El SVG es demasiado grande. Usa un archivo más ligero.");
    }
    return dataUrl;
  }

  return optimizeRasterLogo(file);
}

export async function prepareLogoDataUrl(file) {
  return optimizeLogoToDataUrl(file);
}

export function getLogoErrorMessage(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (code.includes("permission-denied")) {
    return "No tienes permiso para guardar el escudo.";
  }
  if (message) return message;
  return "No se pudo guardar el escudo.";
}
