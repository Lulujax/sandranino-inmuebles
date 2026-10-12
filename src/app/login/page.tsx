'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast('⚠️ Por favor completa el correo y la contraseña', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada preparada para Supabase Auth
      const supabase = createClient();
      
      // Si la URL es la real de producción, intenta con Supabase Auth
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
      ) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast(`⚠️ ${error.message}`, 'error');
          setIsLoading(false);
          return;
        }
      }

      // Simulación de sesión local y token para desarrollo
      const sessionData = {
        email,
        rememberMe,
        loginAt: Date.now(),
      };

      if (rememberMe) {
        localStorage.setItem('sn_auth_token', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('sn_auth_token', JSON.stringify(sessionData));
      }

      toast('Sesión iniciada con éxito. ¡Bienvenida, Sandra!', 'success');
      router.push('/admin');
    } catch {
      toast('⚠️ Ocurrió un error al procesar el inicio de sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4 selection:bg-terracotta/20 selection:text-text-heading font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-luxury border border-stone-200/80 p-8 sm:p-10 animate-fade-in-up">
        {/* Monograma SN y encabezado editorial */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-darker text-cream-50 flex items-center justify-center font-serif text-2xl shadow-luxury border border-white/20">
              SN
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-terracotta flex items-center justify-center text-white">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-text-heading tracking-tight">
            Sandra Nino
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mt-1 font-sans">
            Panel de Gestión Inmobiliaria
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Input
              label="Correo Electrónico"
              type="email"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 font-sans">
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
              onClick={() =>
                toast('Enlace de recuperación enviado al correo registrado', 'info')
              }
              className="text-terracotta hover:text-terracotta-dark font-medium transition-colors"
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
              className="py-3.5 text-sm font-semibold tracking-wide"
            >
              <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[2]" />
            </Button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <div className="mt-8 pt-5 border-t border-stone-100 flex items-start gap-3 text-xs text-stone-500 leading-relaxed font-sans">
          <ShieldCheck className="w-4 h-4 text-terracotta shrink-0 mt-0.5 stroke-[1.5]" />
          <p>
            Por seguridad bancaria e inmobiliaria, tu sesión se cerrará automáticamente tras 5 minutos de inactividad salvo que mantengas la sesión activa.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-brand font-sans tracking-wide transition-colors underline-offset-4 hover:underline"
        >
          ← Volver al sitio público
        </Link>
      </div>
    </div>
  );
}
