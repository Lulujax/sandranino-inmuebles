'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Comprobar si hay una sesión activa de recuperación de contraseña
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (password.length < 6) {
      toast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      toast('Las contraseñas no coinciden', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast(error.message || 'Error al actualizar la contraseña', 'error');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast('¡Contraseña restablecida con éxito!', 'success');

      // Redirigir al panel de administración tras 2 segundos
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 2000);
    } catch {
      toast('Ocurrió un error inesperado al actualizar la contraseña', 'error');
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
            Restablecer Contraseña
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] mt-1 font-body">
            SANDRA NIÑO • GESTIÓN INMOBILIARIA
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-heading mb-1">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-sm text-stone-600">
                Tu clave ha sido actualizada con éxito. Serás redirigida al panel de administración en unos instantes...
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-brand text-white font-medium text-sm hover:bg-brand-darker transition-colors"
            >
              Ir al Panel de Administración
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {hasSession === false && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800 leading-relaxed">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Asegúrate de haber ingresado mediante el enlace enviado a tu correo. Si expiró, solicita uno nuevo desde la pantalla de acceso.
                </p>
              </div>
            )}

            <div>
              <Input
                label="Nueva Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                className="py-3.5 text-sm font-medium tracking-wide gap-2"
              >
                <span>{isLoading ? 'Actualizando contraseña...' : 'Actualizar Contraseña'}</span>
                <ArrowRight size={16} strokeWidth={1.5} />
              </Button>
            </div>
          </form>
        )}

        {/* Nota de seguridad */}
        <div className="mt-8 pt-5 border-t border-stone-200/70 flex items-start gap-3 text-xs text-stone-600 leading-relaxed font-body">
          <KeyRound size={16} strokeWidth={1.5} className="text-[#C97B5A] shrink-0 mt-0.5" />
          <p>
            Elige una contraseña robusta de al menos 6 caracteres que combine letras y números para proteger tu inventario.
          </p>
        </div>
      </FadeInUp>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-brand font-body tracking-wide transition-colors underline-offset-4 hover:underline"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    </div>
  );
}

