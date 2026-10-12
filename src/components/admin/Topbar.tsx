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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa para móvil */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Título de la sección actual */}
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Enlace a la página pública */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-brand hover:text-brand-light transition-colors py-1 px-2 rounded-lg hover:bg-gray-50"
        >
          <span>Ver página pública</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Avatar circular */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
          <Image
            src={MOCK_ASESOR.profile_photo_url || 'https://placehold.co/400x400/1e3a5f/ffffff?text=SN'}
            alt={MOCK_ASESOR.full_name}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
};

