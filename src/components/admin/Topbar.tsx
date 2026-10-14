'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Eye } from 'lucide-react';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { PerfilAsesor } from '@/lib/types';

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
  const [profilePhoto, setProfilePhoto] = useState<string>('/images/sandra-nino-hero.png');
  const [advisorName, setAdvisorName] = useState<string>('Sandra Niño');

  useEffect(() => {
    const syncProfile = () => {
      const saved = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
      if (saved) {
        if (saved.profile_photo_url) {
          setProfilePhoto(saved.profile_photo_url);
        }
        if (saved.full_name) {
          setAdvisorName(saved.full_name);
        }
      }
    };

    syncProfile();
    window.addEventListener('sn_profile_updated', syncProfile);
    window.addEventListener('storage', syncProfile);

    return () => {
      window.removeEventListener('sn_profile_updated', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

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

        <h1 className="text-sm sm:text-base font-semibold text-text-heading font-display truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
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

        <Link
          href="/admin/perfil"
          className="w-9.5 h-9.5 rounded-full overflow-hidden border border-stone-300 shadow-card shrink-0 select-none bg-[#1e3a5f] hover:ring-2 hover:ring-[#C97B5A] transition-all"
          title={`${advisorName} - Ir a Mi Perfil`}
        >
          <img
            src={profilePhoto}
            alt={advisorName}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
};
