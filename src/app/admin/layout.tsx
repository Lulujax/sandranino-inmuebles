'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { useToast } from '@/components/ui/Toast';

interface SessionPayload {
  email: string;
  loggedAt: number;
  keepSession: boolean;
}

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

  // Auto-logout por inactividad de 5 minutos (solo si keepSession es false)
  const handleInactivityLogout = useCallback(async () => {
    toast('Sesión cerrada por 5 minutos de inactividad', 'info');
    try {
      await createClient().auth.signOut();
    } catch {}
    storage.remove(STORAGE_KEYS.SESSION);
    storage.sessionRemove(STORAGE_KEYS.SESSION);
    router.replace('/login');
  }, [router, toast]);

  useEffect(() => {
    let cleanupInactivity: (() => void) | undefined;

    const verifySession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        storage.remove(STORAGE_KEYS.SESSION);
        storage.sessionRemove(STORAGE_KEYS.SESSION);
        router.replace('/login');
        return;
      }

      const persistentSession = storage.get<SessionPayload | null>(
        STORAGE_KEYS.SESSION,
        null
      );

      // Si existe en localStorage y keepSession es true, permitir acceso sin auto-logout
      if (persistentSession && persistentSession.keepSession) {
        setIsAuthorized(true);
        return;
      }

      // Si no marcó mantener sesión, permitir acceso + auto-logout de 5 minutos por inactividad
      setIsAuthorized(true);

      let timeoutId: ReturnType<typeof setTimeout>;

      const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleInactivityLogout, 5 * 60 * 1000);
      };

      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      events.forEach((evt) => window.addEventListener(evt, resetTimer));

      resetTimer();

      cleanupInactivity = () => {
        clearTimeout(timeoutId);
        events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      };
    };

    verifySession();

    return () => {
      if (cleanupInactivity) cleanupInactivity();
    };
  }, [handleInactivityLogout, router]);

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
    </div>
  );
}
