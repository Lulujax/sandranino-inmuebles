import { Inmueble, OperationType, ContactType } from './types';

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
 * Normaliza un número venezolano al formato internacional requerido por wa.me
 * Acepta tanto formato local (04244960102) como internacional (584244960102)
 */
export function normalizeWhatsAppPhone(phone: string): string {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = `58${clean.replace(/^0+/, '')}`;
  }
  return clean;
}

/**
 * Genera el siguiente correlativo público de inmueble (ej: SN-06) tomando como
 * base el número más alto encontrado en los códigos existentes.
 */
export function generateNextPropertyCode(
  existingCodes: (string | null | undefined)[]
): string {
  let max = 0;
  for (const code of existingCodes) {
    if (!code) continue;
    const matches = code.match(/\d+/g);
    if (!matches) continue;
    for (const group of matches) {
      const n = parseInt(group, 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return `SN-${String(max + 1).padStart(2, '0')}`;
}

/**
 * Genera el enlace de WhatsApp oficial de Sandra con mensaje predeterminado
 */
export function getWhatsAppInquiryLink(
  phone: string,
  propertyTitle: string,
  price: number,
  code?: string
): string {
  const cleanPhone = normalizeWhatsAppPhone(phone);
  const refText = code ? ` (Ref: ${code})` : '';
  const message = `Hola Sandra, estoy interesado en el inmueble "${propertyTitle}"${refText} (${formatPrice(price)}) que vi en tu página. ¿Sigue disponible?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Convierte lo que se tenga guardado en el perfil (enlace completo o usuario)
 * en la URL oficial y funcional de cada red social.
 */
export function getSocialProfileUrl(
  platform: 'instagram' | 'facebook' | 'tiktok',
  value?: string | null
): string | null {
  const raw = (value || '').trim();
  if (!raw) return null;

  const domains: Record<typeof platform, string> = {
    instagram: 'instagram\\.com',
    facebook: 'facebook\\.com',
    tiktok: 'tiktok\\.com',
  };

  const handle = raw
    .replace(/^https?:\/\//i, '')
    .replace(new RegExp(`^(www\\.|m\\.|web\\.)?${domains[platform]}\\/`, 'i'), '')
    .split(/[?#]/)[0]
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .trim();

  if (!handle || /\s/.test(handle)) return null;

  if (platform === 'instagram') return `https://www.instagram.com/${handle}`;
  if (platform === 'facebook') return `https://www.facebook.com/${handle}`;
  return `https://www.tiktok.com/@${handle}`;
}

/**
 * Genera texto y enlaces estilo Wasi.co para compartir un inmueble en redes sociales
 */
export function getShareUrls(
  property: Partial<Inmueble> & { title: string },
  url: string
) {
  const area = getPropertyMainArea(property);
  const priceText =
    property.price !== undefined
      ? formatPrice(property.price, property.operation)
      : '';
  const locationParts = [property.sector, property.city, property.state].filter(Boolean);
  const locationText = locationParts.join(', ');

  const fullDesc = property.description ? property.description.trim() : '';

  const baseUrl = url.split('?')[0];
  // Parámetro dinámico para que WhatsApp ignore cachés viejas fallidas y descargue la imagen de inmediato
  const shareableUrl = `${baseUrl}?v=${Date.now().toString().slice(-4)}`;

  const lines = [
    shareableUrl,
    '',
    `🏡 *${property.title.toUpperCase()}*`,
    property.internal_code ? `🏷️ Ref: *${property.internal_code}*` : '',
    locationText ? `📍 Ubicación: ${locationText}` : '',
    priceText
      ? `💼 ${property.operation || 'Precio'}: *${priceText}*`
      : '',
    area ? `📐 Superficie: ${formatArea(area)}` : '',
    fullDesc ? `\n📝 ${fullDesc}` : '',
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

export interface ParsedContact {
  type: ContactType;
  name: string;
  phone?: string;
  label: string; // 'Propietario Directo' | 'Colega Asesor'
}

/**
 * Analiza la información de contacto interno para saber si es Propietario Directo
 * o Colega Asesor (punta compartida / alianza), manteniendo compatibilidad total.
 */
export function parseContactInfo(prop?: {
  owner_name?: string | null;
  owner_phone?: string | null;
  contact_type?: ContactType | string | null;
}): ParsedContact {
  const rawName = (prop?.owner_name || '').trim();
  const phone = prop?.owner_phone?.trim() || undefined;

  let type: ContactType = 'Propietario';
  let cleanName = rawName;

  if (prop?.contact_type === 'Colega' || prop?.contact_type === 'Colega Asesor') {
    type = 'Colega';
    cleanName = rawName.replace(/^\[(Colega|Propietario)\]\s*/i, '').trim();
  } else if (/^\[Colega\]/i.test(rawName)) {
    type = 'Colega';
    cleanName = rawName.replace(/^\[Colega\]\s*/i, '').trim();
  } else if (/^\[Propietario\]/i.test(rawName)) {
    type = 'Propietario';
    cleanName = rawName.replace(/^\[Propietario\]\s*/i, '').trim();
  }

  return {
    type,
    name: cleanName,
    phone,
    label: type === 'Colega' ? 'Colega Asesor' : 'Propietario Directo',
  };
}

/**
 * Formatea el nombre para guardarlo retrocompatiblemente en Supabase
 * prefijando [Colega] si es un colega asesor y no propietario.
 */
export function formatContactNameForSave(name: string, type: ContactType): string {
  const clean = name.replace(/^\[(Colega|Propietario)\]\s*/i, '').trim();
  if (!clean) return '';
  return type === 'Colega' ? `[Colega] ${clean}` : clean;
}

/**
 * Formatea el texto de la columna 'Asesor o Referencia' para reportes (PDF / Excel).
 * Muestra el Propietario o el Colega asesor según corresponda, y opcionalmente
 * anexa el código de referencia interno si está habilitado.
 */
export function formatPropertyAdvisorOrReference(
  property: Partial<Inmueble>,
  includeInternalCode = false
): string {
  const contact = parseContactInfo(property);
  const isColleague = contact.type === 'Colega';
  const rolePrefix = isColleague ? 'Colega' : 'Propietario';

  let contactText = '';
  if (contact.name) {
    contactText = `${rolePrefix}: ${contact.name}`;
  } else if (contact.phone) {
    contactText = `${rolePrefix}: ${contact.phone}`;
  } else {
    contactText = isColleague ? 'Colega Asesor' : 'Propietario Directo';
  }

  if (includeInternalCode && property.internal_code?.trim()) {
    return `${contactText} (${property.internal_code.trim()})`;
  }

  return contactText;
}

