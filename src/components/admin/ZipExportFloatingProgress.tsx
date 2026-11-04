'use client';

import React from 'react';
import { Loader2, X, Archive, CheckCircle2 } from 'lucide-react';
import { useZipExport, zipExportManager } from '@/lib/zip-export-manager';

export function ZipExportFloatingProgress() {
  const { isExporting, progress } = useZipExport();

  if (!isExporting || !progress) {
    return null;
  }

  const current = progress.current || 0;
  const total = progress.total || 1;
  const percent = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('¿Deseas cancelar la descarga del archivo ZIP?')) {
      zipExportManager.cancelExport();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 w-[90vw] max-w-sm sm:max-w-md bg-stone-900/95 text-stone-100 backdrop-blur-md border border-stone-700/70 shadow-2xl rounded-2xl p-4 sm:p-5 font-body transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-terracotta/20 border border-terracotta/40 flex items-center justify-center shrink-0 text-terracotta">
            <Loader2 size={16} className="animate-spin text-[#C97B5A]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C97B5A] block">
              Descarga en Progreso
            </span>
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
              Generando Paquete ZIP
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          title="Cancelar exportación"
          className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800/80 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      {/* Título de inmueble actual */}
      <p className="text-[11px] text-stone-300 truncate mb-2.5 font-medium">
        {progress.title || 'Preparando inmuebles...'}
      </p>

      {/* Barra de progreso */}
      <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden border border-stone-700/50 mb-2">
        <div
          className="h-full bg-gradient-to-r from-[#C97B5A] to-amber-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Métricas y botón cancelar secundario */}
      <div className="flex items-center justify-between text-[11px] text-stone-400">
        <span>
          Inmueble <strong className="text-white">{current}</strong> de{' '}
          <strong className="text-white">{total}</strong> ({percent}%)
        </span>

        <button
          type="button"
          onClick={handleCancel}
          className="text-stone-400 hover:text-rose-300 underline underline-offset-2 text-[10px] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
