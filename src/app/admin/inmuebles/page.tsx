'use client';

import React from 'react';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { PropertyTable } from '@/components/admin/PropertyTable';

export default function MisInmueblesPage() {
  return (
    <div className="space-y-6">
      <PropertyTable initialProperties={MOCK_PROPERTIES} />
    </div>
  );
}

