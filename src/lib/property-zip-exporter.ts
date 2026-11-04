import type JSZip from 'jszip';
import { Inmueble, InfoPrivadaInmueble } from './types';
import { formatPrice, formatDate, parseContactInfo, buildPublicationDescription } from './utils';
import { privateInfoStore } from './private-info';

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
 * Devuelve el nombre de carpeta/archivo de un inmueble usando su código
 * interno (ej: SN-01). Si no tiene código, usa el título como respaldo.
 */
export function getPropertyFolderName(property: Inmueble): string {
  const code = property.internal_code?.trim();
  return sanitizeFolderName(code || property.title);
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
 * Ejecuta una lista de tareas asíncronas con concurrencia máxima controlada.
 */
async function runConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  const workers = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Descarga una imagen remota (Supabase Storage, URL pública o blob)
 * y la retorna en formato Blob con su extensión detectada.
 * Incluye respaldo vía elemento HTMLImage + Canvas en caso de bloqueo.
 */
async function fetchImageAsBlob(
  url: string,
  signal?: AbortSignal
): Promise<{ blob: Blob; ext: string } | null> {
  if (!url || signal?.aborted) return null;

  // 1. Caso Data URL (base64)
  if (url.startsWith('data:')) {
    try {
      return dataUrlToBlob(url);
    } catch (err) {
      console.warn('Error decodificando data URL:', err);
      return null;
    }
  }

  // 2. Intentar fetch directo con CORS y señal de aborto
  try {
    const res = await fetch(url, { mode: 'cors', signal });
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
  } catch (fetchErr: unknown) {
    if (signal?.aborted || (fetchErr as { name?: string })?.name === 'AbortError') {
      return null;
    }
    // Si fetch falla (e.g. CORS), intentamos fallback con Image + Canvas
    console.warn(`Fetch directo falló para ${url.slice(0, 60)}..., intentando fallback:`, fetchErr);
  }

  if (signal?.aborted) return null;

  // 3. Fallback: Cargar como HTMLImageElement y extraer blob de canvas
  if (typeof window !== 'undefined') {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(new Error('Aborted'));
        const onAbort = () => {
          img.src = '';
          reject(new Error('Aborted'));
        };
        signal?.addEventListener('abort', onAbort, { once: true });
        img.onload = () => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        };
        img.onerror = () => {
          signal?.removeEventListener('abort', onAbort);
          reject(new Error('No se pudo cargar la imagen para canvas'));
        };
        img.src = url;
      });

      if (signal?.aborted) return null;

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
    } catch (canvasErr: unknown) {
      if (signal?.aborted) return null;
      console.warn(`Fallback de canvas también falló para ${url.slice(0, 60)}:`, canvasErr);
    }
  }

  return null;
}

/**
 * Genera el archivo de texto (.txt) con la descripción y todos los detalles
 * técnicos, de ubicación e información privada del inmueble.
 */
export function generatePropertyDetailsText(
  property: Inmueble,
  privateInfo?: InfoPrivadaInmueble | null
): string {
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

  // Descripción con el formato de publicación + la firma de Sandra al final
  const publicationDescription = buildPublicationDescription(property, {
    withSignature: true,
  });
  if (publicationDescription) {
    lines.push('📝 *DESCRIPCIÓN:*');
    lines.push(publicationDescription);
    lines.push('');
  }

  // Enlace a la ficha pública
  if (typeof window !== 'undefined' && property.id) {
    lines.push('🌐 *FICHA EN LA WEB:*');
    lines.push(`${window.location.origin}/inmueble/${property.id}`);
    lines.push('');
  }

  // Datos internos de contacto / captación (propietario o colega asesor)
  // (Las notas privadas unificadas viven en el bloque 🔒 de abajo, junto a info_privada_inmuebles)
  if (property.owner_name || property.owner_phone) {
    const contact = parseContactInfo(property);
    lines.push('🔒 *CONTACTO / CAPTACIÓN (USO INTERNO):*');
    lines.push(`• Origen / Tipo: ${contact.label}`);
    if (contact.name) {
      lines.push(`• Contacto: ${contact.name}`);
    }
    if (contact.phone) {
      lines.push(`• Teléfono: ${contact.phone}`);
    }
    lines.push('');
  }

  // 🔒 Info privada de orientación (solo aparece en tus ZIP, jamás en lo público)
  if (privateInfo) {
    const privLines: string[] = [];
    if (privateInfo.ubicacion_exacta?.trim()) {
      privLines.push(`• Ubicación exacta: ${privateInfo.ubicacion_exacta.trim()}`);
    }
    if (privateInfo.notas?.trim()) {
      privLines.push(`• Notas: ${privateInfo.notas.trim()}`);
    }
    const facadeCount = privateInfo.fachada_urls?.filter(Boolean).length || 0;
    if (facadeCount > 0) {
      privLines.push(
        `• Fotos de fachada de enfrente incluidas en esta carpeta como fachada_XX: ${facadeCount}`
      );
    }
    if (privLines.length > 0) {
      lines.push('🔒 *INFO PRIVADA DE ORIENTACIÓN (USO INTERNO):*');
      lines.push(...privLines);
      lines.push('');
    }
  }

  return lines.join('\r\n').trim();
}

export interface BulkProgress {
  current: number;
  total: number;
  title: string;
  partIndex?: number;
  totalParts?: number;
}

export interface BulkExportOptions {
  signal?: AbortSignal;
  chunkSize?: number;
  onProgress?: (progress: BulkProgress) => void;
}

/**
 * Añade un inmueble específico a una instancia de JSZip:
 * Crea una carpeta con el código interno del inmueble, dentro coloca el
 * archivo .txt con la descripción y detalles, y todas las fotos en paralelo (5 concurrentes).
 */
export async function addPropertyToZip(
  zip: JSZip,
  property: Inmueble,
  customFolderName?: string,
  onProgress?: (imageIndex: number, totalImages: number) => void,
  prefetchedPrivateInfo?: InfoPrivadaInmueble | null,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) return;

  const folderName = customFolderName || getPropertyFolderName(property);
  const folder = zip.folder(folderName);
  if (!folder) {
    throw new Error(`No se pudo crear la carpeta "${folderName}" en el archivo ZIP`);
  }

  // 🔒 Info privada (usa la precargada o la consulta individual si no se pasó)
  let privateInfo: InfoPrivadaInmueble | null =
    prefetchedPrivateInfo !== undefined ? prefetchedPrivateInfo : null;
  if (prefetchedPrivateInfo === undefined) {
    try {
      privateInfo = await privateInfoStore.get(property.id);
    } catch {
      privateInfo = null;
    }
  }

  if (signal?.aborted) return;

  // 1. Agregar archivo de texto con descripción y detalles
  const txtContent = generatePropertyDetailsText(property, privateInfo);
  folder.file('descripcion_y_detalles.txt', txtContent);

  // 2. Descargar fotos con concurrencia controlada (5 simultáneas)
  const images = property.images || [];
  const totalImages = images.length;
  let downloadedCount = 0;

  const imageBlobs = await runConcurrent(images, 5, async (imageUrl) => {
    if (signal?.aborted) return null;
    const res = await fetchImageAsBlob(imageUrl, signal);
    downloadedCount++;
    onProgress?.(downloadedCount, totalImages);
    return res;
  });

  if (signal?.aborted) return;

  for (let i = 0; i < imageBlobs.length; i++) {
    const imageResult = imageBlobs[i];
    if (imageResult) {
      const numStr = String(i + 1).padStart(2, '0');
      folder.file(`foto_${numStr}.${imageResult.ext}`, imageResult.blob);
    }
  }

  // 3. 🔒 Fotos de fachada de enfrente (bucket privado, URLs firmadas)
  const facadeUrls = privateInfo?.fachada_urls?.filter(Boolean) || [];
  if (facadeUrls.length > 0 && !signal?.aborted) {
    const facadeBlobs = await privateInfoStore.getFacadeBlobs(facadeUrls, signal);
    for (let i = 0; i < facadeBlobs.length; i++) {
      const numStr = String(i + 1).padStart(2, '0');
      folder.file(`fachada_${numStr}.jpg`, facadeBlobs[i].blob);
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
 * - El nombre del ZIP y la carpeta interna usan el código del inmueble
 * - Dentro de la carpeta: un txt con descripción y detalles, y todas las fotos
 * - Usa compresión 'STORE' (cero CPU, instantáneo)
 */
export async function downloadSinglePropertyZip(
  property: Inmueble,
  onProgress?: (imageIndex: number, totalImages: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const JSZipClass = await loadJSZip();
  const zip = new JSZipClass();
  await addPropertyToZip(zip, property, undefined, onProgress, undefined, signal);

  if (signal?.aborted) return;

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'STORE',
  });

  if (signal?.aborted) return;

  const zipFilename = `${getPropertyFolderName(property)}.zip`;
  triggerFileDownload(zipBlob, zipFilename);
}

/**
 * Empaqueta y descarga un grupo de inmuebles en archivos .zip de forma optimizada:
 * - Pre-carga la información privada de todos los inmuebles en un solo viaje (Batch SQL)
 * - Descarga fotos en paralelo con concurrencia controlada
 * - Empaqueta sin re-comprimir ('STORE') evitando congelar la CPU
 * - Si el lote excede el tamaño seguro (chunkSize = 50), descarga por partes automáticas
 *   para evitar que la memoria RAM del navegador colapse.
 */
export async function downloadBulkPropertiesZip(
  properties: Inmueble[],
  zipFilename: string,
  progressOrOptions?:
    | ((current: number, total: number, title: string) => void)
    | BulkExportOptions
): Promise<void> {
  const options: BulkExportOptions =
    typeof progressOrOptions === 'function'
      ? { onProgress: (p) => progressOrOptions(p.current, p.total, p.title) }
      : progressOrOptions || {};

  const signal = options.signal;
  const onProgress = options.onProgress;
  const chunkSize = options.chunkSize && options.chunkSize > 0 ? options.chunkSize : 50;

  if (!properties || properties.length === 0 || signal?.aborted) return;

  // 1. Pre-cargar info privada de todos los inmuebles en 1 sola consulta
  const propertyIds = properties.map((p) => p.id);
  const privateInfoMap = await privateInfoStore.getBatch(propertyIds);

  if (signal?.aborted) return;

  const totalParts = Math.ceil(properties.length / chunkSize);
  const JSZipClass = await loadJSZip();
  const baseFilename = zipFilename.replace(/\.zip$/i, '');

  for (let part = 0; part < totalParts; part++) {
    if (signal?.aborted) return;

    const startIdx = part * chunkSize;
    const chunkProperties = properties.slice(startIdx, startIdx + chunkSize);
    const partNumber = part + 1;

    let zip: JSZip | null = new JSZipClass();
    const usedFolderNames = new Set<string>();

    for (let i = 0; i < chunkProperties.length; i++) {
      if (signal?.aborted) return;

      const prop = chunkProperties[i];
      const globalIndex = startIdx + i + 1;

      onProgress?.({
        current: globalIndex,
        total: properties.length,
        title: prop.title,
        partIndex: totalParts > 1 ? partNumber : undefined,
        totalParts: totalParts > 1 ? totalParts : undefined,
      });

      const baseFolderName = getPropertyFolderName(prop);
      let uniqueFolderName = baseFolderName;
      let counter = 2;

      while (usedFolderNames.has(uniqueFolderName.toLowerCase())) {
        uniqueFolderName = `${baseFolderName}_${counter}`;
        counter++;
      }
      usedFolderNames.add(uniqueFolderName.toLowerCase());

      const prefetchedInfo = privateInfoMap.get(prop.id) || null;
      await addPropertyToZip(
        zip,
        prop,
        uniqueFolderName,
        undefined,
        prefetchedInfo,
        signal
      );
    }

    if (signal?.aborted) return;

    // Empaque instantáneo sin CPU costosa
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE',
    });

    if (signal?.aborted) return;

    const currentZipFilename =
      totalParts > 1
        ? `${baseFilename}_parte_${partNumber}_de_${totalParts}.zip`
        : `${baseFilename}.zip`;

    triggerFileDownload(zipBlob, currentZipFilename);

    // Liberar referencia para que el Garbage Collector libere RAM de inmediato
    zip = null;

    if (part < totalParts - 1) {
      // Pausa mínima de 350ms entre partes para dar respiro al navegador
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}
