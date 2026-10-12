import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  MapPin,
  Home,
  Building2,
  Warehouse,
  Store,
  TreePine,
  Briefcase,
  Tag,
  KeyRound,
  Maximize2,
  Bed,
  Bath,
  Car,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_ASESOR } from '@/data/mock-properties';
import { PropertyType } from '@/lib/types';
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

function getPropertyTypeIcon(type: PropertyType) {
  switch (type) {
    case 'Casa':
      return Home;
    case 'Apartamento':
      return Building2;
    case 'Galpón':
      return Warehouse;
    case 'Local':
      return Store;
    case 'Terreno':
      return TreePine;
    case 'Oficina':
      return Briefcase;
    default:
      return Home;
  }
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

  const TypeIcon = getPropertyTypeIcon(property.type);
  const OperationIcon = property.operation === 'Venta' ? Tag : KeyRound;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] text-text-body font-body pb-28 selection:bg-terracotta/20 selection:text-text-heading">
      {/* Barra superior editorial */}
      <header className="bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 text-xs font-body font-medium uppercase tracking-[0.2em] text-brand hover:text-brand-darker transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            <span>Volver al Catálogo</span>
          </Link>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.25em] text-[#C97B5A] hidden sm:inline">
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
              variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
            >
              {property.type} en {property.operation}
            </Badge>
            <span className="text-xs text-stone-600 flex items-center gap-1.5 font-body">
              <MapPin size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
              {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading leading-[1.12] max-w-2xl">
              {property.title}
            </h1>
            <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-brand whitespace-nowrap">
              {formatPrice(property.price, property.operation)}
            </div>
          </div>
        </div>

        {/* Galería de Fotos */}
        <PropertyGallery images={property.images} title={property.title} />

        {/* Grid de 4 tarjetas de detalles principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <TypeIcon size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">Tipo</span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">{property.type}</span>
          </div>

          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <OperationIcon size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">Operación</span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">{property.operation}</span>
          </div>

          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Maximize2 size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">Superficie</span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">
              {mainArea ? formatArea(mainArea) : 'Consultar'}
            </span>
          </div>

          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Bed size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">Habitaciones</span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">
              {property.bedrooms !== undefined && property.bedrooms > 0
                ? `${property.bedrooms}`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Botón WhatsApp de Acción Directa Principal */}
        <div className="bg-[#faf9f6] p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-[#C97B5A] block mb-1">
              Contacto Directo
            </span>
            <h3 className="font-display text-2xl font-semibold text-text-heading">
              ¿Deseas visitar este inmueble?
            </h3>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed font-body">
              Escríbeme directamente por WhatsApp para coordinar una cita privada o resolver inquietudes legales y técnicas.
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-body font-medium text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer"
          >
            <MessageCircle size={20} strokeWidth={1.5} />
            <span>Contactar a Sandra por WhatsApp</span>
          </a>
        </div>

        {/* Sección: Descripción y Detalles Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-7">
            <div className="bg-[#faf9f6] p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card">
              <span className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-[#C97B5A] block mb-1">
                Detalles del Inmueble
              </span>
              <h2 className="font-display text-2xl font-semibold text-text-heading mb-4">
                Descripción
              </h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-body font-normal max-w-prose">
                {property.description ||
                  'No se incluye descripción adicional para este inmueble. Comunícate con Sandra para más información.'}
              </div>
            </div>

            {/* Especificaciones técnicas */}
            <div className="bg-[#faf9f6] p-7 sm:p-8 rounded-2xl border border-stone-200/80 shadow-card space-y-5">
              <h3 className="font-display text-xl font-semibold text-text-heading">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 text-sm font-body">
                <div className="flex items-center gap-3 text-stone-700">
                  <MapPin size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                  <span>
                    <strong className="text-text-heading font-medium">Ubicación:</strong> {property.city}, {property.state}
                  </span>
                </div>
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Bath size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Baños:</strong> {property.bathrooms}
                    </span>
                  </div>
                )}
                {property.parking !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Car size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Estacionamientos:</strong> {property.parking}
                    </span>
                  </div>
                )}
                {property.year !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Calendar size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Año:</strong> {property.year}
                    </span>
                  </div>
                )}
                {property.height !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Maximize2 size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Altura libre:</strong> {property.height} m
                    </span>
                  </div>
                )}
                {property.offices !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Briefcase size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Oficinas:</strong> {property.offices}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ShareButtons title={property.title} />
          </div>
        </div>
      </main>
    </div>
  );
}
