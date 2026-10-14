import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoadingPropertyDetail() {
  return (
    <div className="min-h-screen bg-cream text-text-body font-sans pb-28">
      {/* Barra superior */}
      <header className="bg-cream-50/90 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Volver al Inventario</span>
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-terracotta hidden sm:inline">
            Sandra Niño • Inventario Exclusivo
          </span>
        </div>
      </header>

      {/* Skeleton Editorial */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-36 bg-cream-200 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="h-10 w-3/4 max-w-lg bg-cream-200 rounded-xl" />
            <div className="h-10 w-40 bg-cream-200 rounded-xl" />
          </div>
        </div>

        {/* Galería Skeleton */}
        <div className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl bg-cream-200 border border-stone-200/60" />

        {/* Tarjetas de detalles Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/60 p-5 rounded-2xl border border-stone-200/60 h-24"
            />
          ))}
        </div>
      </main>
    </div>
  );
}

