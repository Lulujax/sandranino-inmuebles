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
import { motion, useReducedMotion } from 'framer-motion';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

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
    storage.remove(STORAGE_KEYS.SESSION);
    storage.sessionRemove(STORAGE_KEYS.SESSION);
    router.push('/login');
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar con entrada slide desde izquierda + fade (300ms) */}
      <motion.aside
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1e3a5f] to-[#152a45] text-white flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 border-r border-white/5 font-body',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header con iniciales SN y nombre */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-display font-semibold text-white">
              SN
            </div>
            <div>
              <h2 className="font-display text-base font-semibold leading-tight text-white">
                Sandra Nino
              </h2>
              <p className="text-[11px] font-body text-[#C97B5A] uppercase tracking-wider font-medium">
                Asesora Inmobiliaria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white lg:hidden cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Links de navegación: tamaño 18, strokeWidth 1.5, borde izquierdo terracota 2px en activo */}
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
                  'flex items-center gap-3 px-3.5 py-3 rounded-r-xl text-xs font-body font-medium tracking-wide transition-all duration-200 group',
                  isActive
                    ? 'bg-white/10 text-white border-l-2 border-[#C97B5A] pl-3.5'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors shrink-0',
                    isActive ? 'text-[#C97B5A]' : 'text-stone-400 group-hover:text-stone-200'
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
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-body font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-100 transition-colors cursor-pointer"
          >
            <LogOut size={18} strokeWidth={1.5} className="text-rose-300 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
