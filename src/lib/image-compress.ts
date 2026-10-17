// ============================================================================
// Compresión de imágenes compartida (fotos públicas y privada del wizard)
// Misma lógica que venía en WizardStep: redimensiona a máx. 1200px por lado
// y exporta JPEG calidad 0.8 mediante canvas, con respaldos por si falla.
// ============================================================================

const MAX_DIM = 1200;
const QUALITY = 0.8;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function scaledCanvas(img: HTMLImageElement): HTMLCanvasElement | null {
  try {
    let { width, height } = img;
    if (width > MAX_DIM || height > MAX_DIM) {
      if (width > height) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } catch {
    return null;
  }
}

/**
 * Comprime una imagen a Data URL persistente (JPEG ~0.8, máx 1200px).
 * Fallback: se devuelve el blobUrl original o un Data URL vía FileReader.
 */
export async function compressImageToDataUrl(
  file: File,
  fallbackBlobUrl: string
): Promise<string> {
  try {
    const img = await loadImage(fallbackBlobUrl);
    const canvas = scaledCanvas(img);
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
      if (dataUrl) return dataUrl;
    }
  } catch {
    // se intenta el respaldo
  }
  try {
    const reader = new FileReader();
    const result = await new Promise<string>((resolve) => {
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
    return result || fallbackBlobUrl;
  } catch {
    return fallbackBlobUrl;
  }
}

/**
 * Comprime una imagen y devuelve el Blob listo para subir a Storage.
 * Devuelve null si no se pudo procesar (mejor abortar para info privada).
 */
export async function compressImageToBlob(file: File): Promise<Blob | null> {
  try {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImage(objectUrl);
      const canvas = scaledCanvas(img);
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', QUALITY)
        );
        if (blob) return blob;
      }
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
    // Respaldo: sube el archivo original si canvas falla
    return file;
  } catch {
    return null;
  }
}
