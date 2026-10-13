'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  KeyRound,
  Mail,
  User,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { MOCK_ASESOR } from '@/data/mock-properties';
import { PerfilAsesor } from '@/lib/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
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

  useEffect(() => {
    const savedProfile = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
    if (savedProfile) {
      setFullName(savedProfile.full_name);
      setWhatsapp(savedProfile.whatsapp);
      setEmail(savedProfile.email || '');
      setInstagram(savedProfile.instagram || '');
      setFacebook(savedProfile.facebook || '');
    }
  }, []);

  const cleanSocialHandle = (val: string, domain: string): string => {
    return val
      .trim()
      .replace(new RegExp(`^https?:\\/\\/(www\\.)?${domain}\\/`, 'i'), '')
      .replace(/^@/, '')
      .replace(/\/+$/, '');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
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

    storage.set<PerfilAsesor>(STORAGE_KEYS.PROFILE, {
      ...MOCK_ASESOR,
      full_name: fullName.trim(),
      whatsapp: cleanWhatsapp,
      email: email.trim(),
      instagram: cleanIg,
      facebook: cleanFb,
      updated_at: new Date().toISOString(),
    });

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

      {/* Seguridad: Cambiar Contraseña */}
      <FadeInUp delay={0.18} className="bg-[#faf9f6] p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
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
