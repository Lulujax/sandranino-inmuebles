'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Eye } from 'lucide-react';

interface TopbarProps {
  title: string;
  sidebarDesktopOpen?: boolean;
  onOpenSidebar: () => void;
  onToggleDesktopSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  sidebarDesktopOpen = true,
  onOpenSidebar,
  onToggleDesktopSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs font-body">
      <div className="flex items-center gap-3.5">
        {/* Botón 3 líneas (hamburguesa) para móvil */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-stone-700 hover:text-brand hover:bg-stone-200/60 border border-stone-200/80 bg-white shadow-2xs lg:hidden transition-all cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        {/* Botón 3 líneas para mostrar/ocultar sidebar en desktop */}
        {onToggleDesktopSidebar && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:inline-flex items-center justify-center p-2 rounded-xl text-stone-700 hover:text-brand hover:bg-stone-200/60 border border-stone-200/80 bg-white shadow-2xs transition-all cursor-pointer"
            title={sidebarDesktopOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
            aria-label={sidebarDesktopOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
        )}

        {/* Título de la sección actual en Fraunces */}
        <h1 className="font-display text-xl sm:text-2xl text-text-heading font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Botón secundario con borde fino terracota y hover que rellena con terracota suave */}
        <Link
          href="/inventario"
          target="_blank"
          className="inline-flex items-center gap-2 text-xs font-body font-medium uppercase tracking-wider text-text-heading hover:text-brand transition-all py-1.5 px-3.5 rounded-lg bg-white hover:bg-[#f5f1ea] border border-stone-300 hover:border-brand/40 shadow-2xs"
        >
          <Eye size={15} strokeWidth={1.5} className="text-brand" />
          <span className="hidden sm:inline">Ver inventario público</span>
        </Link>

        <div
          className="w-9.5 h-9.5 rounded-full bg-[#1e3a5f] flex items-center justify-center border border-white/20 shadow-card shrink-0 select-none"
          title="Sandra Niño"
        >
          <span className="font-body text-[12px] font-medium tracking-[0.16em] text-white">
            SN
          </span>
        </div>
      </div>
    </header>
  );
};
