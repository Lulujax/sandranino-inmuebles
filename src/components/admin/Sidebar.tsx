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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar fijo */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header con nombre del cliente */}
        <div className="p-6 border-b border-brand-light/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center font-bold text-white shadow-inner">
              SN
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight text-white">Sandra Nino</h2>
              <p className="text-xs text-blue-200">Asesora Inmobiliaria</p>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de navegación */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-light text-white shadow-sm font-semibold'
                    : 'text-blue-100 hover:bg-brand-light/50 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-blue-300')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer con Cerrar sesión */}
        <div className="p-4 border-t border-brand-light/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/10 hover:text-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-300" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

