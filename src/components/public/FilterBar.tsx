'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
    <div className="bg-[#faf9f6] p-5 sm:p-7 rounded-2xl shadow-card border border-stone-200/80 font-body">
      {/* Buscador de texto principal */}
      <div className="relative mb-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
          <Search size={18} strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleChange('searchQuery', e.target.value)}
          placeholder="Buscar por título, referencia (SN-01), municipio o sector..."
          className="w-full pl-11 pr-4 py-3 bg-[#f5f1ea]/50 border border-stone-200 rounded-xl text-sm text-text-heading placeholder-stone-400 font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all duration-200"
        />
      </div>

      {/* Grid de 5 filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Tipo de inmueble */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-600 mb-1.5 font-body">
            Tipo de Inmueble
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#faf9f6] border border-stone-200 rounded-xl text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer"
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

        {/* 2. Operación */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-600 mb-1.5 font-body">
            Operación
          </label>
          <select
            value={filters.operation}
            onChange={(e) => handleChange('operation', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#faf9f6] border border-stone-200 rounded-xl text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer"
          >
            <option value="Todas">Todas (Venta/Alquiler)</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
          </select>
        </div>

        {/* 3. Ubicación */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-600 mb-1.5 font-body">
            Municipio
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#faf9f6] border border-stone-200 rounded-xl text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer"
          >
            <option value="Todas">Todos los municipios</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Precio Máximo (monto libre en USD) */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-600 mb-1.5 font-body">
            Precio Máximo (USD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 text-xs sm:text-sm font-body">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={
                filters.maxPrice === 'all'
                  ? ''
                  : new Intl.NumberFormat('en-US').format(Number(filters.maxPrice))
              }
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                handleChange('maxPrice', digits || 'all');
              }}
              placeholder="Sin límite"
              className="w-full pl-7 py-2.5 text-xs sm:text-sm bg-[#faf9f6] border border-stone-200 rounded-xl text-text-heading font-body placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all duration-200"
              style={{ paddingRight: filters.maxPrice === 'all' ? '0.875rem' : '2rem' }}
            />
            {filters.maxPrice !== 'all' && (
              <button
                type="button"
                onClick={() => handleChange('maxPrice', 'all')}
                aria-label="Quitar límite de precio"
                title="Quitar límite"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* 5. Ordenamiento */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-stone-600 mb-1.5 font-body flex items-center gap-1.5">
            <SlidersHorizontal size={13} strokeWidth={1.5} className="text-[#C97B5A]" />
            <span>Ordenar por</span>
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#faf9f6] border border-stone-200 rounded-xl text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="area_desc">Metraje: mayor a menor</option>
            <option value="area_asc">Metraje: menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Botón para reiniciar filtros */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-stone-200/70 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-body flex items-center gap-1.5">
            <SlidersHorizontal size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
            Filtros activos
          </span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-[#C97B5A] hover:text-[#a85d3d] font-medium font-body transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
