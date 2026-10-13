'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  PlusCircle,
  Pencil,
  Pause,
  Play,
  Trash2,
  Eye,
  Home,
  CheckCircle2,
  User,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Inmueble, AdminFilterState, PropertyStatus } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

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

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  const { toast } = useToast();

  const handleStatusChange = (id: string, nextStatus: PropertyStatus) => {
    propertiesStore.update(id, { status: nextStatus });
    setProperties(propertiesStore.getAll());
    toast(`Estado actualizado a "${nextStatus}"`, 'success');
  };

  const handleStatusToggle = (id: string) => {
    const target = properties.find((p) => p.id === id);
    if (!target) return;

    const nextStatus: PropertyStatus =
      target.status === 'Pausado' ? 'Publicado' : 'Pausado';

    handleStatusChange(id, nextStatus);
  };

  const handleMarkSold = (id: string) => {
    const target = properties.find((p) => p.id === id);
    if (!target) return;

    const nextStatus: PropertyStatus =
      target.status === 'Vendido' ? 'Publicado' : 'Vendido';

    handleStatusChange(id, nextStatus);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Estás segura de eliminar el inmueble "${title}"?`)) {
      propertiesStore.delete(id);
      setProperties(propertiesStore.getAll());
      toast('Inmueble eliminado con éxito', 'success');
    }
  };

  // Filtrado y ordenamiento en tiempo real
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchCity = prop.city.toLowerCase().includes(q);
          const matchSector = prop.sector?.toLowerCase().includes(q) || false;
          const matchCode = prop.internal_code?.toLowerCase().includes(q) || false;
          const matchOwnerName = prop.owner_name?.toLowerCase().includes(q) || false;
          const matchOwnerPhone = prop.owner_phone?.toLowerCase().includes(q) || false;
          if (
            !matchTitle &&
            !matchCity &&
            !matchSector &&
            !matchCode &&
            !matchOwnerName &&
            !matchOwnerPhone
          ) {
            return false;
          }
        }

        if (filters.status !== 'Todos' && prop.status !== filters.status) {
          return false;
        }

        if (filters.operation !== 'Todas' && prop.operation !== filters.operation) {
          return false;
        }

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

  // Empty state cuando aún no hay inmuebles en sn_properties
  if (properties.length === 0) {
    return (
      <div className="space-y-6 font-body">
        <FadeInUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
              GESTIÓN DE INVENTARIO
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
              Catálogo de Inmuebles
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Administra, actualiza, edita o pausa las propiedades publicadas en tu catálogo personal.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp
          delay={0.05}
          className="bg-[#faf9f6] p-12 sm:p-16 text-center rounded-2xl border border-stone-200/80 shadow-card flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#f5f1ea] text-brand flex items-center justify-center mb-4 border border-stone-200/80">
            <Home size={28} strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg sm:text-xl font-semibold text-text-heading mb-6 max-w-md">
            Aún no tienes inmuebles publicados. Empieza publicando el primero.
          </p>
          <Link
            href="/admin/publicar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white font-body font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200"
          >
            <PlusCircle size={16} strokeWidth={1.5} />
            <span>+ Nuevo Inmueble</span>
          </Link>
        </FadeInUp>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* Barra superior con botón nuevo inmueble */}
      <FadeInUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
            GESTIÓN DE INVENTARIO
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
            Catálogo de Inmuebles
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Administra, actualiza, edita o pausa las propiedades publicadas en tu catálogo personal.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white font-body font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200"
        >
          <PlusCircle size={16} strokeWidth={1.5} />
          <span>+ Nuevo Inmueble</span>
        </Link>
      </FadeInUp>

      {/* Grid de 5 filtros */}
      <FadeInUp
        delay={0.05}
        className="bg-[#faf9f6] p-5 rounded-2xl border border-stone-200/80 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
      >
        {/* Buscador */}
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Buscar por título, código, propietario..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs font-body"
          />
        </div>

        {/* Estado */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer font-body"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer font-body"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer font-body"
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
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-text-heading focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs cursor-pointer font-body"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="price_asc">Precio: menor a mayor</option>
          </select>
        </div>
      </FadeInUp>

      {/* Vista Móvil (Tarjetas con fade-in-up) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProperties.length === 0 ? (
          <div className="bg-[#faf9f6] p-10 text-center rounded-2xl border border-stone-200 shadow-card">
            <p className="text-stone-500 font-medium text-sm">No se encontraron inmuebles</p>
          </div>
        ) : (
          filteredProperties.map((prop, idx) => {
            const thumbUrl = prop.images[0] || 'https://placehold.co/100x100?text=SN';
            const cleanOwnerPhone = prop.owner_phone?.replace(/\D/g, '') || '';
            return (
              <FadeInUp
                key={prop.id}
                delay={idx * 0.04}
                className="bg-[#faf9f6] p-4.5 rounded-2xl border border-stone-200/80 shadow-card space-y-3.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f1ea] shrink-0 border border-stone-200 shadow-2xs">
                    <Image
                      src={thumbUrl}
                      alt={prop.title}
                      fill
                      sizes="64px"
                      unoptimized={
                        thumbUrl.includes('placehold.co') ||
                        thumbUrl.startsWith('blob:') ||
                        thumbUrl.startsWith('data:')
                      }
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={prop.status} size="sm">
                        {prop.status}
                      </Badge>
                      <Badge
                        variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}
                        size="sm"
                      >
                        {prop.operation}
                      </Badge>
                    </div>
                    <Link
                      href={`/inmueble/${prop.id}`}
                      target="_blank"
                      className="font-display font-semibold text-text-heading hover:text-brand truncate block text-sm"
                    >
                      {prop.title}
                    </Link>
                    <p className="font-display font-semibold text-brand text-sm mt-0.5">
                      {formatPrice(prop.price, prop.operation)}
                    </p>
                  </div>
                </div>

                {/* Datos internos del propietario en vista móvil */}
                {(prop.owner_name || prop.owner_phone) && (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200/80 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User size={13} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                      <span className="font-medium text-text-heading truncate">
                        {prop.owner_name || 'Propietario'}
                      </span>
                    </div>
                    {prop.owner_phone && (
                      <a
                        href={`https://wa.me/${cleanOwnerPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-full transition-colors shrink-0"
                        title={`Escribir por WhatsApp a ${prop.owner_name || prop.owner_phone}`}
                      >
                        <FaWhatsapp size={12} />
                        <span>{prop.owner_phone}</span>
                      </a>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                  <select
                    value={prop.status}
                    onChange={(e) =>
                      handleStatusChange(prop.id, e.target.value as PropertyStatus)
                    }
                    className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg text-stone-700 font-medium cursor-pointer focus:outline-none focus:border-brand"
                    aria-label="Cambiar estado"
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Borrador">Borrador</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Vendido">Vendido</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/inmueble/${prop.id}`}
                      target="_blank"
                      className="p-2 text-stone-500 hover:text-brand hover:bg-stone-200/60 rounded-lg transition-colors"
                      title="Ver ficha pública"
                      aria-label="Ver ficha pública"
                    >
                      <Eye size={16} strokeWidth={1.5} />
                    </Link>
                    <Link
                      href={`/admin/publicar?edit=${prop.id}`}
                      className="p-2 text-stone-500 hover:text-brand hover:bg-stone-200/60 rounded-lg transition-colors"
                      title="Editar inmueble"
                      aria-label="Editar inmueble"
                    >
                      <Pencil size={16} strokeWidth={1.5} />
                    </Link>
                    <button
                      onClick={() => handleMarkSold(prop.id)}
                      className="p-2 text-stone-500 hover:text-terracotta hover:bg-stone-200/60 rounded-lg transition-colors"
                      title={
                        prop.status === 'Vendido'
                          ? 'Desmarcar como vendido'
                          : 'Marcar como vendido'
                      }
                      aria-label="Marcar como vendido"
                    >
                      <CheckCircle2
                        size={16}
                        strokeWidth={1.5}
                        className={prop.status === 'Vendido' ? 'text-terracotta' : ''}
                      />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(prop.id)}
                      className="p-2 text-stone-500 hover:text-amber-600 hover:bg-stone-200/60 rounded-lg transition-colors"
                      title={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                      aria-label={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                    >
                      {prop.status === 'Pausado' ? (
                        <Play size={16} strokeWidth={1.5} className="text-emerald-600" />
                      ) : (
                        <Pause size={16} strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(prop.id, prop.title)}
                      className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar inmueble"
                      aria-label="Eliminar inmueble"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </FadeInUp>
            );
          })
        )}
      </div>

      {/* Tabla Desktop responsive */}
      <FadeInUp
        delay={0.1}
        className="hidden md:block bg-white rounded-2xl border border-stone-200/80 shadow-card overflow-hidden"
      >
        {filteredProperties.length === 0 ? (
          <div className="p-14 text-center bg-[#faf9f6]">
            <p className="text-stone-500 font-display text-lg">
              No se encontraron inmuebles con esos filtros
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 bg-[#faf9f6] text-[11px] font-medium text-stone-600 uppercase tracking-wider font-body">
                  <th className="py-3.5 px-5">Inmueble</th>
                  <th className="py-3.5 px-5">Propietario</th>
                  <th className="py-3.5 px-5">Tipo / Operación</th>
                  <th className="py-3.5 px-5">Precio</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm font-body">
                {filteredProperties.map((prop) => {
                  const thumbUrl = prop.images[0] || 'https://placehold.co/100x100?text=SN';
                  const cleanOwnerPhone = prop.owner_phone?.replace(/\D/g, '') || '';
                  return (
                    <tr key={prop.id} className="hover:bg-[#faf9f6] transition-colors duration-150">
                      {/* Miniatura + Título */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f5f1ea] shrink-0 border border-stone-200 shadow-2xs">
                            <Image
                              src={thumbUrl}
                              alt={prop.title}
                              fill
                              sizes="56px"
                              unoptimized={
                                thumbUrl.includes('placehold.co') ||
                                thumbUrl.startsWith('blob:') ||
                                thumbUrl.startsWith('data:')
                              }
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/inmueble/${prop.id}`}
                              target="_blank"
                              className="font-display font-semibold text-text-heading hover:text-brand truncate block max-w-xs lg:max-w-md transition-colors"
                            >
                              {prop.title}
                            </Link>
                            <span className="text-xs text-stone-500 block truncate mt-0.5 font-body">
                              {prop.city}, {prop.state}
                              {prop.internal_code ? ` • Ref: ${prop.internal_code}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Propietario (Uso interno) */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {prop.owner_name || prop.owner_phone ? (
                          <div className="flex flex-col gap-1">
                            {prop.owner_name && (
                              <span className="text-xs font-medium text-text-heading flex items-center gap-1.5">
                                <User size={13} strokeWidth={1.5} className="text-[#C97B5A] shrink-0" />
                                <span className="truncate max-w-[160px]">{prop.owner_name}</span>
                              </span>
                            )}
                            {prop.owner_phone && (
                              <a
                                href={`https://wa.me/${cleanOwnerPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-full transition-colors w-fit"
                                title={`Contactar por WhatsApp a ${prop.owner_name || prop.owner_phone}`}
                              >
                                <FaWhatsapp size={12} />
                                <span>{prop.owner_phone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Sin asignar</span>
                        )}
                      </td>

                      {/* Tipo + Operación */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-stone-700 font-body">
                            {prop.type}
                          </span>
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
                        <span className="font-display text-base font-semibold text-text-heading">
                          {formatPrice(prop.price, prop.operation)}
                        </span>
                      </td>

                      {/* Estado con selector directo */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge status={prop.status} size="sm">
                            {prop.status}
                          </Badge>
                          <select
                            value={prop.status}
                            onChange={(e) =>
                              handleStatusChange(prop.id, e.target.value as PropertyStatus)
                            }
                            className="text-[11px] bg-white border border-stone-200 rounded-lg px-2 py-1 text-stone-600 hover:border-stone-300 focus:outline-none focus:border-brand cursor-pointer"
                            title="Cambiar estado del inmueble"
                            aria-label="Cambiar estado del inmueble"
                          >
                            <option value="Publicado">Publicado</option>
                            <option value="Borrador">Borrador</option>
                            <option value="Pausado">Pausado</option>
                            <option value="Vendido">Vendido</option>
                          </select>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ver ficha */}
                          <Link
                            href={`/inmueble/${prop.id}`}
                            target="_blank"
                            className="p-2 text-stone-500 hover:text-brand hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                            title="Ver ficha pública"
                            aria-label="Ver ficha pública"
                          >
                            <Eye size={16} strokeWidth={1.5} />
                          </Link>

                          {/* Editar */}
                          <Link
                            href={`/admin/publicar?edit=${prop.id}`}
                            className="p-2 text-stone-500 hover:text-brand hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                            title="Editar inmueble"
                            aria-label="Editar inmueble"
                          >
                            <Pencil size={16} strokeWidth={1.5} />
                          </Link>

                          {/* Marcar como Vendido */}
                          <button
                            onClick={() => handleMarkSold(prop.id)}
                            className="p-2 text-stone-500 hover:text-terracotta hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                            title={
                              prop.status === 'Vendido'
                                ? 'Reactivar como Publicado'
                                : 'Marcar como Vendido'
                            }
                            aria-label="Marcar como Vendido"
                          >
                            <CheckCircle2
                              size={16}
                              strokeWidth={1.5}
                              className={prop.status === 'Vendido' ? 'text-terracotta' : ''}
                            />
                          </button>

                          {/* Pausar / Reactivar */}
                          <button
                            onClick={() => handleStatusToggle(prop.id)}
                            className="p-2 text-stone-500 hover:text-amber-600 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                            title={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                            aria-label={prop.status === 'Pausado' ? 'Reactivar' : 'Pausar'}
                          >
                            {prop.status === 'Pausado' ? (
                              <Play size={16} strokeWidth={1.5} className="text-emerald-600" />
                            ) : (
                              <Pause size={16} strokeWidth={1.5} />
                            )}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDelete(prop.id, prop.title)}
                            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar inmueble"
                            aria-label="Eliminar inmueble"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </FadeInUp>
    </div>
  );
};
