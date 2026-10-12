'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Home,
  User,
  Wrench,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      label: 'Publicar Inmueble',
      icon: PlusCircle,
      href: '/admin/publicar',
    },
    {
      label: 'Mis Inmuebles',
      icon: Home,
      href: '/admin/inmuebles',
    },
    {
      label: 'Mi Perfil',
      icon: User,
      href: '/admin/perfil',
    },
    {
      label: 'Herramientas',
      icon: Wrench,
      href: '/admin/herramientas',
    },
  ];

  const handleLogout = () => {
    // Limpieza de sesión
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sn_auth_token');
      sessionStorage.removeItem('sn_auth_token');
    }
    router.push('/login');
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar fijo con degradado sutil de azul oscuro a #152a45 */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-brand to-brand-darker text-white flex flex-col transition-transform duration-300 ease-editorial lg:translate-x-0 border-r border-white/5',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header con nombre del cliente y monograma */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-serif font-bold text-white shadow-inner">
              SN
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold leading-tight text-white tracking-wide">
                Sandra Nino
              </h2>
              <p className="text-[11px] font-sans text-terracotta-light uppercase tracking-wider font-medium">
                Asesora Inmobiliaria
              </p>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Links de navegación con iconos de línea fina e indicador terracota */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-sans font-medium tracking-wide transition-all duration-200 group relative',
                  isActive
                    ? 'bg-white/10 text-white shadow-xs font-semibold border-l-4 border-terracotta pl-3'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white hover:translate-x-0.5'
                )}
              >
                <Icon
                  className={cn(
                    'w-4.5 h-4.5 stroke-[1.5] transition-colors',
                    isActive ? 'text-terracotta-light' : 'text-stone-400 group-hover:text-stone-200'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer con Cerrar sesión */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[1.5] text-rose-300" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
