'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Eye } from 'lucide-react';

interface TopbarProps {
  title: string;
  onOpenSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs font-body">
      <div className="flex items-center gap-3.5">
        {/* Botón hamburguesa para móvil */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-stone-600 hover:bg-stone-200/60 lg:hidden transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        {/* Título de la sección actual en Fraunces */}
        <h1 className="font-display text-xl sm:text-2xl text-text-heading font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Botón secundario con borde fino terracota y hover que rellena con terracota suave */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-xs font-body font-medium uppercase tracking-wider text-text-heading hover:text-brand-darker transition-all py-1.5 px-3.5 rounded-lg bg-[#faf9f6] hover:bg-[#C97B5A]/15 border border-[#C97B5A]/60 hover:border-[#C97B5A] shadow-2xs"
        >
          <Eye size={15} strokeWidth={1.5} className="text-[#C97B5A]" />
          <span className="hidden sm:inline">Ver catálogo público</span>
        </Link>

        {/* // TODO: Reemplazar cuando lleguen las fotos reales */}
        <div
          className="w-9.5 h-9.5 rounded-full bg-[#1e3a5f] flex items-center justify-center border border-white/20 shadow-card shrink-0 select-none"
          title="Sandra Nino"
        >
          <span className="font-body text-[12px] font-medium tracking-[0.16em] text-white">
            SN
          </span>
        </div>
      </div>
    </header>
  );
};
