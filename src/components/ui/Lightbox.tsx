'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Lock } from 'lucide-react';

interface LightboxProps {
  urls: string[];
  initialIndex: number;
  onClose: () => void;
  title?: string;
  note?: string;
}

/**
 * Galería a pantalla completa (lightbox) para revisar fotos ampliadas:
 * flechas ←/→ en teclado, botones laterales y swipe en móvil; Escape cierra.
 */
export const Lightbox: React.FC<LightboxProps> = ({
  urls,
  initialIndex,
  onClose,
  title,
  note,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (urls.length === 0) {
      onClose();
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(urls.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, urls.length]);

  if (typeof document === 'undefined' || urls.length === 0) return null;
  const safeIndex = Math.min(Math.max(index, 0), urls.length - 1);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(urls.length - 1, i + 1));

  // Portal al <body>: el zoom vive a nivel del documento, inmune a transform
  // o animaciones de la página que robarían el posicionamiento fixed.
  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in-up font-body select-none"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartXRef.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const startX = touchStartXRef.current;
        touchStartXRef.current = null;
        if (startX === null) return;
        const deltaX = (e.changedTouches[0]?.clientX ?? startX) - startX;
        if (Math.abs(deltaX) < 50) return;
        if (deltaX < 0) goNext();
        else goPrev();
      }}
    >
      {/* Cabecera */}
      <div className="p-4 flex items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          {title && (
            <p className="font-display text-sm sm:text-base font-semibold truncate">{title}</p>
          )}
          <p className="text-[11px] text-white/60 mt-0.5 font-mono">
            Foto {safeIndex + 1} de {urls.length}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {note && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-300/10 border border-amber-300/30 px-2.5 py-1 rounded-full">
              <Lock size={11} />
              <span>{note}</span>
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar (Esc)"
            aria-label="Cerrar galería"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Visor */}
      <div
        className="flex-1 relative flex items-center justify-center p-3 pb-2 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {urls.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            disabled={safeIndex === 0}
            className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-default"
            title="Anterior (←)"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        )}

        {urls[safeIndex] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={urls[safeIndex]}
            alt={`Foto ${index + 1}`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            draggable={false}
          />
        ) : (
          <p className="text-white/60 text-sm">Foto no disponible</p>
        )}

        {urls.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            disabled={safeIndex === urls.length - 1}
            className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-25 disabled:cursor-default"
            title="Siguiente (→)"
            aria-label="Foto siguiente"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Pie */}
      <div className="p-3 pb-5 text-center">
        {note && <p className="text-[11px] text-amber-300/90 sm:hidden">{note}</p>}
        {urls.length > 1 && (
          <p className="text-[11px] text-white/40 mt-1">
            Desliza o usa las flechas para ver todas
          </p>
        )}
      </div>
    </div>,
    document.body
  );
};
