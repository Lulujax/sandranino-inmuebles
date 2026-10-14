import { ImageResponse } from 'next/og';
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

  // Si la imagen está en formato base64 (como en Supabase):
  // Se entrega como binario nativo JPEG de ~78 KB (por debajo de los 300 KB de WhatsApp)
  if (firstImage && firstImage.startsWith('data:image/')) {
    const match = firstImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      return new Response(buffer, {
        headers: {
          'Content-Type': mime,
          'Content-Length': String(buffer.length),
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      });
    }
  }

  // Si la imagen es una URL remota
  if (firstImage && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
    try {
      const res = await fetch(firstImage);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const mime = res.headers.get('content-type') || 'image/jpeg';
        return new Response(Buffer.from(arrayBuffer), {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        });
      }
    } catch {}
  }

  // Fallback si no tiene fotos
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e3a5f',
          color: '#faf9f6',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: '0.25em', color: '#C97B5A', marginBottom: 16 }}>
          SANDRA NIÑO • INVENTARIO EXCLUSIVO
        </div>
        <div style={{ fontSize: 48, fontWeight: 700 }}>Inmueble Exclusivo</div>
      </div>
    ),
    { ...size }
  );
}
