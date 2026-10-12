'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ExternalLink } from 'lucide-react';
import { MOCK_ASESOR } from '@/data/mock-properties';

interface TopbarProps {
  title: string;
  onOpenSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 bg-cream-50/85 backdrop-blur-md border-b border-stone-200/70 shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Botón hamburguesa para móvil */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-stone-600 hover:bg-stone-200/60 lg:hidden transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
        </button>
        {/* Título de la sección actual */}
        <h1 className="font-serif text-xl sm:text-2xl text-text-heading font-normal tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-5">
        {/* Enlace a la página pública con hover suave */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-brand hover:text-brand-darker transition-all py-1.5 px-3 rounded-lg hover:bg-white/80 border border-transparent hover:border-stone-200/60 shadow-2xs"
        >
          <span>Ver catálogo público</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>

        {/* Avatar circular con borde fino */}
        <div className="relative w-9.5 h-9.5 rounded-full overflow-hidden border-2 border-white shadow-card bg-cream-200">
          <Image
            src={MOCK_ASESOR.profile_photo_url || 'https://placehold.co/400x400/1e3a5f/ffffff?text=SN'}
            alt={MOCK_ASESOR.full_name}
            fill
            sizes="38px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
};
