'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { propertiesStore } from '@/lib/properties';
import { WizardFormData } from '@/lib/types';
import { WizardStep } from '@/components/admin/WizardStep';
import { FadeInUp } from '@/components/ui/FadeInUp';

function PublicarContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [initialPropertyData, setInitialPropertyData] = useState<
    Partial<WizardFormData> | undefined
  >(undefined);

  useEffect(() => {
    if (!editId) {
      setInitialPropertyData(undefined);
      return;
    }

    propertiesStore
      .getById(editId)
      .then((existing) => {
        if (!existing) {
          setInitialPropertyData(undefined);
          return;
        }

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
          owner_name: existing.owner_name || '',
          owner_phone: existing.owner_phone || '',
          notes: existing.notes || '',
        });
      })
      .catch(() => setInitialPropertyData(undefined));
  }, [editId]);

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

      <WizardStep initialData={initialPropertyData} editId={editId} />
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
