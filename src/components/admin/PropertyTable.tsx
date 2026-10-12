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
    <div className="space-y-6 font-sans">
      {/* Barra superior con botón nuevo inmueble */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block mb-1">
            Gestión de Inventario
          </span>
          <h2 className="font-serif text-2xl text-text-heading tracking-tight">Catálogo de Inmuebles</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Administra, actualiza, edita o pausa las propiedades publicadas en tu catálogo personal.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand hover:bg-brand-darker text-white font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>+ Nuevo Inmueble</span>
        </Link>
      </div>

      {/* Grid de 5 filtros */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Buscar por título, código..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-cream-50/70 border border-stone-200 rounded-xl text-text-heading placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs"
          />
        </div>

        {/* Estado */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="price_asc">Precio: menor a mayor</option>
          </select>
        </div>
      </div>

      {/* Vista Móvil (Tarjetas con fade-in-up) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProperties.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-stone-200 shadow-card">
            <p className="text-stone-500 font-medium text-sm">No se encontraron inmuebles</p>
          </div>
        ) : (
          filteredProperties.map((prop, idx) => (
            <div
              key={prop.id}
              className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-card animate-fade-in-up space-y-3.5"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-200 shrink-0 border border-stone-200 shadow-2xs">
                  <Image
                    src={prop.images[0] || 'https://placehold.co/100x100?text=SN'}
                    alt={prop.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={prop.status} size="sm">{prop.status}</Badge>
                    <Badge variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'} size="sm">
                      {prop.operation}
                    </Badge>
                  </div>
                  <Link
                    href={`/inmueble/${prop.id}`}
                    target="_blank"
                    className="font-serif font-semibold text-text-heading hover:text-brand truncate block text-sm"
                  >
                    {prop.title}
                  </Link>
                  <p className="font-serif font-normal text-brand text-sm mt-0.5">
                    {formatPrice(prop.price, prop.operation)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  {prop.city}, {prop.state}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/publicar?edit=${prop.id}`}
                    className="p-2 text-stone-500 hover:text-brand hover:bg-stone-100 rounded-lg transition-colors"
                    title="Editar inmueble"
                  >
                    <Edit2 className="w-4 h-4 stroke-[1.75]" />
                  </Link>
                  <button
                    onClick={() => handleStatusToggle(prop.id)}
                    className="p-2 text-stone-500 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
                    title={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                  >
                    {prop.status === 'Pausado' ? (
                      <PlayCircle className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                    ) : (
                      <PauseCircle className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(prop.id, prop.title)}
                    className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar inmueble"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla Desktop responsive */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200/80 shadow-card overflow-hidden">
        {filteredProperties.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-stone-500 font-serif text-lg">No se encontraron inmuebles con esos filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 bg-cream-50/60 text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-sans">
                  <th className="py-3.5 px-5">Inmueble</th>
                  <th className="py-3.5 px-5">Tipo / Operación</th>
                  <th className="py-3.5 px-5">Precio</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm font-sans">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-cream-50/70 transition-colors duration-150">
                    {/* Miniatura + Título */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-13 h-13 rounded-xl overflow-hidden bg-cream-200 shrink-0 border border-stone-200 shadow-2xs">
                          <Image
                            src={prop.images[0] || 'https://placehold.co/100x100?text=SN'}
                            alt={prop.title}
                            fill
                            sizes="52px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/inmueble/${prop.id}`}
                            target="_blank"
                            className="font-serif font-semibold text-text-heading hover:text-brand truncate block max-w-xs lg:max-w-md transition-colors"
                          >
                            {prop.title}
                          </Link>
                          <span className="text-xs text-stone-400 block truncate mt-0.5">
                            {prop.city}, {prop.state}
                            {prop.internal_code ? ` • Ref: ${prop.internal_code}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tipo + Operación */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-700">{prop.type}</span>
                        <Badge
                          size="sm"
                          variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}
                        >
                          {prop.operation}
                        </Badge>
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-serif text-base font-normal text-text-heading">
                        {formatPrice(prop.price, prop.operation)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <Badge status={prop.status} size="sm">{prop.status}</Badge>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <Link
                          href={`/admin/publicar?edit=${prop.id}`}
                          className="p-2 text-stone-400 hover:text-brand hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar inmueble"
                        >
                          <Edit2 className="w-4 h-4 stroke-[1.75]" />
                        </Link>

                        {/* Pausar / Reactivar */}
                        <button
                          onClick={() => handleStatusToggle(prop.id)}
                          className="p-2 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                        >
                          {prop.status === 'Pausado' ? (
                            <PlayCircle className="w-4 h-4 text-emerald-600 stroke-[1.75]" />
                          ) : (
                            <PauseCircle className="w-4 h-4 stroke-[1.75]" />
                          )}
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar inmueble"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.75]" />
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
