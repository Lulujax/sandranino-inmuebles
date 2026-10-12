import React from 'react';
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

  return (
    <div className="space-y-6">
      {/* Saludo + Botón publicar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenida, Sandra</h2>
          <p className="text-sm text-gray-500">
            Aquí tienes un resumen de la actividad y el catálogo de tus propiedades.
          </p>
        </div>
        <Link
          href="/admin/publicar"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Publicar Nuevo</span>
        </Link>
      </div>

      {/* 4 Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inmuebles"
          value={totalProperties}
          icon={Building2}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          title="En Venta"
          value={forSale}
          icon={Tag}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="En Alquiler"
          value={forRent}
          icon={Key}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
        />
        <StatCard
          title="Borradores"
          value={drafts}
          icon={FileEdit}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
      </div>

      {/* Grid: Gráfico de barras horizontal + Top visitados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras horizontal: Inmuebles por tipo */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">Inmuebles por Tipo</h3>
            <span className="text-xs text-gray-400">Distribución</span>
          </div>

          <div className="space-y-4">
            {Object.entries(typeCounts).map(([type, count]) => {
              const percentage = Math.round((count / maxTypeCount) * 100);

              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>{type}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 4 Inmuebles más visitados */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900">Inmuebles más Visitados</h3>
            <span className="text-xs text-gray-400">Top 4</span>
          </div>

          <div className="space-y-3.5">
            {mostVisited.map((prop, idx) => (
              <div
                key={prop.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {prop.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {prop.city} • {formatPrice(prop.price, prop.operation)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand shrink-0 ml-3">
                  <Eye className="w-3.5 h-3.5 text-brand" />
                  <span>{prop.visits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos Inmuebles Publicados */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Últimos Inmuebles Publicados</h3>
          <Link
            href="/admin/inmuebles"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            Ver todos los inmuebles
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestPublished.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
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
                  <Badge size="sm" variant={prop.operation === 'Venta' ? 'venta' : 'alquiler'}>
                    {prop.operation}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDate(prop.created_at)}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
                <p className="text-xs font-extrabold text-brand mt-0.5">
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

