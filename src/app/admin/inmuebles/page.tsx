'use client';

import React, { useState, useEffect } from 'react';
import { Inmueble } from '@/lib/types';
import { propertiesStore } from '@/lib/properties';
import { PropertyTable } from '@/components/admin/PropertyTable';

function InmueblesSkeleton() {
  return (
    <div className="space-y-6 font-body animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-stone-200 rounded-md" />
          <div className="h-7 w-64 bg-stone-300 rounded-lg" />
          <div className="h-3.5 w-80 bg-stone-200 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-36 bg-stone-200 rounded-xl" />
          <div className="h-10 w-40 bg-stone-300 rounded-xl" />
        </div>
      </div>

      {/* Capacity Widget Skeleton */}
      <div className="bg-[#faf9f6] p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-200" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-48 bg-stone-300 rounded-md" />
              <div className="h-2.5 w-64 bg-stone-200 rounded-md" />
            </div>
          </div>
          <div className="w-full sm:w-56 space-y-1.5">
            <div className="h-2 bg-stone-200 rounded-full" />
            <div className="h-2.5 w-full bg-stone-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-[#faf9f6] p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
        <div className="h-9 sm:col-span-2 lg:col-span-4 bg-white rounded-xl border border-stone-200" />
        <div className="h-9 lg:col-span-2 bg-white rounded-xl border border-stone-200" />
        <div className="h-9 lg:col-span-2 bg-white rounded-xl border border-stone-200" />
        <div className="h-9 lg:col-span-2 bg-white rounded-xl border border-stone-200" />
        <div className="h-9 lg:col-span-2 bg-white rounded-xl border border-stone-200" />
      </div>

      {/* Table Skeleton */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200/80 shadow-card overflow-hidden">
        <div className="p-3.5 border-b border-stone-200/80 bg-[#faf9f6] flex items-center justify-between">
          <div className="h-3 w-20 bg-stone-200 rounded" />
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded" />
        </div>
        <div className="divide-y divide-stone-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-stone-200 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-44 bg-stone-200 rounded" />
                  <div className="h-2.5 w-28 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="h-3 w-24 bg-stone-100 rounded" />
              <div className="h-3 w-24 bg-stone-100 rounded" />
              <div className="h-3 w-16 bg-stone-200 rounded" />
              <div className="h-5 w-20 bg-stone-200 rounded-full" />
              <div className="h-6 w-28 bg-stone-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MisInmueblesPage() {
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    propertiesStore
      .getAll()
      .then((data) => {
        setProperties(data);
        setMounted(true);
      })
      .catch(() => {
        setProperties([]);
        setMounted(true);
      });
  }, []);

  if (!mounted) {
    return <InmueblesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PropertyTable initialProperties={properties} />
    </div>
  );
}
