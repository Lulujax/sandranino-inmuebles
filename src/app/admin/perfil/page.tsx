'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, AlertTriangle, Save, KeyRound } from 'lucide-react';
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
      toast('Foto de perfil actualizada', 'success');
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

    if (newPassword.length < 6) {
      toast('⚠️ La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    toast('Contraseña modificada con éxito', 'success');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
        <p className="text-sm text-gray-500">
          Actualiza tus datos de contacto y la información que ven tus clientes.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 shrink-0">
            <Image
              src={photoUrl}
              alt={fullName}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-base font-bold text-gray-900">Foto de Perfil</h3>
            <p className="text-xs text-gray-500 max-w-sm">
              Esta foto se muestra en la portada de tu sitio público y en la cabecera.
            </p>
            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <span>Cambiar foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">Datos Personales</h3>
          <Input
            label="Nombre Completo *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            helperText="Tu nombre como aparecerá en el catálogo público."
          />
        </div>

        {/* Datos de Contacto */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-gray-900">Datos de Contacto</h3>

          {/* Aviso amarillo de WhatsApp */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-800 leading-snug">
              ⚠️ El número de WhatsApp se usa en todos los botones de tu página pública.
            </p>
          </div>

          <Input
            label="WhatsApp (obligatorio) *"
            placeholder="584241234567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            helperText="Formato internacional sin el signo +, ej: 584241234567"
          />

          <Input
            label="Correo Electrónico (opcional)"
            type="email"
            placeholder="sandra@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Si lo dejas vacío, no aparecerá el botón de correo"
          />

          <Input
            label="Instagram (opcional)"
            placeholder="sandranino.inmuebles"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            helperText="Si lo dejas vacío, el botón no aparece"
          />

          <Input
            label="Facebook (opcional)"
            placeholder="sandranino.asesora"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            helperText="Si lo dejas vacío, el botón no aparece"
          />
        </div>

        {/* Botón Guardar Cambios */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="px-6 py-3 font-semibold">
            <Save className="w-4 h-4 mr-1.5" />
            Guardar cambios
          </Button>
        </div>
      </form>

      {/* Seguridad: Cambiar Contraseña */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-gray-900">Seguridad de la Cuenta</h3>
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

          <Button type="submit" variant="outline" size="sm">
            Cambiar contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}

