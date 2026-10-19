'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { propertiesStore } from '@/lib/properties';
import { WizardFormData } from '@/lib/types';
import { WizardStep } from '@/components/admin/WizardStep';
import { FadeInUp } from '@/components/ui/FadeInUp';

import { parseContactInfo } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

function PublicarContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const pasoParam = Number.parseInt(searchParams.get('paso') || '1', 10) || 1;
  const initialStep = Math.min(Math.max(pasoParam, 1), 8);
  const [initialPropertyData, setInitialPropertyData] = useState<
    Partial<WizardFormData> | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(Boolean(editId));

  useEffect(() => {
    if (!editId) {
      setInitialPropertyData(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    propertiesStore
      .getById(editId)
      .then((existing) => {
        if (!existing) {
          setInitialPropertyData(undefined);
          setIsLoading(false);
          return;
        }

        const parsedContact = parseContactInfo(existing);

        setInitialPropertyData({
          operation: existing.operation,
          type: existing.type,
          state: existing.state,
          city: existing.city,
          sector: existing.sector || '',
          address: existing.address || '',
          show_exact_location: existing.show_exact_location || false,
          bedrooms: existing.bedrooms,
          bathrooms: existing.bathrooms,
          parking: existing.parking,
          built_area: existing.built_area,
          land_area: existing.land_area,
          year: existing.year,
          total_area: existing.total_area,
          height: existing.height,
          offices: existing.offices,
          images: existing.images,
          title: existing.title,
          description: existing.description || '',
          price: existing.price,
          internal_code: existing.internal_code || '',
          contact_type: existing.contact_type || parsedContact.type,
          owner_name: parsedContact.name || existing.owner_name || '',
          owner_phone: parsedContact.phone || existing.owner_phone || '',
          notes: existing.notes || '',
        });
        setIsLoading(false);
      })
      .catch(() => {
        setInitialPropertyData(undefined);
        setIsLoading(false);
      });
  }, [editId]);

  if (editId && isLoading) {
    return (
      <div className="space-y-6 font-body">
        <FadeInUp>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
            EDICIÓN DE FICHA
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
            Editar Inmueble
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Cargando los datos del inmueble para edición...
          </p>
        </FadeInUp>
        <div className="bg-[#faf9f6] p-12 rounded-2xl border border-stone-200/80 text-center font-body shadow-card">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-heading">Cargando expediente del inmueble...</p>
          <p className="text-xs text-stone-500 mt-1">Un momento por favor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      <FadeInUp>
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
          {editId ? 'EDICIÓN DE FICHA' : 'NUEVA PUBLICACIÓN'}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-heading tracking-tight">
          {editId ? 'Editar Inmueble' : 'Publicar Nuevo Inmueble'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          {editId
            ? 'Modifica los datos del inmueble en el asistente de 8 pasos.'
            : 'Completa los 8 sencillos pasos para incorporar una nueva propiedad a tu inventario.'}
        </p>
      </FadeInUp>

      <WizardStep initialData={initialPropertyData} editId={editId} initialStep={initialStep} />
    </div>
  );
}

export default function PublicarPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm text-stone-500 font-body">
          Cargando asistente de publicación...
        </div>
      }
    >
      <PublicarContent />
    </Suspense>
  );
}
