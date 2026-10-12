'use client';

import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { FilterState } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableCities: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableCities,
}) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      type: 'Todos',
      operation: 'Todas',
      city: 'Todas',
      maxPrice: 'all',
      sortBy: 'recent',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.type !== 'Todos' ||
    filters.operation !== 'Todas' ||
    filters.city !== 'Todas' ||
    filters.maxPrice !== 'all' ||
    filters.sortBy !== 'recent';

  return (
    <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-card border border-stone-200/80 transition-shadow hover:shadow-luxury">
      {/* Buscador de texto principal */}
      <div className="relative mb-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
          <Search className="w-4 h-4 stroke-[1.75]" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleChange('searchQuery', e.target.value)}
          placeholder="Buscar por título, municipio, sector, urbanización..."
          className="w-full pl-11 pr-4 py-3 bg-cream-50/50 border border-stone-200/80 rounded-xl text-sm text-text-heading placeholder-stone-400 font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all duration-200 shadow-xs"
        />
      </div>

      {/* Grid de 5 filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Tipo de inmueble */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-sans">
            Tipo de Inmueble
          </label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/80 rounded-xl text-text-heading font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs hover:border-stone-300"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Galpón">Galpón</option>
              <option value="Local">Local</option>
              <option value="Terreno">Terreno</option>
              <option value="Oficina">Oficina</option>
            </select>
          </div>
        </div>

        {/* 2. Operación */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-sans">
            Operación
          </label>
          <div className="relative">
            <select
              value={filters.operation}
              onChange={(e) => handleChange('operation', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/80 rounded-xl text-text-heading font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs hover:border-stone-300"
            >
              <option value="Todas">Todas (Venta/Alquiler)</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
          </div>
        </div>

        {/* 3. Ubicación (Municipios disponibles) */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-sans">
            Municipio
          </label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/80 rounded-xl text-text-heading font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs hover:border-stone-300"
            >
              <option value="Todas">Todos los municipios</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Precio Máximo */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-sans">
            Precio Máximo
          </label>
          <div className="relative">
            <select
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/80 rounded-xl text-text-heading font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs hover:border-stone-300"
            >
              <option value="all">Sin límite</option>
              <option value="50000">Hasta $50,000</option>
              <option value="100000">Hasta $100,000</option>
              <option value="200000">Hasta $200,000</option>
            </select>
          </div>
        </div>

        {/* 5. Ordenamiento con estilo editorial */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-1.5 font-sans flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-terracotta stroke-[2]" />
            <span>Ordenar por</span>
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value as FilterState['sortBy'])}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200/80 rounded-xl text-text-heading font-sans focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs hover:border-stone-300"
            >
              <option value="recent">Más recientes</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="area_desc">Metraje: mayor a menor</option>
              <option value="area_asc">Metraje: menor a mayor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botón para reiniciar filtros si hay alguno activo */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-sans flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-terracotta" />
            Filtros aplicados
          </span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-terracotta hover:text-terracotta-dark font-medium font-sans transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
