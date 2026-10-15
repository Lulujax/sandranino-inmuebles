import type JSZip from 'jszip';
import { Inmueble } from './types';
import { formatPrice, formatDate, parseContactInfo } from './utils';

/**
 * Carga JSZip bajo demanda (lazy-loading) únicamente al hacer clic en descargar.
 * Esto evita cargar librerías pesadas en memoria al abrir la página.
 */
async function loadJSZip(): Promise<typeof import('jszip')> {
  const mod = await import('jszip');
  return ((mod as unknown as { default: typeof import('jszip') }).default ||
    mod) as unknown as typeof import('jszip');
}

/**
 * Limpia y normaliza el nombre de una carpeta o archivo para evitar
 * caracteres inválidos en Windows, macOS y Linux.
 */
export function sanitizeFolderName(name: string): string {
  if (!name) return 'Inmueble';
  const cleaned = name
    .replace(/[\\/:*?"<>|\r\n\t]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
  return cleaned || 'Inmueble';
}

/**
 * Convierte un Data URL (base64) a Blob
 */
function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  let ext = mime.split('/')[1] || 'jpg';
  if (ext === 'jpeg') ext = 'jpg';
  return { blob: new Blob([array], { type: mime }), ext };
}

/**
 * Descarga una imagen remota (Supabase Storage, URL pública o blob)
 * y la retorna en formato Blob con su extensión detectada.
 * Incluye respaldo vía elemento HTMLImage + Canvas en caso de bloqueo.
 */
async function fetchImageAsBlob(
  url: string
): Promise<{ blob: Blob; ext: string } | null> {
  if (!url) return null;

  // 1. Caso Data URL (base64)
  if (url.startsWith('data:')) {
    try {
      return dataUrlToBlob(url);
    } catch (err) {
      console.warn('Error decodificando data URL:', err);
      return null;
    }
  }

  // 2. Intentar fetch directo con CORS
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      let ext = 'jpg';
      if (blob.type) {
        const sub = blob.type.split('/')[1]?.toLowerCase();
        if (sub) ext = sub === 'jpeg' ? 'jpg' : sub;
      } else {
        const match = url.match(/\.(jpg|jpeg|png|webp|avif|gif)($|\?)/i);
        if (match) ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      }
      return { blob, ext };
    }
  } catch (fetchErr) {
    // Si fetch falla (e.g. CORS), intentamos fallback con Image + Canvas
    console.warn(`Fetch directo falló para ${url.slice(0, 60)}..., intentando fallback:`, fetchErr);
  }

  // 3. Fallback: Cargar como HTMLImageElement y extraer blob de canvas
  if (typeof window !== 'undefined') {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('No se pudo cargar la imagen para canvas'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.92)
        );
        if (blob) {
          return { blob, ext: 'jpg' };
        }
      }
    } catch (canvasErr) {
      console.warn(`Fallback de canvas también falló para ${url.slice(0, 60)}:`, canvasErr);
    }
  }

  return null;
}

/**
 * Genera el archivo de texto (.txt) con la descripción y todos los detalles
 * técnicos, de ubicación e información privada del inmueble.
 */
export function generatePropertyDetailsText(property: Inmueble): string {
  const lines: string[] = [];

  // Título principal en negrita para WhatsApp
  const titleText = property.title ? property.title.trim() : 'INMUEBLE';
  lines.push(`*${titleText.toUpperCase()}*`);
  lines.push('');

  // Operación, Tipo, Precio y Referencia
  const priceFormatted = formatPrice(property.price, property.operation);
  lines.push(`💵 *${(property.operation || 'Precio').toUpperCase()}:* ${priceFormatted}`);
  if (property.type) {
    lines.push(`🏢 *TIPO:* ${property.type}`);
  }
  if (property.internal_code) {
    lines.push(`🏷️ *REF:* ${property.internal_code}`);
  }
  lines.push('');

  // Ubicación
  const locParts: string[] = [];
  if (property.sector) locParts.push(property.sector);
  if (property.city) locParts.push(property.city);
  if (property.state) locParts.push(property.state);

  if (locParts.length > 0) {
    lines.push(`📍 *UBICACIÓN:* ${locParts.join(', ')}`);
    if (property.show_exact_location && property.address) {
      lines.push(`• Dirección: ${property.address}`);
    }
    lines.push('');
  }

  // Características y medidas
  const specs: string[] = [];
  if (property.bedrooms !== undefined && property.bedrooms !== null) {
    specs.push(`• Habitaciones: ${property.bedrooms}`);
  }
  if (property.bathrooms !== undefined && property.bathrooms !== null) {
    specs.push(`• Baños: ${property.bathrooms}`);
  }
  if (property.parking !== undefined && property.parking !== null) {
    specs.push(`• Puestos de estacionamiento: ${property.parking}`);
  }
  if (property.built_area) {
    specs.push(`• Construcción: ${property.built_area} m²`);
  }
  if (property.land_area) {
    specs.push(`• Terreno: ${property.land_area} m²`);
  }
  if (property.total_area) {
    specs.push(`• Área total: ${property.total_area} m²`);
  }
  if (property.year) {
    specs.push(`• Año: ${property.year}`);
  }
  if (property.height) {
    specs.push(`• Altura: ${property.height} m`);
  }
  if (property.offices) {
    specs.push(`• Oficinas: ${property.offices}`);
  }

  if (specs.length > 0) {
    lines.push('📐 *CARACTERÍSTICAS:*');
    lines.push(...specs);
    lines.push('');
  }

  // Descripción
  if (property.description && property.description.trim()) {
    lines.push('📝 *DESCRIPCIÓN:*');
    lines.push(property.description.trim());
    lines.push('');
  }

  // Enlace a la ficha pública
  if (typeof window !== 'undefined' && property.id) {
    lines.push('🌐 *FICHA EN LA WEB:*');
    lines.push(`${window.location.origin}/inmueble/${property.id}`);
    lines.push('');
  }

  // Datos internos de contacto / captación (propietario o colega asesor)
  if (property.owner_name || property.owner_phone || property.notes) {
    const contact = parseContactInfo(property);
    lines.push('🔒 *CONTACTO / CAPTACIÓN (USO INTERNO):*');
    lines.push(`• Origen / Tipo: ${contact.label}`);
    if (contact.name) {
      lines.push(`• Contacto: ${contact.name}`);
    }
    if (contact.phone) {
      lines.push(`• Teléfono: ${contact.phone}`);
    }
    if (property.notes && property.notes.trim()) {
      lines.push(`• Notas internas: ${property.notes.trim()}`);
    }
    lines.push('');
  }

  return lines.join('\r\n').trim();
}

/**
 * Añade un inmueble específico a una instancia de JSZip:
 * Crea una carpeta con el título del inmueble, dentro coloca el archivo .txt
 * con la descripción y detalles, y todas las fotos.
 */
export async function addPropertyToZip(
  zip: JSZip,
  property: Inmueble,
  customFolderName?: string,
  onProgress?: (imageIndex: number, totalImages: number) => void
): Promise<void> {
  const folderName = customFolderName || sanitizeFolderName(property.title);
  const folder = zip.folder(folderName);
  if (!folder) {
    throw new Error(`No se pudo crear la carpeta "${folderName}" en el archivo ZIP`);
  }

  // 1. Agregar archivo de texto con descripción y detalles
  const txtContent = generatePropertyDetailsText(property);
  folder.file('descripcion_y_detalles.txt', txtContent);

  // 2. Descargar y agregar todas las fotos
  const images = property.images || [];
  const totalImages = images.length;

  for (let i = 0; i < totalImages; i++) {
    onProgress?.(i + 1, totalImages);
    const imageUrl = images[i];
    const imageResult = await fetchImageAsBlob(imageUrl);

    if (imageResult) {
      const numStr = String(i + 1).padStart(2, '0');
      folder.file(`foto_${numStr}.${imageResult.ext}`, imageResult.blob);
    }
  }
}

/**
 * Descarga en el navegador un archivo Blob o File
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Empaqueta y descarga un único inmueble en un archivo .zip:
 * - Dentro contiene una carpeta con el título del inmueble
 * - Dentro de la carpeta: un txt con descripción y detalles, y todas las fotos
 */
export async function downloadSinglePropertyZip(
  property: Inmueble,
  onProgress?: (imageIndex: number, totalImages: number) => void
): Promise<void> {
  const JSZipClass = await loadJSZip();
  const zip = new JSZipClass();
  await addPropertyToZip(zip, property, undefined, onProgress);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const zipFilename = `${sanitizeFolderName(property.title)}.zip`;
  triggerFileDownload(zipBlob, zipFilename);
}

/**
 * Empaqueta y descarga un grupo de inmuebles en un único archivo .zip:
 * - Cada inmueble tiene su propia carpeta con su título
 * - Dentro de cada carpeta: txt con descripción y detalles, y sus fotos
 */
export async function downloadBulkPropertiesZip(
  properties: Inmueble[],
  zipFilename: string,
  onProgress?: (
    currentPropIndex: number,
    totalProps: number,
    currentPropTitle: string
  ) => void
): Promise<void> {
  const JSZipClass = await loadJSZip();
  const zip = new JSZipClass();
  const usedFolderNames = new Set<string>();

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    onProgress?.(i + 1, properties.length, prop.title);

    let baseFolderName = sanitizeFolderName(prop.title);
    let uniqueFolderName = baseFolderName;
    let counter = 2;

    while (usedFolderNames.has(uniqueFolderName.toLowerCase())) {
      const suffix = prop.internal_code ? `_${prop.internal_code}` : `_${counter}`;
      uniqueFolderName = `${baseFolderName}${suffix}`;
      counter++;
    }
    usedFolderNames.add(uniqueFolderName.toLowerCase());

    await addPropertyToZip(zip, prop, uniqueFolderName);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  triggerFileDownload(zipBlob, zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`);
}
