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
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-900 shadow-md">
        <Image
          src={displayImages[currentIndex]}
          alt={`${title} - Foto ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover transition-opacity duration-300"
        />

        {/* Flechas de navegación (solo si hay más de 1 imagen) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Contador de fotos (ej: 1 / 5) */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas inferiores (hasta 6 visibles directamente) */}
      {displayImages.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
          {displayImages.slice(0, 6).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all',
                currentIndex === idx
                  ? 'border-brand ring-2 ring-brand/30 opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={img}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

