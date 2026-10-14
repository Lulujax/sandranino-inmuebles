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
import { MOCK_ASESOR } from '@/data/mock-properties';
import { Inmueble, PerfilAsesor, PropertyType } from '@/lib/types';
import { propertiesStore, toPublicProperty } from '@/lib/properties';
import { createClient } from '@/lib/supabase/client';
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
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      const supabase = createClient();

      // Respaldo local instantáneo mientras responde la red
      const savedProfile = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
      if (savedProfile) {
        setAsesor(savedProfile);
      }

      try {
        // Ejecución en paralelo de perfil, sesión y propiedad para eliminar el cuello de botella
        const [profileRes, authRes, propertyRes] = await Promise.all([
          supabase.from('perfil_asesor').select('*').limit(1).maybeSingle(),
          supabase.auth.getUser(),
          propertiesStore.getById(id),
        ]);

        if (profileRes.data) {
          setAsesor(profileRes.data as PerfilAsesor);
        }

        const hasAdminSession = Boolean(authRes.data.user);
        setIsAdminPreview(hasAdminSession);

        const fromStore = propertyRes;
        if (fromStore) {
          if (fromStore.status !== 'Publicado' && !hasAdminSession) {
            setProperty(null);
            setLoaded(true);
            return;
          }

          // Incrementar visitas en segundo plano sin retrasar el renderizado
          if (!hasAdminSession && fromStore.status === 'Publicado') {
            propertiesStore.incrementVisits(id).catch(() => {});
          }

          setProperty(toPublicProperty(fromStore));
          setLoaded(true);
          return;
        }
      } catch {
        // En caso de error de red, intentar consulta pública directa como respaldo
        try {
          const publicProp = await propertiesStore.getPublicById(id);
          if (publicProp && publicProp.status === 'Publicado') {
            setProperty(toPublicProperty(publicProp));
            setLoaded(true);
            return;
          }
        } catch {}
      }

      setProperty(null);
      setLoaded(true);
    };

    loadDetail();
  }, [id]);

  if (!loaded) {
    return null;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] flex flex-col items-center justify-center p-6 text-center font-body">
        <div className="bg-[#faf9f6] p-10 rounded-2xl border border-stone-200/80 shadow-card max-w-md space-y-4">
          <h1 className="font-display text-2xl font-semibold text-text-heading">
            Inmueble no disponible
          </h1>
          <p className="text-sm text-stone-600">
            El inmueble solicitado no se encuentra disponible públicamente o ha sido retirado del inventario.
          </p>
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-medium uppercase tracking-wider"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            <span>Volver al Inventario</span>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] text-text-body font-body selection:bg-terracotta/20 selection:text-text-heading">
      {/* Barra superior editorial */}
      <header className="bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 text-xs font-body font-medium uppercase tracking-[0.2em] text-brand hover:text-brand-darker transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            <span>Volver al Inventario</span>
          </Link>
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.25em] text-[#C97B5A] hidden sm:inline">
            Sandra Niño • Inventario Exclusivo
          </span>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-20 space-y-8 animate-fade-in-up">
        {isAdminPreview && property.status !== 'Publicado' && (
          <div className="px-4 py-3 rounded-xl bg-[#fef7eb] border border-amber-300/80 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3">
            <span>
              <strong>Modo Vista Previa (Admin):</strong> Este inmueble está en estado{' '}
              <strong>{property.status}</strong> y permanece oculto para el público general.
            </span>
            <Link
              href="/admin/inmuebles"
              className="text-xs font-semibold uppercase tracking-wider text-[#1e3a5f] hover:underline shrink-0"
            >
              Ir al Panel
            </Link>
          </div>
        )}

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

        {/* Grid de tarjetas de detalles principales (Tipo / Operación / Superficie) */}
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
                {property.bedrooms != null && property.bedrooms > 0
                  ? `${property.bedrooms}`
                  : 'N/A'}
              </span>
            </div>
          )}
        </div>

        {/* Fila 2: Izquierda (Descripción con cuadro más estrecho) y Derecha (Rectángulo Visitar + Compartir) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna izquierda: Cuadro blanco reducido en ancho (~6 pts más compacto) */}
          <div className="lg:col-span-6">
            <div className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card lg:max-w-[440px]">
              <span className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-[#C97B5A] block mb-1">
                Detalles del Inmueble
              </span>
              <h2 className="font-display text-2xl font-semibold text-text-heading mb-3.5">
                Descripción
              </h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-[15px] whitespace-pre-line font-body font-normal">
                {property.description ||
                  'No se incluye descripción adicional para este inmueble. Comunícate con Sandra para más información.'}
              </div>
            </div>
          </div>

          {/* Columna derecha: Rectángulo "¿Deseas visitar este inmueble?" arriba de "Compartir este inmueble" */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#faf9f6] p-6 rounded-2xl border border-stone-200/80 shadow-card flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-[#C97B5A] block mb-1">
                  Contacto Directo
                </span>
                <h3 className="font-display text-xl font-semibold text-text-heading">
                  ¿Deseas visitar este inmueble?
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed font-body">
                  Escríbeme directamente por WhatsApp para coordinar una cita privada o resolver inquietudes legales y técnicas.
                </p>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-body font-semibold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <FaWhatsapp size={20} className="shrink-0" />
                <span>Contactar a Sandra por WhatsApp</span>
              </a>
            </div>

            <ShareButtons property={property} />
          </div>
        </div>

        {/* Fila 3: Especificaciones Técnicas en banda horizontal completa para equilibrar el cierre de la ficha */}
        <div className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
          <div>
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-[#C97B5A] block mb-0.5">
              Ficha Resumen
            </span>
            <h3 className="font-display text-xl font-semibold text-text-heading">
              Especificaciones Técnicas
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-body pt-1">
            <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
              <MapPin size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
              <span>
                <strong className="text-text-heading font-medium">Ubicación:</strong>{' '}
                {property.sector ? `${property.sector}, ` : ''}
                {property.city}, {property.state}
              </span>
            </div>
            {property.show_exact_location && property.address && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <MapPin size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Dirección:</strong>{' '}
                  {property.address}
                </span>
              </div>
            )}
            {property.built_area != null && property.built_area > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Maximize2 size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Área construida:</strong>{' '}
                  {formatArea(property.built_area)}
                </span>
              </div>
            )}
            {property.land_area != null && property.land_area > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Maximize2 size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Área de terreno:</strong>{' '}
                  {formatArea(property.land_area)}
                </span>
              </div>
            )}
            {property.total_area != null && property.total_area > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Maximize2 size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Área total:</strong>{' '}
                  {formatArea(property.total_area)}
                </span>
              </div>
            )}
            {property.bedrooms != null && property.bedrooms > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Bed size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Habitaciones:</strong>{' '}
                  {property.bedrooms}
                </span>
              </div>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Bath size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Baños:</strong>{' '}
                  {property.bathrooms}
                </span>
              </div>
            )}
            {property.parking != null && property.parking > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Car size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Estacionamientos:</strong>{' '}
                  {property.parking}
                </span>
              </div>
            )}
            {property.year != null && property.year > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Calendar size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Año:</strong>{' '}
                  {property.year}
                </span>
              </div>
            )}
            {property.offices != null && property.offices > 0 && (
              <div className="flex items-center gap-3 text-stone-700 bg-white/70 p-3.5 rounded-xl border border-stone-200/60">
                <Briefcase size={18} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                <span>
                  <strong className="text-text-heading font-medium">Oficinas:</strong>{' '}
                  {property.offices}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-brand-darker text-stone-300 py-10 border-t border-brand/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-body">
          <div className="text-center sm:text-left">
            <p className="font-display text-white text-sm font-semibold">{asesor.full_name}</p>
            <p className="text-stone-300 text-[11px] mt-0.5">Asesora Inmobiliaria • Carabobo, Venezuela</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-stone-300 text-[11px]">© {new Date().getFullYear()} Todos los derechos reservados.</p>
            <Link
              href="/login"
              className="text-[#f0a888] hover:text-white transition-colors text-xs font-medium tracking-wide underline-offset-4 hover:underline"
            >
              Acceso Asesores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
