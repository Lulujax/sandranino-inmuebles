'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Sparkles } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { FilterState } from '@/lib/types';
import { getPropertyMainArea } from '@/lib/utils';
import { FilterBar } from '@/components/public/FilterBar';
import { PropertyCard } from '@/components/public/PropertyCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export default function InventarioPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    type: 'Todos',
    operation: 'Todas',
    city: 'Todas',
    maxPrice: 'all',
    sortBy: 'recent',
  });

  // Municipios únicos existentes en los inmuebles publicados
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    MOCK_PROPERTIES.forEach((p) => {
      if (p.status === 'Publicado') {
        cities.add(p.city);
      }
    });
    return Array.from(cities).sort();
  }, []);

  // Inmuebles filtrados y ordenados en tiempo real
  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((prop) => prop.status === 'Publicado')
      .filter((prop) => {
        // Buscador de texto (título o ubicación)
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchCity = prop.city.toLowerCase().includes(q);
          const matchSector = prop.sector?.toLowerCase().includes(q) || false;
          const matchState = prop.state.toLowerCase().includes(q);
          if (!matchTitle && !matchCity && !matchSector && !matchState) return false;
        }

        // Tipo
        if (filters.type !== 'Todos' && prop.type !== filters.type) {
          return false;
        }

        // Operación
        if (filters.operation !== 'Todas' && prop.operation !== filters.operation) {
          return false;
        }

        // Ubicación (Municipio)
        if (filters.city !== 'Todas' && prop.city !== filters.city) {
          return false;
        }

        // Precio Máximo
        if (filters.maxPrice !== 'all') {
          const max = Number(filters.maxPrice);
          if (prop.price > max) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const areaA = getPropertyMainArea(a) || 0;
        const areaB = getPropertyMainArea(b) || 0;

        switch (filters.sortBy) {
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'price_desc':
            return b.price - a.price;
          case 'price_asc':
            return a.price - b.price;
          case 'area_desc':
            return areaB - areaA;
          case 'area_asc':
            return areaA - areaB;
          default:
            return 0;
        }
      });
  }, [filters]);

  return (
    <div className="min-h-screen bg-cream text-text-body font-sans pb-24 selection:bg-terracotta/20 selection:text-text-heading">
      {/* Barra superior editorial */}
      <header className="bg-cream-50/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:text-brand-darker transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Sandra Nino</span>
          </Link>
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta block">
              Catálogo Exclusivo
            </span>
            <h1 className="font-serif text-lg sm:text-xl text-text-heading font-normal">
              Inventario de Inmuebles
            </h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-8">
        {/* Barra de Filtros */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableCities={availableCities}
        />

        {/* Contador de resultados animado */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-sans">
            <Sparkles className="w-4 h-4 text-terracotta stroke-[1.75]" />
            <span>
              Mostrando{' '}
              <strong className="text-text-heading font-semibold">
                <AnimatedCounter value={filteredProperties.length} duration={500} />
              </strong>{' '}
              {filteredProperties.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
            </span>
          </div>
        </div>

        {/* Grid de resultados */}
        {filteredProperties.length === 0 ? (
          /* Empty state elegante */
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 sm:p-16 text-center shadow-card max-w-xl mx-auto animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-cream-200 text-brand flex items-center justify-center mx-auto mb-5 border border-stone-200/60">
              <Building2 className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl text-text-heading mb-3 tracking-tight">
              Sin coincidencias en esta búsqueda
            </h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mb-8 leading-relaxed font-sans font-normal">
              No hemos encontrado propiedades con los criterios seleccionados. Prueba modificando los filtros para descubrir otras alternativas en nuestro catálogo.
            </p>
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  type: 'Todos',
                  operation: 'Todas',
                  city: 'Todas',
                  maxPrice: 'all',
                  sortBy: 'recent',
                })
              }
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand hover:bg-brand-darker text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProperties.map((property, idx) => (
              <PropertyCard key={property.id} property={property} index={(idx % 5) + 1} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
