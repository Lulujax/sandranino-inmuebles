'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images
      : ['https://placehold.co/800x600/1e3a5f/ffffff?text=Sin+Imagen'];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full select-none">
      {/* Contenedor Principal */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-brand-darker shadow-luxury border border-stone-200/60 group">
        <Image
          key={currentIndex}
          src={displayImages[currentIndex]}
          alt={`${title} - Fotografía ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover transition-opacity duration-300 animate-fade-in"
        />

        {/* Flechas de navegación (solo si hay más de 1 imagen) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-darker/60 hover:bg-brand-darker/90 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none shadow-md"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-darker/60 hover:bg-brand-darker/90 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none shadow-md"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6 stroke-[1.5]" />
            </button>

            {/* Contador de fotos elegante */}
            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-brand-darker/70 backdrop-blur-md text-cream-50 text-xs font-mono tracking-widest border border-white/10 shadow-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas con borde activo terracota */}
      {displayImages.length > 1 && (
        <div className="mt-3.5 grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {displayImages.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                currentIndex === idx
                  ? 'border-terracotta ring-2 ring-terracotta/25 opacity-100 scale-[1.02] shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.01]'
              )}
            >
              <Image
                src={img}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="140px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
