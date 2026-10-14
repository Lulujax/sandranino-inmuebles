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
      .select('id, title, operation, type, sector, city, state, description, price, built_area, land_area, total_area')
      .eq('id', id)
      .maybeSingle();

    const property = data as Inmueble | null;
    if (!property) {
      return {
        title: 'Inmueble | Sandra Nino • Inventario Exclusivo',
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

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Sandra Nino • Inventario Exclusivo',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Inmueble | Sandra Nino • Inventario Exclusivo',
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

