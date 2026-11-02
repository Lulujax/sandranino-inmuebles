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
 * Determina si un precio coincide con una consulta escrita libremente en el buscador.
 * Acepta números con o sin separadores de miles: "120000", "120,000", "120.000".
 * Ejemplo: precio 120000 coincide con "120", "120,000" o "$120000".
 */
export function matchesPriceQuery(price: number, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  // Solo intenta coincidir por precio si la consulta es numérica
  if (!/^[\d.,\s$]+$/.test(q)) return false;

  const queryDigits = q.replace(/\D/g, '');
  if (!queryDigits) return false;

  const priceDigits = String(Math.round(price));
  return priceDigits.includes(queryDigits);
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

  const fullDesc =
    property.publication_description || buildPublicationDescription(property);

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

/**
 * Anexa o actualiza la referencia ('REF: [Nombre]') al final de la descripción
 * de un inmueble cuando el contacto es un colega asesor, usando únicamente su
 * nombre (sin agregar las palabras 'Colega' ni 'Propietario').
 * Si es propietario o no tiene contacto, la descripción queda sin REF.
 *
 * Evita duplicar líneas si el inmueble se guarda varias veces o si el usuario
 * ya escribió previamente dicha referencia.
 */
export function formatDescriptionWithContactRef(
  description?: string | null,
  ownerName?: string | null
): string {
  const rawDesc = (description || '').trim();
  const contact = parseContactInfo({ owner_name: ownerName });
  const cleanName = contact.name.trim();

  // Limpiar cualquier línea previa de referencia al final (ej: '\n\nREF: Marcos Rivas')
  const descWithoutTrailingRef = rawDesc
    .replace(/(?:\r?\n)+\s*REF(?:\s*:|\s+)[^\r\n]*$/i, '')
    .trim();

  if (!cleanName || contact.type !== 'Colega') {
    return descWithoutTrailingRef;
  }

  const refLine = `REF: ${cleanName}`;

  // Si la descripción limpia ya contiene esa referencia exacta en alguna otra parte, no duplicar
  if (descWithoutTrailingRef.toLowerCase().includes(refLine.toLowerCase())) {
    return descWithoutTrailingRef;
  }

  return descWithoutTrailingRef ? `${descWithoutTrailingRef}\n\n${refLine}` : refLine;
}

/**
 * Firma que SIEMPRE debe cerrar la descripción de una publicación.
 */
export const PUBLICATION_FOOTER = [
  'Sandra Niño',
  '0424.496.01.02',
  'Century21 A1',
  'Cc. Guaparo',
].join('\n');

/**
 * Quita de una descripción las líneas del formato de publicación que ya
 * estuvieran escritas (REPUBLICACION, REF, código SN-XX y la firma), estén
 * donde estén dentro del texto y aunque se hayan escrito a mano.
 * Así el formato se puede regenerar sin duplicar líneas.
 */
function stripPublicationFormat(description?: string | null): string {
  const normalized = (description || '').replace(/\r\n?/g, '\n');
  const footerSet = new Set(PUBLICATION_FOOTER.split('\n').map((l) => l.toLowerCase()));

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return true;
      const lower = line.toLowerCase();

      // Firma (Sandra Niño / teléfono / agencia / oficina)
      if (footerSet.has(lower)) return false;

      // REPUBLICACION / REPUBLICACIÓN, con o sin dos puntos o texto extra
      if (/^republicaci[oó]n\b/i.test(line)) return false;

      // REF: Nombre / REF Nombre / REF:Nombre SN-03
      if (/^ref\b/i.test(line)) return false;

      return true;
    });

  // Código del portal (SN-XX) al inicio o al final del texto
  while (lines.length > 0 && !lines[0]) lines.shift();
  if (lines.length > 0 && /^sn-?\d+$/i.test(lines[0])) lines.shift();

  while (lines.length > 0 && !lines[lines.length - 1]) lines.pop();
  if (lines.length > 0 && /^sn-?\d+$/i.test(lines[lines.length - 1])) lines.pop();

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Construye la descripción de una publicación con el formato establecido:
 *
 *   REPUBLICACION            (solo si el contacto es un colega asesor)
 *   SN-XX
 *   REF: <nombre del colega> (solo si es colega asesor)
 *
 *   <cuerpo de la descripción>
 *
 *   Sandra Niño            <- solo con { withSignature: true } (ZIP)
 *   0424.496.01.02
 *   Century21 A1
 *   Cc. Guaparo
 *
 * Se usa en la ficha pública (sin firma) y en el ZIP descargable desde
 * Herramientas (con la firma al final).
 */
export function buildPublicationDescription(
  property: Partial<Inmueble>,
  options: { withSignature?: boolean } = {}
): string {
  const contact = parseContactInfo(property);
  const isColleague = contact.type === 'Colega';
  const internalCode = (property.internal_code || '').trim();
  const body = stripPublicationFormat(property.description);

  const lines: string[] = [];

  if (isColleague) {
    lines.push('REPUBLICACION');
  }

  // Primero el código del portal (SN-XX); debajo la referencia, solo si es colega
  if (internalCode) {
    lines.push(internalCode);
  }
  if (isColleague && contact.name) {
    lines.push(`REF: ${contact.name}`);
  }

  if (body) {
    if (lines.length > 0) lines.push('');
    lines.push(body);
  }

  // La firma con los datos de contacto solo se agrega en la descarga del ZIP
  if (options.withSignature) {
    lines.push('', PUBLICATION_FOOTER);
  }

  return lines.join('\n');
}


