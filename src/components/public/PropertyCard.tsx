'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2, Bed, Bath } from 'lucide-react';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { FadeInUp } from '@/components/ui/FadeInUp';

interface PropertyCardProps {
  property: Inmueble;
  index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const mainArea = getPropertyMainArea(property);
  const mainImage = property.images[0] || 'https://placehold.co/800x600/1e3a5f/ffffff?text=Sin+Imagen';

  return (
    <FadeInUp delay={(index % 6) * 0.08} duration={0.45} className="h-full">
      <Link
        href={`/inmueble/${property.id}`}
        className="group flex flex-col h-full bg-[#faf9f6] rounded-2xl overflow-hidden shadow-card hover:shadow-luxury-hover border border-stone-200/80 hover:border-[#C97B5A]/40 hover:scale-[1.02] transition-all duration-300 ease-out font-body"
      >
        {/* Contenedor de Imagen con zoom sutil (500ms) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f5f1ea]">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            unoptimized={
              mainImage.includes('placehold.co') ||
              mainImage.startsWith('blob:') ||
              mainImage.startsWith('data:')
            }
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/25 pointer-events-none" />

          {/* Badge superior */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <Badge
              size="sm"
              className="shadow-xs backdrop-blur-xs bg-[#faf9f6]/95"
              variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
            >
              {property.type} en {property.operation}
            </Badge>
          </div>

          {/* Correlativo público discreto */}
          {property.internal_code && (
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="inline-block text-[10px] font-mono font-medium tracking-wide px-2 py-1 rounded-md bg-black/35 text-white/95 backdrop-blur-xs">
                Ref {property.internal_code}
              </span>
            </div>
          )}
        </div>

        {/* Contenido Editorial */}
        <div className="flex flex-col flex-1 p-5 sm:p-6">
          {/* Precio en Fraunces (font-display) */}
          <div className="font-display text-2xl sm:text-3xl font-semibold text-brand">
            {formatPrice(property.price, property.operation)}
          </div>

          {/* Título de tarjeta en Fraunces (font-display) */}
          <h3 className="mt-2 font-display text-lg font-medium text-text-heading line-clamp-1 group-hover:text-brand transition-colors duration-200">
            {property.title}
          </h3>

          {/* Resumen corto en Sora (font-body) */}
          <p className="mt-1.5 text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-body font-normal">
            {property.description || `${property.type} en excelentes condiciones en ${property.city}.`}
          </p>

          {/* Separador */}
          <div className="mt-auto pt-4 border-t border-stone-200/70 flex flex-col gap-2.5">
            {/* Ubicación */}
            <div className="flex items-center text-xs text-stone-600 gap-1.5 font-body">
              <MapPin size={14} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
              <span className="truncate">
                {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
              </span>
            </div>

            {/* Características rápidas */}
            <div className="flex items-center gap-3.5 text-xs text-stone-500 font-medium font-body">
              {mainArea && (
                <div className="flex items-center gap-1">
                  <Maximize2 size={14} strokeWidth={1.5} className="text-stone-400" />
                  <span>{formatArea(mainArea)}</span>
                </div>
              )}
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bed size={14} strokeWidth={1.5} className="text-stone-400" />
                  <span>{property.bedrooms} hab</span>
                </div>
              )}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="flex items-center gap-1">
                  <Bath size={14} strokeWidth={1.5} className="text-stone-400" />
                  <span>{property.bathrooms} bñ</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </FadeInUp>
  );
};
