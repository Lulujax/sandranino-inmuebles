import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('inmuebles_publicos')
      .select('id, title, operation, type, sector, city, state, description, price, built_area, land_area, total_area, images')
      .eq('id', id)
      .maybeSingle();

    const property = data as Inmueble | null;
    if (!property) {
      return {
        title: 'Inmueble | Sandra Niño • Inventario Exclusivo',
      };
    }

    const priceLabel = formatPrice(property.price, property.operation);
    const locationLabel = `${property.sector ? `${property.sector}, ` : ''}${property.city}, ${property.state}`;
    const mainArea = getPropertyMainArea(property);
    const areaPart = mainArea ? ` • ${formatArea(mainArea)}` : '';
    const shortDesc = property.description
      ? property.description.replace(/\s+/g, ' ').trim().slice(0, 160)
      : `${property.type} en ${property.operation} ubicado en ${locationLabel}.`;

    const title = `${property.title} — ${priceLabel}`;
    const description = `📍 ${locationLabel}${areaPart} | ${shortDesc}`;
    const ogImageUrl = `/inmueble/${id}/opengraph-image`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/inmueble/${id}`,
        type: 'website',
        siteName: 'Sandra Niño • Inventario Exclusivo',
        images: [
          {
            url: ogImageUrl,
            width: 800,
            height: 418,
            alt: property.title,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: 'Inmueble | Sandra Niño • Inventario Exclusivo',
    };
  }
}

export default function InmuebleDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

