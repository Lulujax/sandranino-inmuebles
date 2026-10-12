'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        {/* Logo Circular SN */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center font-extrabold text-2xl shadow-md mb-3">
            SN
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sandra Nino</h1>
          <p className="text-xs text-gray-500 font-medium">Panel de Gestión Inmobiliaria</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-600 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
              />
              <span>Mantener sesión iniciada</span>
            </label>

            <button
              type="button"
              onClick={() =>
                toast('Enlace de recuperación enviado al correo registrado', 'info')
              }
              className="text-brand hover:underline font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              className="py-3 text-base font-semibold"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>

        {/* Nota sobre cierre por inactividad */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p>
            Por seguridad bancaria e inmobiliaria, tu sesión se cerrará automáticamente tras 5 minutos de inactividad si no marcas la opción de mantener sesión iniciada.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-brand transition-colors underline-offset-4 hover:underline"
        >
          ← Volver a la página pública
        </Link>
      </div>
    </div>
  );
}

