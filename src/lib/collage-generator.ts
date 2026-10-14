import { Inmueble } from './types';
import { formatPrice, formatArea, getPropertyMainArea } from './utils';

/**
 * Carga una imagen (data URL o URL remota) como HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = src;
  });
}

/**
 * Dibuja una imagen simulando 'object-fit: cover' con esquinas redondeadas opcionales
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 12
) {
  ctx.save();

  // Crear clipping path con bordes redondeados
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  const imgAspect = imgW / imgH;
  const targetAspect = w / h;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (imgAspect > targetAspect) {
    sWidth = imgH * targetAspect;
    sx = (imgW - sWidth) / 2;
  } else {
    sHeight = imgW / targetAspect;
    sy = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

/**
 * Genera un collage de alta resolución (1080x1080) optimizado para WhatsApp / Redes Sociales
 */
export async function generatePropertyCollage(
  property: Inmueble,
  maxPhotos = 5
): Promise<{ blob: Blob; dataUrl: string; file: File }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context no disponible');
  }

  // 1. Fondo elegante Azul Marino Ejecutivo
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(0, 0, 1080, 1080);

  // 2. Cabecera editorial con marca de Sandra Niño
  ctx.fillStyle = '#162b46';
  ctx.fillRect(0, 0, 1080, 84);

  // Línea dorada / terracota divisoria
  ctx.fillStyle = '#C97B5A';
  ctx.fillRect(0, 82, 1080, 2);

  // Texto marca izquierda
  ctx.fillStyle = '#FAF9F6';
  ctx.font = 'bold 22px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('SANDRA NIÑO', 32, 44);

  ctx.fillStyle = '#C97B5A';
  ctx.font = '600 13px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CENTURY 21 A1  •  ASESORÍA INMOBILIARIA', 32, 66);

  // Badge tipo / operación derecha
  const operationText = property.operation ? property.operation.toUpperCase() : 'INMUEBLE';
  const typeText = property.type ? property.type.toUpperCase() : '';
  const badgeLabel = `${typeText} EN ${operationText}`;

  ctx.font = 'bold 14px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const badgeWidth = ctx.measureText(badgeLabel).width + 32;
  const badgeX = 1080 - 32 - badgeWidth;

  ctx.fillStyle = '#C97B5A';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(badgeX, 24, badgeWidth, 36, 18);
    ctx.fill();
  } else {
    ctx.fillRect(badgeX, 24, badgeWidth, 36);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(badgeLabel, badgeX + 16, 47);

  // 3. Cargar hasta maxPhotos imágenes
  const rawImages = (property.images || []).filter(
    (img) => typeof img === 'string' && img.length > 0
  ).slice(0, maxPhotos);

  const loadedImages: HTMLImageElement[] = [];
  for (const src of rawImages) {
    try {
      const img = await loadImage(src);
      loadedImages.push(img);
    } catch {
      // Ignorar imagen fallida
    }
  }

  const padding = 24;
  const gridY = 104;
  const availableW = 1080 - padding * 2; // 1032
  const gridH = 680; // altura reservada para fotos

  // 4. Dibujar layout de fotos adaptativo
  if (loadedImages.length >= 5) {
    // 1 Hero arriba (altura 440) + 4 abajo (altura 220)
    const heroH = 444;
    drawImageCover(ctx, loadedImages[0], padding, gridY, availableW, heroH, 16);

    const subY = gridY + heroH + 12;
    const subH = 224;
    const gap = 10;
    const subW = (availableW - gap * 3) / 4; // ~250.5 px cada una

    for (let i = 0; i < 4; i++) {
      const x = padding + i * (subW + gap);
      drawImageCover(ctx, loadedImages[i + 1], x, subY, subW, subH, 12);
    }
  } else if (loadedImages.length === 4) {
    const heroH = 444;
    drawImageCover(ctx, loadedImages[0], padding, gridY, availableW, heroH, 16);

    const subY = gridY + heroH + 12;
    const subH = 224;
    const gap = 12;
    const subW = (availableW - gap * 2) / 3;

    for (let i = 0; i < 3; i++) {
      const x = padding + i * (subW + gap);
      drawImageCover(ctx, loadedImages[i + 1], x, subY, subW, subH, 12);
    }
  } else if (loadedImages.length === 3) {
    // 1 grande izquierda + 2 apiladas derecha
    const gap = 12;
    const leftW = Math.round(availableW * 0.62);
    const rightW = availableW - leftW - gap;
    const rightH = (gridH - gap) / 2;

    drawImageCover(ctx, loadedImages[0], padding, gridY, leftW, gridH, 16);
    drawImageCover(ctx, loadedImages[1], padding + leftW + gap, gridY, rightW, rightH, 14);
    drawImageCover(ctx, loadedImages[2], padding + leftW + gap, gridY + rightH + gap, rightW, rightH, 14);
  } else if (loadedImages.length === 2) {
    const gap = 12;
    const halfW = (availableW - gap) / 2;
    drawImageCover(ctx, loadedImages[0], padding, gridY, halfW, gridH, 16);
    drawImageCover(ctx, loadedImages[1], padding + halfW + gap, gridY, halfW, gridH, 16);
  } else if (loadedImages.length === 1) {
    drawImageCover(ctx, loadedImages[0], padding, gridY, availableW, gridH, 16);
  } else {
    // Sin fotos: placeholder elegante
    ctx.fillStyle = '#162b46';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(padding, gridY, availableW, gridH, 16);
      ctx.fill();
    } else {
      ctx.fillRect(padding, gridY, availableW, gridH);
    }
    ctx.fillStyle = '#faf9f6';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sandra Niño • Inventario Exclusivo', 540, gridY + 340);
    ctx.textAlign = 'left';
  }

  // 5. Franja Inferior Informativa Estilo Tarjeta Ficha
  const footerY = 808;
  const footerH = 248;
  const footerW = availableW;

  // Fondo de la tarjeta informativa (Crema cálido)
  ctx.fillStyle = '#FAF9F6';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(padding, footerY, footerW, footerH, 18);
    ctx.fill();
  } else {
    ctx.fillRect(padding, footerY, footerW, footerH);
  }

  // Borde sutil
  ctx.strokeStyle = '#E7E2DA';
  ctx.lineWidth = 1.5;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(padding, footerY, footerW, footerH, 18);
    ctx.stroke();
  }

  // Datos izquierda: Título y Ubicación
  const textX = padding + 28;
  let currentY = footerY + 46;

  // Título del inmueble
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 26px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const cleanTitle = property.title.length > 46 ? `${property.title.slice(0, 46)}...` : property.title;
  ctx.fillText(cleanTitle, textX, currentY);

  // Ubicación
  currentY += 34;
  const locationParts = [property.sector, property.city, property.state].filter(Boolean);
  const locationText = `📍 ${locationParts.join(', ')}`;
  ctx.fillStyle = '#57534E';
  ctx.font = '500 18px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(locationText.length > 50 ? `${locationText.slice(0, 50)}...` : locationText, textX, currentY);

  // Especificaciones técnicas (Metraje, oficinas/hab, baños)
  currentY += 34;
  const mainArea = getPropertyMainArea(property);
  const specs: string[] = [];
  if (mainArea) specs.push(`📐 ${formatArea(mainArea)}`);
  if (property.offices) specs.push(`🏢 ${property.offices} oficinas`);
  if (property.bedrooms) specs.push(`🛏️ ${property.bedrooms} hab.`);
  if (property.bathrooms) specs.push(`🚿 ${property.bathrooms} baños`);
  if (property.parking) specs.push(`🚗 ${property.parking} est.`);

  ctx.fillStyle = '#78716C';
  ctx.font = '600 16px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(specs.join('   •   '), textX, currentY);

  // Caja de Precio Derecha
  const priceBoxW = 320;
  const priceBoxH = 100;
  const priceBoxX = 1080 - padding - 28 - priceBoxW;
  const priceBoxY = footerY + 28;

  ctx.fillStyle = '#F5F1EA';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH, 14);
    ctx.fill();
  } else {
    ctx.fillRect(priceBoxX, priceBoxY, priceBoxW, priceBoxH);
  }
  ctx.strokeStyle = '#DCD5C9';
  ctx.stroke();

  // Etiqueta de precio
  ctx.fillStyle = '#78716C';
  ctx.font = '700 12px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    property.operation?.toLowerCase() === 'alquiler' ? 'CANON MENSUAL' : 'PRECIO DE VENTA',
    priceBoxX + 20,
    priceBoxY + 30
  );

  // Valor del precio
  const priceText = formatPrice(property.price, property.operation);
  ctx.fillStyle = '#1E3A5F';
  ctx.font = 'bold 36px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(priceText, priceBoxX + 20, priceBoxY + 74);

  // Botón de Contacto Sandra Niño en la parte inferior derecha
  const contactY = footerY + 152;
  const contactBoxW = 440;
  const contactBoxH = 56;
  const contactBoxX = 1080 - padding - 28 - contactBoxW;

  ctx.fillStyle = '#1D6447'; // Verde WhatsApp profesional
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(contactBoxX, contactY, contactBoxW, contactBoxH, 28);
    ctx.fill();
  } else {
    ctx.fillRect(contactBoxX, contactY, contactBoxW, contactBoxH);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 17px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('💬 Sandra Niño • 0424.496.01.02', contactBoxX + 38, contactY + 35);

  // Código / Ref inferior izquierda
  ctx.fillStyle = '#A8A29E';
  ctx.font = '500 14px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Ficha: sandranino-inmuebles.vercel.app  •  Century21 A1`, textX, footerY + 200);

  // 6. Convertir a Blob y File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar el blob del collage'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const slug = property.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .slice(0, 30);
        const file = new File([blob], `inmueble-${slug}-collage.jpg`, {
          type: 'image/jpeg',
        });
        resolve({ blob, dataUrl, file });
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Convierte una imagen (base64 o URL remota) en un File de JavaScript para Web Share API
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

/**
 * Descarga un archivo directamente al dispositivo del usuario
 */
export function downloadBlobOrFile(fileOrBlob: File | Blob, filename: string) {
  const url = URL.createObjectURL(fileOrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copia un Blob de imagen directamente al portapapeles (para pegar con Ctrl+V en WhatsApp Web)
 */
export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
      // Los navegadores requieren 'image/png' para el clipboard
      // Si el blob es image/jpeg, lo convertimos a PNG via un canvas o imagen temporal
      if (blob.type !== 'image/png') {
        const img = await loadImage(URL.createObjectURL(blob));
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngBlob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
          if (pngBlob) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
            return true;
          }
        }
      } else {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        return true;
      }
    }
  } catch (err) {
    console.warn('Clipboard write image falló:', err);
  }
  return false;
}
