'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { useToast } from '@/components/ui/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Título según la sección actual
  const getSectionTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/publicar')) return 'Publicar Inmueble';
    if (pathname.startsWith('/admin/inmuebles')) return 'Mis Inmuebles';
    if (pathname.startsWith('/admin/perfil')) return 'Mi Perfil';
    if (pathname.startsWith('/admin/herramientas')) return 'Herramientas y Reportes';
    return 'Panel de Administración';
  };

  // Lógica de inactividad de 5 minutos si no se marcó "mantener sesión"
  const handleInactivityLogout = useCallback(() => {
    toast('Sesión cerrada por 5 minutos de inactividad', 'info');
    localStorage.removeItem('sn_auth_token');
    sessionStorage.removeItem('sn_auth_token');
    router.push('/login');
  }, [router, toast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verificar si está en sessionStorage (sin "mantener sesión")
    const isSessionTemporary = sessionStorage.getItem('sn_auth_token') !== null;

    if (!isSessionTemporary) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 5 minutos = 300,000 ms
      timeoutId = setTimeout(handleInactivityLogout, 5 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [handleInactivityLogout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] flex flex-col font-body selection:bg-terracotta/20 selection:text-text-heading">
      {/* Sidebar fijo */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido derecho */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar
          title={getSectionTitle()}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
