'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, AlertTriangle, Save, KeyRound, Sparkles } from 'lucide-react';
import { MOCK_ASESOR } from '@/data/mock-properties';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function MiPerfilPage() {
  const { toast } = useToast();

  const [fullName, setFullName] = useState(MOCK_ASESOR.full_name);
  const [whatsapp, setWhatsapp] = useState(MOCK_ASESOR.whatsapp);
  const [email, setEmail] = useState(MOCK_ASESOR.email || '');
  const [instagram, setInstagram] = useState(MOCK_ASESOR.instagram || '');
  const [facebook, setFacebook] = useState(MOCK_ASESOR.facebook || '');
  const [photoUrl, setPhotoUrl] = useState(
    MOCK_ASESOR.profile_photo_url ||
      'https://placehold.co/400x400/1e3a5f/ffffff?text=Sandra+Nino'
  );

  // Seguridad
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhotoUrl(url);
      toast('Foto de perfil actualizada con éxito', 'success');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast('⚠️ El nombre completo es obligatorio', 'warning');
      return;
    }

    if (!whatsapp.trim()) {
      toast('⚠️ El número de WhatsApp es obligatorio', 'warning');
      return;
    }

    toast('Perfil guardado correctamente', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast('⚠️ Por favor completa ambas contraseñas', 'warning');
      return;
    }

    if (!newPassword.length || newPassword.length < 6) {
      toast('⚠️ La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    toast('Contraseña modificada con éxito', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans animate-fade-in">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-terracotta block mb-1">
          Ajustes de Cuenta
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-heading tracking-tight">Mi Perfil Profesional</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Actualiza tus datos de contacto y la información pública que ven tus clientes e inversionistas.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card flex flex-col sm:flex-row items-center gap-7">
          <div className="relative group">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-stone-200/80 shadow-luxury bg-cream-200 shrink-0">
              <Image
                src={photoUrl}
                alt={fullName}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
          
          <div className="text-center sm:text-left space-y-2 flex-1">
            <h3 className="font-serif text-lg text-text-heading">Fotografía de Presentación</h3>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              Esta imagen se exhibe de forma prominente en la portada de tu catálogo público y en la cabecera del sitio.
            </p>
            <div className="pt-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-stone-700 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all border border-stone-200/70 shadow-2xs">
                <Camera className="w-4 h-4 text-terracotta stroke-[1.75]" />
                <span>Cambiar fotografía</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
          <h3 className="font-serif text-lg text-text-heading">Información Personal</h3>
          <Input
            label="Nombre Completo *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            helperText="Tu nombre tal como se presentará en la cabecera y ficha técnica."
          />
        </div>

        {/* Datos de Contacto */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-5">
          <h3 className="font-serif text-lg text-text-heading">Canales de Contacto Directo</h3>

          {/* Aviso estilizado de WhatsApp */}
          <div className="p-4 rounded-xl bg-terracotta/10 border border-terracotta/25 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5 stroke-[1.75]" />
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
              El número de WhatsApp es el canal principal para recibir prospectos de compradores e interesados en cada una de tus fichas inmobiliarias.
            </p>
          </div>

          <Input
            label="WhatsApp (obligatorio) *"
            placeholder="584241234567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            helperText="Formato internacional sin el símbolo +, ej: 584241234567"
          />

          <Input
            label="Correo Electrónico (opcional)"
            type="email"
            placeholder="sandra@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Si lo dejas vacío, no se habilitará el botón de contacto por correo"
          />

          <Input
            label="Instagram (opcional)"
            placeholder="sandranino.inmuebles"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            helperText="Tu usuario en Instagram sin @"
          />

          <Input
            label="Facebook (opcional)"
            placeholder="sandranino.asesora"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            helperText="Nombre de tu página o perfil profesional en Facebook"
          />
        </div>

        {/* Botón Guardar Cambios con hover elevado */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="px-7 py-3.5 font-semibold text-xs uppercase tracking-wider shadow-sm hover:shadow-luxury hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 mr-2 stroke-[2]" />
            <span>Guardar cambios</span>
          </Button>
        </div>
      </form>

      {/* Seguridad: Cambiar Contraseña */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-5 h-5 text-terracotta stroke-[1.75]" />
          <h3 className="font-serif text-lg text-text-heading">Seguridad de la Cuenta</h3>
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

          <Button type="submit" variant="outline" size="sm" className="mt-1">
            Actualizar contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}
