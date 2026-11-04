'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { ZipExportFloatingProgress } from '@/components/admin/ZipExportFloatingProgress';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Título según la sección actual
  const getSectionTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/publicar')) return 'Publicar Inmueble';
    if (pathname.startsWith('/admin/inmuebles')) return 'Mis Inmuebles';
    if (pathname.startsWith('/admin/perfil')) return 'Mi Perfil';
    if (pathname.startsWith('/admin/herramientas')) return 'Herramientas y Reportes';
    return 'Panel de Administración';
  };

  useEffect(() => {
    const verifySession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        storage.remove(STORAGE_KEYS.SESSION);
        storage.sessionRemove(STORAGE_KEYS.SESSION);
        router.replace('/login');
        return;
      }

      setIsAuthorized(true);
    };

    verifySession();
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] flex flex-col font-body selection:bg-terracotta/20 selection:text-text-heading">
      {/* Sidebar fijo ocultable en móvil y desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        desktopOpen={desktopSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleDesktop={() => setDesktopSidebarOpen((prev) => !prev)}
      />

      {/* Contenido derecho que aprovecha el 100% cuando se oculta el sidebar */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-out ${
          desktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <Topbar
          title={getSectionTitle()}
          sidebarDesktopOpen={desktopSidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleDesktopSidebar={() => setDesktopSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>

      {/* Widget flotante persistente para descargas de ZIP */}
      <ZipExportFloatingProgress />
    </div>
  );
}
