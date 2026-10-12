'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

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
    <div className="w-full select-none font-body">
      {/* Contenedor Principal con transición fade de framer-motion */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-brand-darker shadow-luxury border border-stone-200/60 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="relative w-full h-full"
          >
            <Image
              src={displayImages[currentIndex]}
              alt={`${title} - Fotografía ${currentIndex + 1}`}
              fill
              priority
              unoptimized={displayImages[currentIndex].includes('placehold.co')}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Flechas de navegación */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-darker/60 hover:bg-brand-darker/90 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none shadow-md cursor-pointer z-10"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-brand-darker/60 hover:bg-brand-darker/90 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none shadow-md cursor-pointer z-10"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>

            {/* Contador de fotos */}
            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-brand-darker/70 backdrop-blur-md text-cream-50 text-xs font-body tracking-widest border border-white/10 shadow-sm z-10">
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
              aria-label={`Ver fotografía ${idx + 1}`}
              className={cn(
                'relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer',
                currentIndex === idx
                  ? 'border-[#C97B5A] ring-2 ring-[#C97B5A]/25 opacity-100 scale-[1.02] shadow-sm'
                  : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.01]'
              )}
            >
              <Image
                src={img}
                alt={`Miniatura ${idx + 1}`}
                fill
                unoptimized={img.includes('placehold.co')}
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
