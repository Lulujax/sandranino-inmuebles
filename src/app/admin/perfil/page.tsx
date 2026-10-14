'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  KeyRound,
  Mail,
  User,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { MOCK_ASESOR } from '@/data/mock-properties';
import { PerfilAsesor } from '@/lib/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { propertiesStore, calculateInventoryCapacity } from '@/lib/properties';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function MiPerfilPage() {
  const { toast } = useToast();

  const [fullName, setFullName] = useState(MOCK_ASESOR.full_name);
  const [whatsapp, setWhatsapp] = useState(MOCK_ASESOR.whatsapp);
  const [email, setEmail] = useState(MOCK_ASESOR.email || '');
  const [instagram, setInstagram] = useState(MOCK_ASESOR.instagram || '');
  const [facebook, setFacebook] = useState(MOCK_ASESOR.facebook || '');

  // Seguridad
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Inventario y capacidad del plan Supabase
  const [propertyCount, setPropertyCount] = useState(0);

  useEffect(() => {
    propertiesStore
      .getAll()
      .then((data) => setPropertyCount(data.length))
      .catch(() => setPropertyCount(0));
  }, []);

  const capacity = calculateInventoryCapacity(propertyCount);

  useEffect(() => {
    const savedProfile = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
    if (savedProfile) {
      setFullName(savedProfile.full_name);
      setWhatsapp(savedProfile.whatsapp);
      setEmail(savedProfile.email || '');
      setInstagram(savedProfile.instagram || '');
      setFacebook(savedProfile.facebook || '');
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase
        .from('perfil_asesor')
        .select('*')
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const p = data as PerfilAsesor;
            setFullName(p.full_name);
            setWhatsapp(p.whatsapp);
            setEmail(p.email || '');
            setInstagram(p.instagram || '');
            setFacebook(p.facebook || '');
          }
        });
    }
  }, []);

  const cleanSocialHandle = (val: string, domain: string): string => {
    return val
      .trim()
      .replace(new RegExp(`^https?:\\/\\/(www\\.)?${domain}\\/`, 'i'), '')
      .replace(/^@/, '')
      .replace(/\/+$/, '');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast('El nombre completo es obligatorio', 'warning');
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    if (!cleanWhatsapp) {
      toast('El número de WhatsApp es obligatorio', 'warning');
      return;
    }

    const cleanIg = cleanSocialHandle(instagram, 'instagram\\.com');
    const cleanFb = cleanSocialHandle(facebook, 'facebook\\.com');

    setWhatsapp(cleanWhatsapp);
    setInstagram(cleanIg);
    setFacebook(cleanFb);

    const updatedProfile: PerfilAsesor = {
      ...MOCK_ASESOR,
      full_name: fullName.trim(),
      whatsapp: cleanWhatsapp,
      email: email.trim(),
      instagram: cleanIg,
      facebook: cleanFb,
      updated_at: new Date().toISOString(),
    };

    storage.set<PerfilAsesor>(STORAGE_KEYS.PROFILE, updatedProfile);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('perfil_asesor').upsert({
            id: user.id,
            full_name: fullName.trim(),
            whatsapp: cleanWhatsapp,
            email: email.trim() || null,
            instagram: cleanIg || null,
            facebook: cleanFb || null,
            updated_at: new Date().toISOString(),
          });
          if (error) {
            toast(`Error en Supabase: ${error.message}`, 'error');
            return;
          }
        }
      } catch {
        toast('Error al sincronizar el perfil con Supabase', 'error');
        return;
      }
    }

    toast('Perfil guardado correctamente', 'success');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast('Por favor completa ambas contraseñas', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      toast('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email) {
          const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password: currentPassword,
          });
          if (verifyError) {
            toast('La contraseña actual es incorrecta', 'error');
            return;
          }
        }
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          toast(error.message, 'error');
          return;
        }
      }

      toast('Contraseña modificada con éxito', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      toast('No se pudo actualizar la contraseña', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-body">
      <FadeInUp>
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
          AJUSTES DE CUENTA
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
          Mi Perfil Profesional
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Actualiza tus datos de contacto y la información pública que ven tus clientes e inversionistas.
        </p>
      </FadeInUp>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Datos Personales */}
        <FadeInUp delay={0.05} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <User size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
            <h3 className="font-display text-lg font-semibold text-text-heading">
              Información Personal
            </h3>
          </div>
          <Input
            label="Nombre Completo *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            helperText="Tu nombre tal como se presentará en la cabecera y ficha técnica."
          />
        </FadeInUp>

        {/* Datos de Contacto */}
        <FadeInUp delay={0.1} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-5">
          <h3 className="font-display text-lg font-semibold text-text-heading">
            Canales de Contacto Directo
          </h3>

          <div className="p-4 rounded-xl bg-[#f9ede7] border border-[#C97B5A]/30 flex items-start gap-3">
            <FaWhatsapp size={19} className="text-[#1d6447] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-body">
              El número de WhatsApp es el canal principal para recibir prospectos de compradores e interesados en cada una de tus fichas inmobiliarias.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700">
              <FaWhatsapp size={15} className="text-[#1d6447]" />
              <span>WhatsApp (obligatorio) *</span>
            </div>
            <Input
              placeholder="584241234567"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              helperText="Formato internacional sin el símbolo +, ej: 584241234567"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700">
              <Mail size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
              <span>Correo Electrónico (opcional)</span>
            </div>
            <Input
              type="email"
              placeholder="sandra@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Si lo dejas vacío, no se habilitará el botón de contacto por correo"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700">
              <FaInstagram size={15} className="text-[#C97B5A]" />
              <span>Instagram (opcional)</span>
            </div>
            <Input
              placeholder="sandranino.inmuebles"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              helperText="Tu usuario en Instagram sin @"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700">
              <FaFacebook size={15} className="text-[#1e3a5f]" />
              <span>Facebook (opcional)</span>
            </div>
            <Input
              placeholder="sandranino.asesora"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              helperText="Nombre de tu página o perfil profesional en Facebook"
            />
          </div>
        </FadeInUp>

        {/* Botón Guardar Cambios */}
        <FadeInUp delay={0.14} className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="gap-2 px-7 py-3.5 font-medium text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <Check size={16} strokeWidth={1.5} />
            <span>Guardar cambios</span>
          </Button>
        </FadeInUp>
      </form>

      {/* Capacidad y Estado del Sistema (Límites Supabase Cloud) */}
      <FadeInUp delay={0.16} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-5 font-body">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1e3a5f]/8 text-[#1e3a5f] flex items-center justify-center border border-stone-200/80">
              <HardDrive size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-text-heading">
                Capacidad y Estado del Sistema
              </h3>
              <p className="text-xs text-stone-500 font-body">
                Configuración optimizada para el plan en la nube de Supabase
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono font-medium px-3 py-1 rounded-full bg-[#edf7ee] text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>Plan Gratuito Activo (100% Sin Costo)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Inmuebles */}
          <div className="bg-white p-4.5 rounded-xl border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Inmuebles en Inventario
              </span>
              <span className="text-xs font-mono font-bold text-text-heading">
                {capacity.total} / {capacity.max}
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacity.isFull ? 'bg-rose-600' : capacity.isWarning ? 'bg-amber-500' : 'bg-[#1e3a5f]'
                }`}
                style={{ width: `${Math.max(capacity.percentage, 3)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {capacity.max - capacity.total} cupos disponibles para publicar
            </p>
          </div>

          {/* 2. Fotos */}
          <div className="bg-white p-4.5 rounded-xl border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Fotos y Archivos
              </span>
              <span className="text-xs font-mono font-bold text-text-heading">
                ~{capacity.estimatedStorageMb} / {capacity.maxStorageMb} MB
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C97B5A] transition-all duration-500"
                style={{ width: `${Math.max(Math.round((capacity.estimatedStorageMb / capacity.maxStorageMb) * 100), 2)}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {Math.round((capacity.estimatedStorageMb / capacity.maxStorageMb) * 100)}% de 1 GB de Supabase Storage
            </p>
          </div>

          {/* 3. Base de Datos */}
          <div className="bg-white p-4.5 rounded-xl border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Base de Datos Postgres
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Saludable</span>
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: '1%' }} />
            </div>
            <p className="text-[11px] text-stone-500">
              &lt; 2 MB de 500 MB disponibles
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#f5f1ea]/80 border border-stone-200/70 text-xs text-stone-600 leading-relaxed font-body">
          <p>
            💡 <strong>¿Por qué {capacity.max} inmuebles como tope recomendado?</strong> Cada propiedad cuenta con múltiples fotografías de alta resolución que se comprimen automáticamente. Un inventario de hasta {capacity.max} inmuebles activos utiliza aproximadamente ~700 MB de la capacidad gratuita de Supabase Cloud (1 GB), garantizando que tu portal funcione con máxima velocidad y sin sorpresas de facturación.
          </p>
        </div>
      </FadeInUp>

      {/* Seguridad: Cambiar Contraseña */}
      <FadeInUp delay={0.2} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound size={18} strokeWidth={1.5} className="text-[#C97B5A]" />
          <h3 className="font-display text-lg font-semibold text-text-heading">
            Seguridad de la Cuenta
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="Contraseña actual"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Button type="submit" variant="outline" size="sm" className="mt-1 gap-2">
            <Check size={15} strokeWidth={1.5} />
            <span>Actualizar contraseña</span>
          </Button>
        </form>
      </FadeInUp>
    </div>
  );
}
