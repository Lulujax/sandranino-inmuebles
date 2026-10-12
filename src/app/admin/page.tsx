'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Tag,
  Key,
  FileEdit,
  Plus,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboardPage() {
  // Cálculos para tarjetas de resumen
  const totalProperties = MOCK_PROPERTIES.length;
  const forSale = MOCK_PROPERTIES.filter((p) => p.operation === 'Venta').length;
  const forRent = MOCK_PROPERTIES.filter((p) => p.operation === 'Alquiler').length;
  const drafts = MOCK_PROPERTIES.filter((p) => p.status === 'Borrador').length;

  // Gráfico horizontal: inmuebles por tipo
  const typeCounts = {
    Casa: MOCK_PROPERTIES.filter((p) => p.type === 'Casa').length,
    Apartamento: MOCK_PROPERTIES.filter((p) => p.type === 'Apartamento').length,
    Galpón: MOCK_PROPERTIES.filter((p) => p.type === 'Galpón').length,
    Local: MOCK_PROPERTIES.filter((p) => p.type === 'Local').length,
    Terreno: MOCK_PROPERTIES.filter((p) => p.type === 'Terreno').length,
    Oficina: MOCK_PROPERTIES.filter((p) => p.type === 'Oficina').length,
  };

  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  // Top 4 más visitados
  const mostVisited = [...MOCK_PROPERTIES]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 4);

  // Últimos 2 publicados
  const latestPublished = [...MOCK_PROPERTIES]
    .filter((p) => p.status === 'Publicado')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);

  // State to trigger horizontal bar growth animation on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Saludo + Botón publicar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta block mb-1">
            Resumen General
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-heading tracking-tight">
            Bienvenida, Sandra
          </h2>
          <p className="text-sm text-stone-500 mt-1 font-sans">
            Aquí tienes un panorama en tiempo real de tu catálogo y el alcance de tus propiedades.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand hover:bg-brand-darker text-white font-sans font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>+ Publicar Nuevo</span>
        </Link>
      </div>

      {/* 4 Tarjetas de resumen con fade-in-up y stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatCard
          title="Total Inmuebles"
          value={totalProperties}
          icon={Building2}
          iconBg="bg-brand/5"
          iconColor="text-brand"
          className="animate-fade-in-up stagger-1"
        />
        <StatCard
          title="En Venta"
          value={forSale}
          icon={Tag}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          className="animate-fade-in-up stagger-2"
        />
        <StatCard
          title="En Alquiler"
          value={forRent}
          icon={Key}
          iconBg="bg-terracotta/10"
          iconColor="text-terracotta-dark"
          className="animate-fade-in-up stagger-3"
        />
        <StatCard
          title="Borradores"
          value={drafts}
          icon={FileEdit}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          className="animate-fade-in-up stagger-4"
        />
      </div>

      {/* Grid: Gráfico de barras horizontal + Top visitados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras horizontal: Inmuebles por tipo con animación de crecimiento */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block">
                Distribución
              </span>
              <h3 className="font-serif text-lg text-text-heading">
                Inmuebles por Tipo
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-sans">
              Categorías
            </span>
          </div>

          <div className="space-y-4.5">
            {Object.entries(typeCounts).map(([type, count]) => {
              const percentage = Math.round((count / maxTypeCount) * 100);

              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-stone-700 font-sans">
                    <span className="tracking-wide">{type}</span>
                    <span className="font-serif font-bold text-text-heading">{count}</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: mounted ? `${percentage}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 4 Inmuebles más visitados con desplazamiento sutil en hover */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block">
                Popularidad
              </span>
              <h3 className="font-serif text-lg text-text-heading">
                Inmuebles más Visitados
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-sans">
              Top 4
            </span>
          </div>

          <div className="space-y-3">
            {mostVisited.map((prop, idx) => (
              <div
                key={prop.id}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-cream-50/70 border border-stone-200/50 hover:bg-white hover:shadow-card hover:border-brand/20 hover:translate-x-1 transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-serif text-sm font-semibold text-terracotta w-5 shrink-0">
                    0{idx + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-heading truncate group-hover:text-brand transition-colors">
                      {prop.title}
                    </p>
                    <p className="text-xs text-stone-500 font-sans">
                      {prop.city} • {formatPrice(prop.price, prop.operation)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand shrink-0 ml-3 bg-brand/5 px-2.5 py-1 rounded-full border border-brand/10">
                  <Eye className="w-3.5 h-3.5 text-brand stroke-[1.75]" />
                  <span>{prop.visits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos Inmuebles Publicados con zoom sutil en miniatura */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block">
              Recientes
            </span>
            <h3 className="font-serif text-lg text-text-heading">
              Últimos Inmuebles Publicados
            </h3>
          </div>
          <Link
            href="/admin/inmuebles"
            className="text-xs font-semibold text-brand hover:text-brand-darker flex items-center gap-1.5 font-sans uppercase tracking-wider transition-colors"
          >
            <span>Ver inventario completo</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestPublished.map((prop) => (
            <div
              key={prop.id}
              className="group flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 bg-cream-50/50 hover:bg-white hover:shadow-card hover:border-brand/20 transition-all duration-200"
            >
              <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-cream-200 border border-stone-200/80">
                <Image
                  src={prop.images[0] || 'https://placehold.co/100x100?text=SN'}
                  alt={prop.title}
                  fill
                  sizes="72px"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge size="sm" variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}>
                    {prop.operation}
                  </Badge>
                  <span className="text-[11px] text-stone-400 font-sans">{formatDate(prop.created_at)}</span>
                </div>
                <p className="text-sm font-semibold text-text-heading truncate group-hover:text-brand transition-colors font-sans">
                  {prop.title}
                </p>
                <p className="font-serif text-sm font-normal text-brand mt-0.5">
                  {formatPrice(prop.price, prop.operation)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
