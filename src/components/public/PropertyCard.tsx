import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2, Bed, Bath } from 'lucide-react';
import { Inmueble } from '@/lib/types';
import { formatPrice, formatArea, getPropertyMainArea } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface PropertyCardProps {
  property: Inmueble;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const mainArea = getPropertyMainArea(property);
  const mainImage = property.images[0] || 'https://placehold.co/800x600/1e3a5f/ffffff?text=Sin+Imagen';

  return (
    <Link
      href={`/inmueble/${property.id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200"
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge superior */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            className="shadow-sm font-medium"
            variant={property.operation === 'Venta' ? 'venta' : 'alquiler'}
          >
            {property.type} en {property.operation}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Precio */}
        <div className="text-xl sm:text-2xl font-extrabold text-brand">
          {formatPrice(property.price, property.operation)}
        </div>

        {/* Título */}
        <h3 className="mt-1.5 text-base font-bold text-gray-900 line-clamp-1 group-hover:text-brand transition-colors">
          {property.title}
        </h3>

        {/* Resumen corto / Descripción */}
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {property.description || `${property.type} en excelentes condiciones en ${property.city}.`}
        </p>

        {/* Separador */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          {/* Ubicación */}
          <div className="flex items-center text-xs text-gray-600 gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">
              {property.sector ? `${property.sector}, ` : ''}{property.city}, {property.state}
            </span>
          </div>

          {/* Características rápidas (Área, habs, baños) */}
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
            {mainArea && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatArea(mainArea)}</span>
              </div>
            )}
            {property.bedrooms !== undefined && property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-gray-400" />
                <span>{property.bedrooms} hab</span>
              </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-gray-400" />
                <span>{property.bathrooms} bñ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

