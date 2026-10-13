'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

interface SessionPayload {
  email: string;
  loggedAt: number;
  keepSession: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getSafeRedirect = (): string => {
    if (typeof window === 'undefined') return '/admin';
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect && redirect.startsWith('/admin') && !redirect.startsWith('//')) {
      return redirect;
    }
    return '/admin';
  };

  // Si ya tiene sesión activa en Supabase con keepSession en localStorage, redirigir al panel
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedSession = storage.get<SessionPayload | null>(STORAGE_KEYS.SESSION, null);
      if (savedSession && savedSession.keepSession) {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.replace('/admin');
        } else {
          storage.remove(STORAGE_KEYS.SESSION);
        }
      }
    };
    checkExistingSession();
  }, [router]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast('Ingresa tu correo electrónico primero para enviarte el enlace', 'warning');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/perfil`,
      });
      if (error) {
        toast(error.message, 'error');
        return;
      }
      toast('Enlace de recuperación enviado al correo registrado', 'info');
    } catch {
      toast('No se pudo enviar el correo de recuperación', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast('Por favor completa el correo y la contraseña', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast(error.message || 'Credenciales inválidas. Verifica tu correo y contraseña.', 'error');
        setIsLoading(false);
        return;
      }

      // Persistencia de preferencia de sesión (keepSession vs auto-logout 5 min)
      if (rememberMe) {
        storage.set(STORAGE_KEYS.SESSION, {
          email: email.trim(),
          loggedAt: Date.now(),
          keepSession: true,
        });
        storage.sessionRemove(STORAGE_KEYS.SESSION);
      } else {
        storage.remove(STORAGE_KEYS.SESSION);
        storage.sessionSet(STORAGE_KEYS.SESSION, {
          email: email.trim(),
          loggedAt: Date.now(),
          keepSession: false,
        });
      }

      toast('Sesión iniciada con éxito. ¡Bienvenida, Sandra!', 'success');
      router.push(getSafeRedirect());
      router.refresh();
    } catch {
      toast('Ocurrió un error al procesar el inicio de sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] flex flex-col justify-center items-center p-4 selection:bg-terracotta/20 selection:text-text-heading font-body">
      <FadeInUp className="w-full max-w-md bg-[#faf9f6] rounded-2xl shadow-luxury border border-stone-200/80 p-8 sm:p-10">
        {/* Monograma SN y encabezado editorial */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#152a45] text-white flex items-center justify-center font-display text-2xl font-semibold shadow-luxury border border-white/20 mb-3 select-none">
            SN
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
            Sandra Nino
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] mt-1 font-body">
            PANEL DE GESTIÓN INMOBILIARIA
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Input
              label="Correo Electrónico"
              type="email"
              autoComplete="email"
              placeholder="sandra@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 font-body">
            <label className="flex items-center gap-2 text-stone-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand rounded border-stone-300 focus:ring-brand/20 accent-brand cursor-pointer"
              />
              <span>Mantener sesión iniciada</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[#C97B5A] hover:text-terracotta-dark font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="py-3.5 text-sm font-medium tracking-wide gap-2"
            >
              <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </Button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <div className="mt-8 pt-5 border-t border-stone-200/70 flex items-start gap-3 text-xs text-stone-600 leading-relaxed font-body">
          <KeyRound size={16} strokeWidth={1.5} className="text-[#C97B5A] shrink-0 mt-0.5" />
          <p>
            Por seguridad inmobiliaria, tu sesión se cerrará automáticamente tras 5 minutos de inactividad salvo que mantengas la sesión activa.
          </p>
        </div>
      </FadeInUp>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-brand font-body tracking-wide transition-colors underline-offset-4 hover:underline"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Volver al sitio público</span>
        </Link>
      </div>
    </div>
  );
}
