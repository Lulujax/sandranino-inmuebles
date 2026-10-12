'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { FilterState } from '@/lib/types';
import { getPropertyMainArea } from '@/lib/utils';
import { FilterBar } from '@/components/public/FilterBar';
import { PropertyCard } from '@/components/public/PropertyCard';

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
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sandra Nino</span>
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-gray-900">
            Catálogo de Inmuebles
          </h1>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Barra de Filtros */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableCities={availableCities}
        />

        {/* Contador de resultados */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-gray-600">
            <span className="font-bold text-gray-900">{filteredProperties.length}</span>{' '}
            {filteredProperties.length === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
          </p>
        </div>

        {/* Grid de resultados */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-brand flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No se encontraron inmuebles con esos filtros
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Prueba cambiando o limpiando algunos filtros para encontrar más opciones disponibles en nuestro catálogo.
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
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-light transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

