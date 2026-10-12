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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inventario</span>
          </Link>
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">
            Sandra Nino Inmuebles
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Encabezado del Inmueble */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              size="md"
              variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
            >
              {property.type} en {property.operation}
            </Badge>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {property.title}
            </h1>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand whitespace-nowrap">
              {formatPrice(property.price, property.operation)}
            </div>
          </div>
        </div>

        {/* Galería de Fotos */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Grid de 4 tarjetas de detalles principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
            <Building className="w-5 h-5 text-brand mb-2" />
            <span className="text-xs text-gray-500 font-medium">Tipo</span>
            <span className="text-base font-bold text-gray-900">{property.type}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
            <Key className="w-5 h-5 text-brand mb-2" />
            <span className="text-xs text-gray-500 font-medium">Operación</span>
            <span className="text-base font-bold text-gray-900">{property.operation}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
            <Maximize2 className="w-5 h-5 text-brand mb-2" />
            <span className="text-xs text-gray-500 font-medium">Área</span>
            <span className="text-base font-bold text-gray-900">
              {mainArea ? formatArea(mainArea) : 'Consultar'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center sm:items-start text-center sm:text-left">
            <Bed className="w-5 h-5 text-brand mb-2" />
            <span className="text-xs text-gray-500 font-medium">Habitaciones</span>
            <span className="text-base font-bold text-gray-900">
              {property.bedrooms !== undefined && property.bedrooms > 0
                ? `${property.bedrooms}`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Botón WhatsApp de Acción Directa Principal */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">¿Deseas visitar este inmueble?</h3>
            <p className="text-sm text-gray-600">
              Contáctame directamente por WhatsApp para coordinar una cita o enviarte más detalles.
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md transition-all whitespace-nowrap"
          >
            <MessageCircle className="w-5 h-5" />
            <span>💬 Contactar a Sandra por WhatsApp</span>
          </a>
        </div>

        {/* Sección: Descripción y Detalles Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Descripción */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {property.description ||
                  'No se incluye descripción adicional para este inmueble. Comunícate con Sandra para más información.'}
              </div>
            </div>

            {/* Datos adicionales */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Datos Adicionales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <MapPin className="w-4 h-4 text-brand" />
                  <span>
                    <strong>Ubicación:</strong> {property.city}, {property.state}
                  </span>
                </div>
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Bath className="w-4 h-4 text-brand" />
                    <span>
                      <strong>Baños:</strong> {property.bathrooms}
                    </span>
                  </div>
                )}
                {property.parking !== undefined && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Compass className="w-4 h-4 text-brand" />
                    <span>
                      <strong>Estacionamientos:</strong> {property.parking}
                    </span>
                  </div>
                )}
                {property.year !== undefined && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Calendar className="w-4 h-4 text-brand" />
                    <span>
                      <strong>Año:</strong> {property.year}
                    </span>
                  </div>
                )}
                {property.height !== undefined && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Maximize2 className="w-4 h-4 text-brand" />
                    <span>
                      <strong>Altura:</strong> {property.height} m
                    </span>
                  </div>
                )}
                {property.offices !== undefined && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Building className="w-4 h-4 text-brand" />
                    <span>
                      <strong>Oficinas:</strong> {property.offices}
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

