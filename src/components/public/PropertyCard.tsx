import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2, Bed, Bath } from 'lucide-react';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface PropertyCardProps {
  property: Inmueble;
  index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const mainArea = getPropertyMainArea(property);
  const mainImage = property.images[0] || 'https://placehold.co/800x600/1e3a5f/ffffff?text=Sin+Imagen';

  // Calculate stagger class based on index (up to 5)
  const staggerClass = index > 0 && index <= 5 ? `stagger-${index}` : '';

  return (
    <Link
      href={`/inmueble/${property.id}`}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-luxury-hover border border-stone-200/70 hover:border-brand/30 hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-in-up ${staggerClass}`}
    >
      {/* Contenedor de Imagen con zoom sutil */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-200">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Sutil overlay de degradado para resaltar badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30 pointer-events-none" />

        {/* Badge superior con tipografía Manrope pequeña y tracking amplio */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <Badge
            size="sm"
            className="shadow-sm font-sans tracking-widest text-[10px] uppercase backdrop-blur-xs bg-white/90 text-brand-dark border-white/40"
            variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
          >
            {property.type} en {property.operation}
          </Badge>
        </div>
      </div>

      {/* Contenido Editorial */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Precio en Playfair Display grande */}
        <div className="font-serif text-2xl sm:text-3xl font-normal text-brand tracking-tight">
          {formatPrice(property.price, property.operation)}
        </div>

        {/* Título */}
        <h3 className="mt-2 text-base font-semibold text-text-heading line-clamp-1 group-hover:text-brand transition-colors duration-200 font-sans">
          {property.title}
        </h3>

        {/* Resumen corto / Descripción */}
        <p className="mt-1.5 text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-sans font-normal">
          {property.description || `${property.type} en excelentes condiciones en ${property.city}.`}
        </p>

        {/* Separador */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-2.5">
          {/* Ubicación */}
          <div className="flex items-center text-xs text-stone-600 gap-1.5 font-sans">
            <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 stroke-[1.75]" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
            </span>
          </div>

          {/* Características rápidas (Área, habs, baños) */}
          <div className="flex items-center gap-3.5 text-xs text-stone-500 font-medium font-sans">
            {mainArea && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                <span>{formatArea(mainArea)}</span>
              </div>
            )}
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                <span>{property.bedrooms} hab</span>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                <span>{property.bathrooms} bñ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
