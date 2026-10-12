'use client';

import React, { useState, useEffect } from 'react';
import { Inmueble } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { PropertyTable } from '@/components/admin/PropertyTable';

export default function MisInmueblesPage() {
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProperties(propertiesStore.getAll());
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PropertyTable initialProperties={properties} />
    </div>
  );
}
