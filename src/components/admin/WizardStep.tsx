'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  Key,
  Building,
  Warehouse,
  Store,
  Trees,
  Briefcase,
  Upload,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  WizardFormData,
  OperationType,
  PropertyType,
  Inmueble,
} from '@/lib/types';
import { ESTADOS_VENEZUELA, VENEZUELA } from '@/lib/venezuela';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const STEP_TITLES = [
  'Operación',
  'Tipo',
  'Ubicación',
  'Detalles',
  'Fotos',
  'Descripción',
  'Precio',
  'Revisar',
];

interface WizardStepProps {
  initialData?: Partial<WizardFormData>;
}

export const WizardStep: React.FC<WizardStepProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    operation: initialData?.operation || undefined,
    type: initialData?.type || undefined,
    state: initialData?.state || '',
    city: initialData?.city || '',
    sector: initialData?.sector || '',
    address: initialData?.address || '',
    show_exact_location: initialData?.show_exact_location || false,
    bedrooms: initialData?.bedrooms,
    bathrooms: initialData?.bathrooms,
    parking: initialData?.parking,
    built_area: initialData?.built_area,
    land_area: initialData?.land_area,
    year: initialData?.year,
    total_area: initialData?.total_area,
    height: initialData?.height,
    offices: initialData?.offices,
    images: initialData?.images || [],
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price,
    internal_code: initialData?.internal_code || '',
    notes: initialData?.notes || '',
  });

  const availableCities = formData.state ? VENEZUELA[formData.state] || [] : [];

  // Cambio de estado geográfico (resetea ciudad)
  const handleStateChange = (newState: string) => {
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: '',
    }));
  };

  // Subida de imágenes mock / local
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (formData.images.length >= 20) {
        toast('⚠️ Límite máximo de 20 fotos alcanzado', 'warning');
        return;
      }
      const newUrl = URL.createObjectURL(e.target.files[0]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newUrl],
      }));
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Validaciones obligatorias por paso
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.operation) {
          toast('⚠️ Debe seleccionar una operación (Vender o Alquilar)', 'warning');
          return false;
        }
        return true;
      case 2:
        if (!formData.type) {
          toast('⚠️ Debe seleccionar el tipo de inmueble', 'warning');
          return false;
        }
        return true;
      case 3:
        if (!formData.state) {
          toast('⚠️ Debe seleccionar el Estado de ubicación', 'warning');
          return false;
        }
        if (!formData.city) {
          toast('⚠️ Debe seleccionar la Ciudad / Municipio', 'warning');
          return false;
        }
        return true;
      case 4:
        return true; // Todos los campos de detalles son opcionales
      case 5:
        if (formData.images.length < 1) {
          toast('⚠️ Debe agregar al menos 1 fotografía del inmueble', 'warning');
          return false;
        }
        return true;
      case 6:
        if (!formData.title.trim()) {
          toast('⚠️ El título del inmueble es obligatorio', 'warning');
          return false;
        }
        if (formData.title.length > 80) {
          toast('⚠️ El título no puede exceder los 80 caracteres', 'warning');
          return false;
        }
        if (formData.description.length > 1500) {
          toast('⚠️ La descripción no puede exceder 1500 caracteres', 'warning');
          return false;
        }
        return true;
      case 7:
        if (!formData.price || formData.price <= 0) {
          toast('⚠️ Debe ingresar un precio válido en USD', 'warning');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = () => {
    toast('Inmueble guardado como Borrador', 'success');
    setTimeout(() => router.push('/admin/inmuebles'), 1200);
  };

  const handlePublish = () => {
    toast('¡Inmueble publicado con éxito en tu catálogo!', 'success');
    setTimeout(() => router.push('/admin/inmuebles'), 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* BARRA DE PROGRESO */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* Versión Desktop: círculos numerados compactos sin scroll */}
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-0" />
          {STEP_TITLES.map((title, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={title} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (stepNumber < currentStep) setCurrentStep(stepNumber);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand text-white ring-4 ring-brand/20 shadow-md'
                      : 'bg-white border-2 border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </button>
                <span
                  className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                    isCurrent ? 'text-brand font-bold' : 'text-gray-500'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Versión Mobile: 'Paso X de 8: Nombre' + barra horizontal */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              Paso {currentStep} de 8
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand h-full transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL PASO */}
      <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm min-h-[380px]">
        {/* PASO 1: OPERACIÓN */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tipo de Operación</h3>
              <p className="text-sm text-gray-500">¿Qué deseas realizar con este inmueble?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, operation: 'Venta' })}
                className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  formData.operation === 'Venta'
                    ? 'border-brand bg-brand/5 ring-2 ring-brand/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 text-brand flex items-center justify-center">
                  <Home className="w-7 h-7" />
                </div>
                <span className="text-lg font-bold text-gray-900">🏠 Vender Inmueble</span>
                <span className="text-xs text-gray-500 text-center">Para venta de propiedad completa</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, operation: 'Alquiler' })}
                className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                  formData.operation === 'Alquiler'
                    ? 'border-brand bg-brand/5 ring-2 ring-brand/30'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Key className="w-7 h-7" />
                </div>
                <span className="text-lg font-bold text-gray-900">🔑 Alquilar Inmueble</span>
                <span className="text-xs text-gray-500 text-center">Canon mensual residencial o comercial</span>
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: TIPO */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Categoría del Inmueble</h3>
              <p className="text-sm text-gray-500">Selecciona el tipo de propiedad</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { type: 'Casa', icon: Home, label: 'Casa' },
                { type: 'Apartamento', icon: Building, label: 'Apartamento' },
                { type: 'Galpón', icon: Warehouse, label: 'Galpón' },
                { type: 'Local', icon: Store, label: 'Local' },
                { type: 'Terreno', icon: Trees, label: 'Terreno' },
                { type: 'Oficina', icon: Briefcase, label: 'Oficina' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: item.type as PropertyType })
                    }
                    className={`p-4 sm:p-5 rounded-xl border-2 flex flex-col items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-brand bg-brand/5 ring-2 ring-brand/30'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-brand' : 'text-gray-500'}`} />
                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3: UBICACIÓN */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ubicación Geográfica</h3>
              <p className="text-sm text-gray-500">Indica el estado y municipio del inmueble</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Estado *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Selecciona un Estado...</option>
                  {ESTADOS_VENEZUELA.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Municipio dependiente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ciudad / Municipio *
                </label>
                <select
                  value={formData.city}
                  disabled={!formData.state}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">
                    {formData.state ? 'Selecciona un Municipio...' : 'Primero elige el Estado'}
                  </option>
                  {availableCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sector */}
            <Input
              label="Sector / Urbanización (opcional)"
              placeholder="Ej. El Parral, Paso Real, Zona Industrial"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            />

            {/* Dirección exacta */}
            <Input
              label="Dirección exacta (opcional, uso interno)"
              placeholder="Ej. Calle Los Cedros, Casa #4"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            {/* Checkbox mostrar en público */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="show_exact"
                checked={formData.show_exact_location}
                onChange={(e) =>
                  setFormData({ ...formData, show_exact_location: e.target.checked })
                }
                className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"
              />
              <label htmlFor="show_exact" className="text-sm text-gray-700 select-none">
                Mostrar dirección exacta en la página pública
              </label>
            </div>
          </div>
        )}

        {/* PASO 4: DETALLES DINÁMICOS */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Características de {formData.type || 'Inmueble'}
              </h3>
              <p className="text-sm text-gray-500">
                Todos los campos son opcionales. Completa los que apliquen.
              </p>
            </div>

            {/* Casa o Apartamento */}
            {(formData.type === 'Casa' || formData.type === 'Apartamento' || formData.type === 'Oficina') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Habitaciones"
                  type="number"
                  min="0"
                  value={formData.bedrooms ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bedrooms: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Baños"
                  type="number"
                  min="0"
                  value={formData.bathrooms ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Estacionamientos"
                  type="number"
                  min="0"
                  value={formData.parking ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parking: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Área construida (m²)"
                  type="number"
                  min="0"
                  value={formData.built_area ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      built_area: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Área de terreno (m²)"
                  type="number"
                  min="0"
                  value={formData.land_area ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      land_area: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Año de construcción"
                  type="number"
                  placeholder="Ej. 2018"
                  value={formData.year ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            )}

            {/* Galpón o Local */}
            {(formData.type === 'Galpón' || formData.type === 'Local') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Área total (m²)"
                  type="number"
                  min="0"
                  value={formData.total_area ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_area: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Altura libre (m)"
                  type="number"
                  step="0.1"
                  placeholder="Ej. 7.5"
                  value={formData.height ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Baños"
                  type="number"
                  min="0"
                  value={formData.bathrooms ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bathrooms: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  label="Oficinas internas"
                  type="number"
                  min="0"
                  value={formData.offices ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offices: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            )}

            {/* Terreno */}
            {formData.type === 'Terreno' && (
              <div className="max-w-xs">
                <Input
                  label="Área total del terreno (m²)"
                  type="number"
                  min="0"
                  value={formData.total_area ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_area: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* PASO 5: FOTOS */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Fotografías del Inmueble</h3>
                <p className="text-sm text-gray-500">Mínimo 1 foto, máximo 20 fotos.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {formData.images.length} / 20 fotos
              </span>
            </div>

            {/* Zona Drag & Drop */}
            <label className="border-2 border-dashed border-gray-300 hover:border-brand rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50/30 transition-colors">
              <Upload className="w-8 h-8 text-brand mb-2" />
              <span className="text-sm font-semibold text-gray-800">
                Haz clic o arrastra fotos aquí
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Formatos JPG, PNG, WEBP (hasta 5MB por foto)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddImage}
                className="hidden"
              />
            </label>

            {/* Grid de fotos */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-3">
                {formData.images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 group bg-gray-100"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Foto ${index + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-brand text-white shadow">
                        Portada
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow transition-all"
                      title="Eliminar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 6: DESCRIPCIÓN */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Título y Descripción</h3>
              <p className="text-sm text-gray-500">
                Atrae el interés de los compradores con una descripción detallada.
              </p>
            </div>

            {/* Título */}
            <Input
              label="Título del Inmueble *"
              placeholder="Ej. Hermosa Casa Quinta en Conjunto Cerrado de San Diego"
              value={formData.title}
              characterCount={{ current: formData.title.length, max: 80 }}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            {/* Descripción */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción Detallada (opcional)
                </label>
                <span
                  className={`text-xs ${
                    formData.description.length > 1500
                      ? 'text-red-500 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {formData.description.length}/1500
                </span>
              </div>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los beneficios, amenidades, planta eléctrica, pozo de agua, acabados y cercanías..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>
        )}

        {/* PASO 7: PRECIO */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Precio y Control Interno</h3>
              <p className="text-sm text-gray-500">
                Define el valor del inmueble y tus anotaciones privadas.
              </p>
            </div>

            <div className="max-w-md">
              <Input
                label="Precio en USD (obligatorio) *"
                type="number"
                min="1"
                placeholder="Ej. 120000"
                value={formData.price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                helperText="Siempre en dólares (USD). Para alquileres representa el canon mensual."
              />
            </div>

            <div className="max-w-md">
              <Input
                label="Código Interno (opcional)"
                placeholder="Ej. SN-V-01"
                value={formData.internal_code}
                onChange={(e) => setFormData({ ...formData, internal_code: e.target.value })}
                helperText="Solo para tu control interno de expedientes."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notas Privadas (opcional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Comentarios confidenciales sobre propietarios, comisiones o llaves (no se publican)..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        )}

        {/* PASO 8: REVISAR */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revisión Final del Inmueble</h3>
              <p className="text-sm text-gray-500">
                Verifica todos los datos antes de publicar o guardar como borrador.
              </p>
            </div>

            {/* Resumen Card */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{formData.title}</h4>
                  <p className="text-sm text-gray-600">
                    {formData.sector ? `${formData.sector}, ` : ''}
                    {formData.city}, {formData.state}
                  </p>
                </div>
                <div className="text-2xl font-extrabold text-brand">
                  {formatPrice(formData.price || 0, formData.operation)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={formData.operation === 'Venta' ? 'venta' : 'alquiler'}>
                  {formData.type} en {formData.operation}
                </Badge>
                {formData.images.length > 0 && (
                  <Badge variant="gray">{formData.images.length} Fotos cargadas</Badge>
                )}
                {formData.internal_code && (
                  <Badge variant="gray">Código: {formData.internal_code}</Badge>
                )}
              </div>

              {formData.description && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-700 line-clamp-3 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTONES DE NAVEGACIÓN INFERIOR */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handlePrev}>
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {currentStep === 8 ? (
            <>
              <Button variant="secondary" onClick={handleSaveDraft}>
                <Save className="w-4 h-4" />
                <span>Guardar borrador</span>
              </Button>
              <Button variant="primary" onClick={handlePublish}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publicar Inmueble</span>
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

