'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { Inmueble } from '@/lib/types';
import { propertiesStore, toPublicProperty } from '@/lib/properties';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { PropertyCard } from '@/components/public/PropertyCard';
import { FadeInUp } from '@/components/ui/FadeInUp';

export const FeaturedProperties: React.FC = () => {
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    propertiesStore
      .getPublic()
      .then((data) => {
        const publicProps = (data || []).map(toPublicProperty);
        if (publicProps.length > 0) {
          // Tomar 3 o 4 propiedades (mezcladas aleatoriamente o las primeras 3)
          const shuffled = [...publicProps].sort(() => 0.5 - Math.random());
          setProperties(shuffled.slice(0, 3));
        } else {
          // Fallback a propiedades modelo
          setProperties(MOCK_PROPERTIES.slice(0, 3));
        }
      })
      .catch(() => {
        setProperties(MOCK_PROPERTIES.slice(0, 3));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (!isLoading && properties.length === 0) {
    return null;
  }

  return (
    <section className="relative py-18 md:py-24 bg-gradient-to-b from-[#faf9f6] via-[#f5f1ea]/40 to-[#faf9f6] border-y border-stone-200/60 overflow-hidden">
      {/* Luz ambiental sutil decorativa de fondo */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C97B5A]/8 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado con animaciones dinámicas */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <FadeInUp duration={0.5} className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C97B5A]/10 border border-[#C97B5A]/30 text-[#C97B5A] text-[11px] font-medium tracking-[0.2em] uppercase mb-3">
              <Sparkles size={13} className="text-[#C97B5A]" />
              <span>Selección Exclusiva</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-text-heading tracking-tight">
              Inmuebles Destacados
            </h2>
            <div className="w-[42px] h-[2px] bg-[#C97B5A] my-3.5 mx-auto md:mx-0" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-body">
              Oportunidades residenciales y comerciales cuidadosamente evaluadas en los sectores más cotizados de Carabobo.
            </p>
          </FadeInUp>

          <FadeInUp duration={0.5} delay={0.2} className="shrink-0 flex justify-center md:justify-end">
            <Link
              href="/inventario"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-stone-300/80 hover:border-brand text-brand hover:text-white hover:bg-brand font-body text-xs sm:text-sm font-medium tracking-wider uppercase shadow-2xs hover:shadow-luxury transition-all duration-300 hover:-translate-y-0.5"
            >
              <Compass size={16} strokeWidth={1.5} />
              <span>Ver Todo el Inventario</span>
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeInUp>
        </div>

        {/* Cuadrícula de Inmuebles con stagger y microinteracciones */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[380px] rounded-2xl bg-stone-200/60 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : (
          <div
            className={
              properties.length === 1
                ? 'max-w-md mx-auto'
                : properties.length === 2
                ? 'grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-7'
                : 'grid grid-cols-1 md:grid-cols-3 gap-7'
            }
          >
            {properties.map((property, idx) => (
              <PropertyCard key={property.id} property={property} index={idx} />
            ))}
          </div>
        )}

        {/* Banner Inferior de Atención Personalizada */}
        <FadeInUp duration={0.5} delay={0.3} className="mt-14">
          <div className="p-6 sm:p-8 rounded-2xl bg-white/90 border border-stone-200/90 shadow-card flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-text-heading">
                ¿Buscas una propiedad con características específicas?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 font-body">
                Coméntame tu presupuesto y zona predilecta para realizar un rastreo privado en todo el mercado.
              </p>
            </div>
            <Link
              href="/inventario"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs font-medium uppercase tracking-wider shadow-sm hover:shadow-luxury transition-all hover:-translate-y-0.5"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};
