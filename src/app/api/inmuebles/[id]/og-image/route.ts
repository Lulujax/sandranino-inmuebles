import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse('ID requerido', { status: 400 });
    }

    const supabase = await createClient();
    const { data: property } = await supabase
      .from('inmuebles_publicos')
      .select('id, title, images')
      .eq('id', id)
      .maybeSingle();

    if (!property || !property.images || property.images.length === 0) {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }

    const firstImage = property.images[0];

    // Si la imagen está en formato base64 data URI
    if (typeof firstImage === 'string' && firstImage.startsWith('data:image/')) {
      const match = firstImage.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': mime,
            'Content-Length': String(buffer.length),
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        });
      }
    }

    // Si la imagen es una URL remota
    if (
      typeof firstImage === 'string' &&
      (firstImage.startsWith('http://') || firstImage.startsWith('https://'))
    ) {
      const res = await fetch(firstImage);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const mime = res.headers.get('content-type') || 'image/jpeg';
        return new NextResponse(Buffer.from(arrayBuffer), {
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        });
      }
    }

    return new NextResponse('Formato de imagen no soportado', { status: 415 });
  } catch (error) {
    console.error('[og-image] Error sirviendo imagen:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

