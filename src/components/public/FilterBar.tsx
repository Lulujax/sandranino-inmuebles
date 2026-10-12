'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Buscador de texto */}
      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleChange('searchQuery', e.target.value)}
          placeholder="Buscar por título, municipio, sector..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
        />
      </div>

      {/* Grid de 5 filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Tipo de inmueble */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Tipo de Inmueble
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
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
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Operación
          </label>
          <select
            value={filters.operation}
            onChange={(e) => handleChange('operation', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            <option value="Todas">Todas</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
          </select>
        </div>

        {/* 3. Ubicación (Municipios disponibles) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Municipio
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            <option value="Todas">Todos los municipios</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Precio Máximo */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Precio Máximo
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            <option value="all">Sin límite</option>
            <option value="50000">Hasta $50,000</option>
            <option value="100000">Hasta $100,000</option>
            <option value="200000">Hasta $200,000</option>
          </select>
        </div>

        {/* 5. Ordenamiento */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value as FilterState['sortBy'])}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          >
            <option value="recent">Más recientes</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="area_desc">Metraje: mayor a menor</option>
            <option value="area_asc">Metraje: menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Botón para reiniciar filtros si hay alguno activo */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

