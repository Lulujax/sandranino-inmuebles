import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  MapPin,
  Building,
  Key,
  Maximize2,
  Bed,
  Bath,
  Calendar,
  Compass,
  MessageCircle,
} from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_ASESOR } from '@/data/mock-properties';
import { formatPrice, formatArea, getPropertyMainArea, getWhatsAppInquiryLink } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { PropertyGallery } from '@/components/public/PropertyGallery';
import { ShareButtons } from '@/components/public/ShareButtons';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = MOCK_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    return {
      title: 'Inmueble no encontrado | Sandra Nino',
    };
  }

  const title = `${property.title} | Sandra Nino Inmuebles`;
  const description =
    property.description ||
    `${property.type} en ${property.operation} ubicado en ${property.city}, Carabobo. Precio: ${formatPrice(property.price)}.`;
  const image = property.images[0] || 'https://placehold.co/800x600/1e3a5f/ffffff?text=Sandra+Nino';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = MOCK_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    notFound();
  }

  const mainArea = getPropertyMainArea(property);
  const whatsappLink = getWhatsAppInquiryLink(
    MOCK_ASESOR.whatsapp,
    property.title,
    property.price
  );

  return (
    <div className="min-h-screen bg-cream text-text-body font-sans pb-28 selection:bg-terracotta/20 selection:text-text-heading">
      {/* Barra superior editorial */}
      <header className="bg-cream-50/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:text-brand-darker transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Volver al Catálogo</span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-terracotta hidden sm:inline font-sans">
            Sandra Nino • Catálogo Exclusivo
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-9 animate-fade-in-up">
        {/* Encabezado del Inmueble */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              size="md"
              className="tracking-widest uppercase text-[10px] bg-white text-brand-dark border-stone-200/80 shadow-xs"
              variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
            >
              {property.type} en {property.operation}
            </Badge>
            <span className="text-xs text-stone-500 flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-terracotta stroke-[2]" />
              {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text-heading tracking-tight leading-[1.15] max-w-2xl">
              {property.title}
            </h1>
            <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-brand whitespace-nowrap tracking-tight">
              {formatPrice(property.price, property.operation)}
            </div>
          </div>
        </div>

        {/* Galería de Fotos */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Grid de 4 tarjetas de detalles principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Building className="w-5 h-5 text-terracotta mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Tipo</span>
            <span className="text-base font-serif font-semibold text-text-heading mt-0.5">{property.type}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Key className="w-5 h-5 text-terracotta mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Operación</span>
            <span className="text-base font-serif font-semibold text-text-heading mt-0.5">{property.operation}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Maximize2 className="w-5 h-5 text-terracotta mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Superficie</span>
            <span className="text-base font-serif font-semibold text-text-heading mt-0.5">
              {mainArea ? formatArea(mainArea) : 'Consultar'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Bed className="w-5 h-5 text-terracotta mb-2 stroke-[1.5]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 font-sans">Habitaciones</span>
            <span className="text-base font-serif font-semibold text-text-heading mt-0.5">
              {property.bedrooms !== undefined && property.bedrooms > 0
                ? `${property.bedrooms}`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Botón WhatsApp de Acción Directa Principal (Verde refinado noble) */}
        <div className="bg-white p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta block mb-1 font-sans">
              Contacto Directo
            </span>
            <h3 className="font-serif text-2xl text-text-heading">
              ¿Deseas visitar este inmueble?
            </h3>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed font-sans">
              Escríbeme directamente por WhatsApp para coordinar una cita privada o resolver inquietudes legales y técnicas.
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-sans font-semibold text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 stroke-[2]" />
            <span>Contactar a Sandra por WhatsApp</span>
          </a>
        </div>

        {/* Sección: Descripción y Detalles Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Descripción */}
          <div className="lg:col-span-2 space-y-7">
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta block mb-1 font-sans">
                Detalles del Inmueble
              </span>
              <h2 className="font-serif text-2xl text-text-heading mb-4">
                Descripción
              </h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-sans font-normal max-w-prose">
                {property.description ||
                  'No se incluye descripción adicional para este inmueble. Comunícate con Sandra para más información.'}
              </div>
            </div>

            {/* Datos adicionales con iconografía de trazo fino */}
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-5">
              <h3 className="font-serif text-xl text-text-heading">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 text-sm font-sans">
                <div className="flex items-center gap-3 text-stone-700">
                  <MapPin className="w-4 h-4 text-terracotta stroke-[1.5]" />
                  <span>
                    <strong className="text-text-heading font-medium">Ubicación:</strong> {property.city}, {property.state}
                  </span>
                </div>
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Bath className="w-4 h-4 text-terracotta stroke-[1.5]" />
                    <span>
                      <strong className="text-text-heading font-medium">Baños:</strong> {property.bathrooms}
                    </span>
                  </div>
                )}
                {property.parking !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Compass className="w-4 h-4 text-terracotta stroke-[1.5]" />
                    <span>
                      <strong className="text-text-heading font-medium">Puestos de estacionamiento:</strong> {property.parking}
                    </span>
                  </div>
                )}
                {property.year !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Calendar className="w-4 h-4 text-terracotta stroke-[1.5]" />
                    <span>
                      <strong className="text-text-heading font-medium">Año de construcción:</strong> {property.year}
                    </span>
                  </div>
                )}
                {property.height !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Maximize2 className="w-4 h-4 text-terracotta stroke-[1.5]" />
                    <span>
                      <strong className="text-text-heading font-medium">Altura libre:</strong> {property.height} m
                    </span>
                  </div>
                )}
                {property.offices !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Building className="w-4 h-4 text-terracotta stroke-[1.5]" />
                    <span>
                      <strong className="text-text-heading font-medium">Oficinas administrativas:</strong> {property.offices}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Compartir */}
          <div className="space-y-6">
            <ShareButtons title={property.title} />
          </div>
        </div>
      </main>
    </div>
  );
}
