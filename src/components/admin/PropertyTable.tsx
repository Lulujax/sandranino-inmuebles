'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Plus,
  Edit2,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Inmueble, AdminFilterState, PropertyStatus } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface PropertyTableProps {
  initialProperties: Inmueble[];
}

export const PropertyTable: React.FC<PropertyTableProps> = ({ initialProperties }) => {
  const [properties, setProperties] = useState<Inmueble[]>(initialProperties);
  const [filters, setFilters] = useState<AdminFilterState>({
    searchQuery: '',
    status: 'Todos',
    operation: 'Todas',
    type: 'Todos',
    sortBy: 'recent',
  });

  const { toast } = useToast();

  const handleStatusToggle = (id: string) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id === id) {
          const nextStatus: PropertyStatus =
            prop.status === 'Pausado' ? 'Publicado' : 'Pausado';
          toast(
            `Inmueble ${nextStatus === 'Pausado' ? 'pausado' : 'reactivado'} correctamente`,
            'info'
          );
          return { ...prop, status: nextStatus };
        }
        return prop;
      })
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Estás segura de eliminar el inmueble "${title}"?`)) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast('Inmueble eliminado con éxito', 'success');
    }
  };

  // Filtrado y ordenamiento en tiempo real
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        // Texto
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchCity = prop.city.toLowerCase().includes(q);
          const matchSector = prop.sector?.toLowerCase().includes(q) || false;
          const matchCode = prop.internal_code?.toLowerCase().includes(q) || false;
          if (!matchTitle && !matchCity && !matchSector && !matchCode) return false;
        }

        // Estado
        if (filters.status !== 'Todos' && prop.status !== filters.status) {
          return false;
        }

        // Operación
        if (filters.operation !== 'Todas' && prop.operation !== filters.operation) {
          return false;
        }

        // Tipo
        if (filters.type !== 'Todos' && prop.type !== filters.type) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'recent':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'price_desc':
            return b.price - a.price;
          case 'price_asc':
            return a.price - b.price;
          default:
            return 0;
        }
      });
  }, [properties, filters]);

  return (
    <div className="space-y-6">
      {/* Barra superior con botón nuevo inmueble */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catálogo de Inmuebles</h2>
          <p className="text-sm text-gray-500">
            Gestiona, edita o pausa las propiedades publicadas en tu catálogo personal.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Inmueble</span>
        </Link>
      </div>

      {/* Grid de 5 filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar inmueble..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Estado */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Publicado">Publicado</option>
            <option value="Borrador">Borrador</option>
            <option value="Pausado">Pausado</option>
            <option value="Vendido">Vendido</option>
          </select>
        </div>

        {/* Operación */}
        <div>
          <select
            value={filters.operation}
            onChange={(e) => setFilters((f) => ({ ...f, operation: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="Todas">Todas las operaciones</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
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

        {/* Ordenamiento */}
        <div>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value as AdminFilterState['sortBy'] }))
            }
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="price_asc">Precio: menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Tabla responsive */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">No se encontraron inmuebles con esos filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Inmueble</th>
                  <th className="py-3 px-4 hidden md:table-cell">Tipo / Operación</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Miniatura + Título */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image
                            src={prop.images[0] || 'https://placehold.co/100x100?text=SN'}
                            alt={prop.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/inmueble/${prop.id}`}
                            target="_blank"
                            className="font-semibold text-gray-900 hover:text-brand truncate block max-w-xs sm:max-w-md"
                          >
                            {prop.title}
                          </Link>
                          <span className="text-xs text-gray-500 block truncate">
                            {prop.city}, {prop.state}
                            {prop.internal_code ? ` • ${prop.internal_code}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tipo + Operación (Oculto en móvil) */}
                    <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-700">{prop.type}</span>
                        <Badge
                          size="sm"
                          variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}
                        >
                          {prop.operation}
                        </Badge>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">
                        {formatPrice(prop.price, prop.operation)}
                      </span>
                    </td>

                    {/* Estado (Oculto en móvil) */}
                    <td className="py-3 px-4 hidden sm:table-cell whitespace-nowrap">
                      <Badge status={prop.status}>{prop.status}</Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <Link
                          href={`/admin/publicar?edit=${prop.id}`}
                          className="p-1.5 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-md transition-colors"
                          title="Editar inmueble"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Pausar / Reactivar */}
                        <button
                          onClick={() => handleStatusToggle(prop.id)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md transition-colors"
                          title={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                        >
                          {prop.status === 'Pausado' ? (
                            <PlayCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <PauseCircle className="w-4 h-4" />
                          )}
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar inmueble"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

