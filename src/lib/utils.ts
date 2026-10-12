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
 * Genera enlaces para compartir en redes sociales
 */
export function getShareUrls(title: string, url: string) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
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

