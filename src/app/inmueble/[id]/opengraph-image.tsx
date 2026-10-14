import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { Inmueble } from '@/lib/types';

export const alt = 'Fotografía principal del inmueble — Sandra Niño';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/jpeg';

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: Inmueble | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    property = data as Inmueble | null;
  } catch {}

  const validImages = (property?.images || []).filter(
    (img) =>
      typeof img === 'string' &&
      (img.startsWith('http://') ||
        img.startsWith('https://') ||
        img.startsWith('data:image/jpeg') ||
        img.startsWith('data:image/png') ||
        img.startsWith('data:image/webp'))
  );

  const firstImage = validImages[0];

  if (firstImage) {
    try {
      let rawBuffer: Buffer | null = null;

      if (firstImage.startsWith('data:image/')) {
        const match = firstImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          rawBuffer = Buffer.from(match[2], 'base64');
        }
      } else if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        const res = await fetch(firstImage);
        if (res.ok) {
          rawBuffer = Buffer.from(await res.arrayBuffer());
        }
      }

      if (rawBuffer) {
        // Redimensiona y ajusta la foto exactamente al formato 1200x630 (ratio 1.91:1)
        // Esto obliga a WhatsApp, Facebook y Telegram a mostrar SIEMPRE la tarjeta EN GRANDE
        // manteniendo el peso en ~100 KB (muy por debajo de los 300 KB permitidos)
        const landscapeBuffer = await sharp(rawBuffer)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();

        return new Response(landscapeBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': String(landscapeBuffer.length),
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        });
      }
    } catch (err) {
      console.error('[opengraph-image] Error procesando con sharp:', err);
    }
  }

  // Fallback elegante en caso de no tener imágenes
  const fallbackSvg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e3a5f" />
      <text x="600" y="270" font-family="sans-serif" font-size="28" font-weight="700" fill="#C97B5A" text-anchor="middle" letter-spacing="4">SANDRA NIÑO • INVENTARIO EXCLUSIVO</text>
      <text x="600" y="350" font-family="sans-serif" font-size="52" font-weight="700" fill="#FAF9F6" text-anchor="middle">Inmueble Exclusivo</text>
    </svg>
  `;
  const fallbackBuffer = await sharp(Buffer.from(fallbackSvg))
    .jpeg({ quality: 80 })
    .toBuffer();

  return new Response(fallbackBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(fallbackBuffer.length),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
