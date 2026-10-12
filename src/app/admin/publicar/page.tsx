'use client';

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { WizardStep } from '@/components/admin/WizardStep';

function PublicarContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const initialPropertyData = useMemo(() => {
    if (!editId) return undefined;
    const existing = MOCK_PROPERTIES.find((p) => p.id === editId);
    if (!existing) return undefined;

    return {
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
      notes: existing.notes || '',
    };
  }, [editId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {editId ? 'Editar Inmueble' : 'Publicar Nuevo Inmueble'}
        </h2>
        <p className="text-sm text-gray-500">
          {editId
            ? 'Modifica los datos del inmueble en el asistente de 8 pasos.'
            : 'Completa los 8 sencillos pasos para incorporar una nueva propiedad a tu inventario.'}
        </p>
      </div>

      <WizardStep initialData={initialPropertyData} />
    </div>
  );
}

export default function PublicarPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-500">
          Cargando asistente de publicación...
        </div>
      }
    >
      <PublicarContent />
    </Suspense>
  );
}

