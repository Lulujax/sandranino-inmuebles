'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home,
  Tag,
  KeyRound,
  FileEdit,
  PlusCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function AdminDashboardPage() {
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <div className="space-y-8 font-body">
      {/* Saludo + Botón publicar */}
      <FadeInUp className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
            RESUMEN GENERAL
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
            Bienvenida, Sandra
          </h2>
          <p className="text-sm text-stone-600 mt-1 font-body">
            Aquí tienes un panorama en tiempo real de tu catálogo y el alcance de tus propiedades.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white font-body font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200"
        >
          <PlusCircle size={16} strokeWidth={1.5} />
          <span>PUBLICAR NUEVO</span>
        </Link>
      </FadeInUp>

      {/* 4 Tarjetas de resumen con fondo #faf9f6, borde superior 3px según tipo y stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <FadeInUp delay={0.04}>
          <StatCard
            title="Total Inmuebles"
            value={totalProperties}
            icon={Home}
            iconBg="bg-[#1e3a5f]/8"
            iconColor="text-[#1e3a5f]"
            topBorderColor="border-t-[#1e3a5f]"
          />
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <StatCard
            title="En Venta"
            value={forSale}
            icon={Tag}
            iconBg="bg-[#edf7ee]"
            iconColor="text-emerald-700"
            topBorderColor="border-t-emerald-600"
          />
        </FadeInUp>
        <FadeInUp delay={0.16}>
          <StatCard
            title="En Alquiler"
            value={forRent}
            icon={KeyRound}
            iconBg="bg-[#edf3f9]"
            iconColor="text-[#2c5282]"
            topBorderColor="border-t-[#2c5282]"
          />
        </FadeInUp>
        <FadeInUp delay={0.22}>
          <StatCard
            title="Borradores"
            value={drafts}
            icon={FileEdit}
            iconBg="bg-[#fef7eb]"
            iconColor="text-amber-700"
            topBorderColor="border-t-amber-500"
          />
        </FadeInUp>
      </div>

      {/* Grid: Gráfico de barras horizontal + Top visitados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras horizontal: Inmuebles por tipo con animación de crecimiento */}
        <FadeInUp delay={0.12} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200/60">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-0.5">
                DISTRIBUCIÓN
              </span>
              <h3 className="font-display text-lg font-semibold text-text-heading">
                Inmuebles por Tipo
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-body">
              Categorías
            </span>
          </div>

          <div className="space-y-4.5">
            {Object.entries(typeCounts).map(([type, count], idx) => {
              const percentage = Math.round((count / maxTypeCount) * 100);

              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-stone-700 font-body">
                    <span className="tracking-wide">{type}</span>
                    <span className="font-display font-semibold text-sm text-text-heading">{count}</span>
                  </div>
                  <div className="w-full bg-[#f5f1ea] rounded-full h-2.5 overflow-hidden border border-stone-200/40">
                    <motion.div
                      initial={{ width: prefersReducedMotion ? `${percentage}%` : 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, delay: idx * 0.06, ease: 'easeOut' }}
                      className="bg-[#1e3a5f] h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </FadeInUp>

        {/* Top 4 Inmuebles más visitados con desplazamiento sutil en hover */}
        <FadeInUp delay={0.18} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200/60">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-0.5">
                POPULARIDAD
              </span>
              <h3 className="font-display text-lg font-semibold text-text-heading">
                Inmuebles más Visitados
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-body">
              Top 4
            </span>
          </div>

          <div className="space-y-3">
            {mostVisited.map((prop, idx) => (
              <div
                key={prop.id}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-white/80 border border-stone-200/60 hover:bg-white hover:shadow-card hover:border-[#C97B5A]/40 hover:translate-x-1 transition-all duration-200"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-display text-sm font-semibold text-[#C97B5A] w-5 shrink-0">
                    0{idx + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-text-heading truncate group-hover:text-brand transition-colors">
                      {prop.title}
                    </p>
                    <p className="text-xs text-stone-500 font-body">
                      {prop.city} • {formatPrice(prop.price, prop.operation)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand shrink-0 ml-3 bg-[#edf3f9] px-2.5 py-1 rounded-full border border-[#2c5282]/15">
                  <Eye size={14} strokeWidth={1.5} className="text-brand" />
                  <span>{prop.visits}</span>
                </div>
              </div>
            ))}
          </div>
        </FadeInUp>
      </div>

      {/* Últimos Inmuebles Publicados */}
      <FadeInUp delay={0.24} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200/60">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-0.5">
              RECIENTES
            </span>
            <h3 className="font-display text-lg font-semibold text-text-heading">
              Últimos Inmuebles Publicados
            </h3>
          </div>
          <Link
            href="/admin/inmuebles"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-heading hover:text-brand-darker font-body uppercase tracking-wider py-1.5 px-3 rounded-lg border border-[#C97B5A]/60 hover:bg-[#C97B5A]/15 transition-all"
          >
            <span>Ver inventario completo</span>
            <ArrowRight size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestPublished.map((prop) => {
            const thumbUrl = prop.images[0] || 'https://placehold.co/100x100?text=SN';
            return (
              <div
                key={prop.id}
                className="group flex items-center gap-4 p-4 rounded-xl border border-stone-200/60 bg-white/80 hover:bg-white hover:shadow-card hover:border-[#C97B5A]/40 transition-all duration-200"
              >
                <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-[#f5f1ea] border border-stone-200/80">
                  <Image
                    src={thumbUrl}
                    alt={prop.title}
                    fill
                    sizes="72px"
                    unoptimized={thumbUrl.includes('placehold.co')}
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge size="sm" variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}>
                      {prop.operation}
                    </Badge>
                    <span className="text-[11px] text-stone-500 font-body">{formatDate(prop.created_at)}</span>
                  </div>
                  <p className="font-display text-sm font-semibold text-text-heading truncate group-hover:text-brand transition-colors">
                    {prop.title}
                  </p>
                  <p className="font-display text-sm font-semibold text-brand mt-0.5">
                    {formatPrice(prop.price, prop.operation)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </FadeInUp>
    </div>
  );
}
