import { Inmueble, OperationType } from './types';

/**
 * Formatea un precio numérico a dólares (USD)
 * Ejemplo: 120000 -> "$120,000", para alquiler opcionalmente "$350/mes"
 */
export function formatPrice(price: number, operation?: OperationType): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);

  if (operation === 'Alquiler') {
    return `${formatted}/mes`;
  }
  return formatted;
}

/**
 * Formatea valores de área en metros cuadrados
 */
export function formatArea(area?: number): string {
  if (!area || area <= 0) return '';
  return `${new Intl.NumberFormat('es-VE').format(area)} m²`;
}

/**
 * Formatea una fecha ISO a formato local legible
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Genera el enlace de WhatsApp oficial de Sandra con mensaje predeterminado
 */
export function getWhatsAppInquiryLink(
  phone: string,
  propertyTitle: string,
  price: number
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `Hola Sandra, estoy interesado en el inmueble "${propertyTitle}" (${formatPrice(price)}) que vi en tu página. ¿Sigue disponible?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera texto y enlaces estilo Wasi.co para compartir un inmueble en redes sociales
 */
export function getShareUrls(
  property: Partial<Inmueble> & { title: string },
  url: string,
  mode: 'cliente' | 'colega' = 'cliente'
) {
  const area = getPropertyMainArea(property);
  const priceText =
    property.price !== undefined
      ? formatPrice(property.price, property.operation)
      : '';
  const locationParts = [property.sector, property.city, property.state].filter(Boolean);
  const locationText = locationParts.join(', ');

  let fullDesc = property.description ? property.description.trim() : '';

  if (mode === 'colega') {
    // En modo colega (ficha blanca / sin datos personales), removemos teléfonos y firmas personales
    fullDesc = fullDesc
      .replace(/Sandra\s+Niño/gi, '')
      .replace(/Century\s*21.*$/gim, '')
      .replace(/04\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g, '')
      .replace(/\+?58[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/g, '')
      .replace(/Cc\.\s*Guaparo/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  const lines = [
    `🏡 *${property.title.toUpperCase()}*`,
    locationText ? `📍 Ubicación: ${locationText}` : '',
    priceText
      ? `💼 ${property.operation || 'Precio'}: *${priceText}*`
      : '',
    area ? `📐 Superficie: ${formatArea(area)}` : '',
    fullDesc ? `\n📝 ${fullDesc}` : '',
    `\n👉 Ver fotos y ficha completa aquí:\n${url}`,
  ].filter(Boolean);

  const fullMessage = lines.join('\n');
  const telegramText = lines.slice(0, -1).join('\n');

  return {
    message: fullMessage,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      telegramText
    )}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(
      fullMessage
    )}`,
  };
}

/**
 * Obtiene el metraje representativo según el tipo de inmueble
 */
export function getPropertyMainArea(inmueble: Partial<Inmueble>): number | undefined {
  return (
    inmueble.built_area ||
    inmueble.total_area ||
    inmueble.land_area
  );
}

/**
 * Combina clases CSS condicionales
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

