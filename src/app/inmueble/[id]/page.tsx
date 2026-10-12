'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { MOCK_PROPERTIES, MOCK_ASESOR } from '@/data/mock-properties';
import { Inmueble, PerfilAsesor, PropertyType } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import {
  formatPrice,
  formatArea,
  getPropertyMainArea,
  getWhatsAppInquiryLink,
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { PropertyGallery } from '@/components/public/PropertyGallery';
import { ShareButtons } from '@/components/public/ShareButtons';

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

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [property, setProperty] = useState<Inmueble | null>(null);
  const [asesor, setAsesor] = useState<PerfilAsesor>(MOCK_ASESOR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const savedProfile = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
    if (savedProfile) {
      setAsesor(savedProfile);
    }

    const fromStore = propertiesStore.getById(id);
    if (fromStore) {
      const updated = propertiesStore.update(id, {
        visits: (fromStore.visits || 0) + 1,
      });
      setProperty(updated || fromStore);
      setLoaded(true);
      return;
    }

    const fromMock = MOCK_PROPERTIES.find((p) => p.id === id) || null;
    setProperty(fromMock);
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return null;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] flex flex-col items-center justify-center p-6 text-center font-body">
        <div className="bg-[#faf9f6] p-10 rounded-2xl border border-stone-200/80 shadow-card max-w-md space-y-4">
          <h1 className="font-display text-2xl font-semibold text-text-heading">
            Inmueble no encontrado
          </h1>
          <p className="text-sm text-stone-600">
            No pudimos encontrar el inmueble solicitado. Es posible que haya sido eliminado.
          </p>
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-medium uppercase tracking-wider"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const mainArea = getPropertyMainArea(property);
  const whatsappLink = getWhatsAppInquiryLink(
    asesor.whatsapp,
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
            {property.status !== 'Publicado' && (
              <Badge status={property.status} size="md">
                {property.status}
              </Badge>
            )}
            <span className="text-xs text-stone-600 flex items-center gap-1.5 font-body">
              <MapPin size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
              {property.sector ? `${property.sector}, ` : ''}
              {property.city}, {property.state}
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

        {/* Grid de tarjetas de detalles principales */}
        <div
          className={`grid grid-cols-2 ${
            property.type === 'Casa' || property.type === 'Apartamento'
              ? 'sm:grid-cols-4'
              : 'sm:grid-cols-3'
          } gap-4`}
        >
          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <TypeIcon size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">
              Tipo
            </span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">
              {property.type}
            </span>
          </div>

          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <OperationIcon size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">
              Operación
            </span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">
              {property.operation}
            </span>
          </div>

          <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
            <Maximize2 size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">
              Superficie
            </span>
            <span className="text-base font-display font-semibold text-text-heading mt-0.5">
              {mainArea ? formatArea(mainArea) : 'Consultar'}
            </span>
          </div>

          {(property.type === 'Casa' || property.type === 'Apartamento') && (
            <div className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center sm:items-start text-center sm:text-left transition-all hover:shadow-luxury">
              <Bed size={20} strokeWidth={1.5} className="text-[#C97B5A] mb-2" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 font-body">
                Habitaciones
              </span>
              <span className="text-base font-display font-semibold text-text-heading mt-0.5">
                {property.bedrooms !== undefined && property.bedrooms > 0
                  ? `${property.bedrooms}`
                  : 'N/A'}
              </span>
            </div>
          )}
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
            <FaWhatsapp size={22} />
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
                    <strong className="text-text-heading font-medium">Ubicación:</strong>{' '}
                    {property.city}, {property.state}
                  </span>
                </div>
                {property.show_exact_location && property.address && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <MapPin size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Dirección:</strong>{' '}
                      {property.address}
                    </span>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Bath size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Baños:</strong>{' '}
                      {property.bathrooms}
                    </span>
                  </div>
                )}
                {property.parking !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Car size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Estacionamientos:</strong>{' '}
                      {property.parking}
                    </span>
                  </div>
                )}
                {property.year !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Calendar size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Año:</strong>{' '}
                      {property.year}
                    </span>
                  </div>
                )}
                {property.height !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Maximize2 size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Altura libre:</strong>{' '}
                      {property.height} m
                    </span>
                  </div>
                )}
                {property.offices !== undefined && (
                  <div className="flex items-center gap-3 text-stone-700">
                    <Briefcase size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
                    <span>
                      <strong className="text-text-heading font-medium">Oficinas:</strong>{' '}
                      {property.offices}
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
