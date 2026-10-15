'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Tag,
  KeyRound,
  Home,
  Building2,
  Warehouse,
  Store,
  TreePine,
  Briefcase,
  Upload,
  X,
  Star,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Calendar,
  Hash,
  StickyNote,
  FileEdit,
  User,
  UserCheck,
  Handshake,
  Phone,
  Camera,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  WizardFormData,
  PropertyType,
  Inmueble,
} from '@/lib/types';
import { ESTADOS_VENEZUELA, VENEZUELA } from '@/lib/venezuela';
import { formatPrice, parseContactInfo, formatContactNameForSave } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { propertiesStore, INVENTORY_LIMIT } from '@/lib/properties';
import { createClient } from '@/lib/supabase/client';
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

// Validación flexible de imágenes compatible con iOS (HEIC/HEIF), Android y cámaras móviles
const isImageFile = (file: File): boolean => {
  if (file.type && (file.type.startsWith('image/') || file.type === 'application/octet-stream')) {
    return true;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif', 'bmp', 'jfif', 'gif'].includes(ext);
};

interface SortablePhotoItemProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  onSetCover: (index: number) => void;
}

const SortablePhotoItem: React.FC<SortablePhotoItemProps> = ({
  url,
  index,
  onRemove,
  onSetCover,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-[4/3] rounded-xl overflow-hidden border group bg-[#f5f1ea] shadow-xs select-none touch-manipulation cursor-grab active:cursor-grabbing ${
        index === 0
          ? 'border-brand ring-2 ring-brand/20'
          : 'border-stone-200/80'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Foto ${index + 1}`}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="lazy"
      />

      {/* Badge PORTADA en posición 0 */}
      {index === 0 && (
        <span className="absolute top-2 left-2 z-10 text-[10px] uppercase tracking-wider bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full font-body font-medium shadow-sm pointer-events-none">
          PORTADA
        </span>
      )}

      {/* Botón para marcar como portada (mueve al índice 0) - Tamaño táctil optimizado */}
      {index > 0 && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSetCover(index);
          }}
          className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-[#1e3a5f]/90 hover:bg-[#1e3a5f] active:bg-[#152a45] text-white shadow-md flex items-center justify-center transition-all cursor-pointer"
          title="Marcar como foto de portada"
          aria-label="Marcar como foto de portada"
        >
          <Star size={15} strokeWidth={2} />
        </button>
      )}

      {/* Botón X para eliminar - Tamaño táctil optimizado */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md flex items-center justify-center transition-all cursor-pointer"
        title="Eliminar foto"
        aria-label="Eliminar foto"
      >
        <X size={16} strokeWidth={2.25} />
      </button>

      {/* Badge de número de foto */}
      <span className="absolute bottom-1.5 right-1.5 z-10 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded-md pointer-events-none">
        #{index + 1}
      </span>
    </div>
  );
};

interface WizardStepProps {
  initialData?: Partial<WizardFormData>;
  editId?: string | null;
}

export const WizardStep: React.FC<WizardStepProps> = ({ initialData, editId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<WizardFormData | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    propertiesStore
      .getAll()
      .then((data) => setInventoryCount(data.length))
      .catch(() => setInventoryCount(0));
  }, []);

  const isInventoryFull = !editId && inventoryCount >= INVENTORY_LIMIT;

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
    contact_type: parseContactInfo(initialData).type,
    owner_name: parseContactInfo(initialData).name,
    owner_phone: parseContactInfo(initialData).phone || '',
    notes: initialData?.notes || '',
  });

  // Sensores para reordenar fotos con @dnd-kit (optimizado para desktop y móvil sin bloquear el scroll táctil)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Permite deslizar la pantalla con el dedo normalmente; solo reordena tras mantener presionado
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sincronizar si initialData cambia (modo edición)
  useEffect(() => {
    if (initialData) {
      const parsed = parseContactInfo(initialData);
      setFormData({
        operation: initialData.operation || undefined,
        type: initialData.type || undefined,
        state: initialData.state || '',
        city: initialData.city || '',
        sector: initialData.sector || '',
        address: initialData.address || '',
        show_exact_location: initialData.show_exact_location || false,
        bedrooms: initialData.bedrooms,
        bathrooms: initialData.bathrooms,
        parking: initialData.parking,
        built_area: initialData.built_area,
        land_area: initialData.land_area,
        year: initialData.year,
        total_area: initialData.total_area,
        height: initialData.height,
        offices: initialData.offices,
        images: initialData.images || [],
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price,
        internal_code: initialData.internal_code || '',
        contact_type: parsed.type,
        owner_name: parsed.name,
        owner_phone: parsed.phone || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  // Verificar si existe un borrador en progreso en sn_draft al abrir el wizard
  useEffect(() => {
    if (editId || initialData) return;
    const saved = storage.get<WizardFormData | null>(STORAGE_KEYS.DRAFT, null);
    if (
      saved &&
      (saved.operation ||
        saved.type ||
        saved.state ||
        saved.title ||
        (saved.images && saved.images.length > 0) ||
        saved.price)
    ) {
      setPendingDraft(saved);
    }
  }, [editId, initialData]);

  // Autoguardado cada 3 segundos con debounce en sn_draft
  useEffect(() => {
    if (editId || pendingDraft || !hasInteracted) return;

    const timer = setTimeout(() => {
      const hasAnyData =
        Boolean(formData.operation) ||
        Boolean(formData.type) ||
        Boolean(formData.state) ||
        Boolean(formData.title.trim()) ||
        formData.images.length > 0 ||
        Boolean(formData.price);

      if (hasAnyData) {
        storage.set(STORAGE_KEYS.DRAFT, formData);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, editId, pendingDraft, hasInteracted]);

  const updateForm = (updater: (prev: WizardFormData) => WizardFormData) => {
    setHasInteracted(true);
    setFormData(updater);
  };

  const handleContinueDraft = () => {
    if (!pendingDraft) return;
    setFormData({
      operation: pendingDraft.operation || undefined,
      type: pendingDraft.type || undefined,
      state: pendingDraft.state || '',
      city: pendingDraft.city || '',
      sector: pendingDraft.sector || '',
      address: pendingDraft.address || '',
      show_exact_location: pendingDraft.show_exact_location || false,
      bedrooms: pendingDraft.bedrooms,
      bathrooms: pendingDraft.bathrooms,
      parking: pendingDraft.parking,
      built_area: pendingDraft.built_area,
      land_area: pendingDraft.land_area,
      year: pendingDraft.year,
      total_area: pendingDraft.total_area,
      height: pendingDraft.height,
      offices: pendingDraft.offices,
      images: pendingDraft.images || [],
      title: pendingDraft.title || '',
      description: pendingDraft.description || '',
      price: pendingDraft.price,
      internal_code: pendingDraft.internal_code || '',
      contact_type: parseContactInfo(pendingDraft).type,
      owner_name: parseContactInfo(pendingDraft).name,
      owner_phone: parseContactInfo(pendingDraft).phone || '',
      notes: pendingDraft.notes || '',
    });
    setPendingDraft(null);
    setHasInteracted(true);
    toast('Borrador cargado para continuar', 'info');
  };

  const handleDiscardDraft = () => {
    storage.remove(STORAGE_KEYS.DRAFT);
    setPendingDraft(null);
    toast('Borrador descartado', 'info');
  };

  const availableCities = formData.state ? VENEZUELA[formData.state] || [] : [];

  // Cambio de tipo de inmueble: limpia los campos dinámicos que no aplican al nuevo tipo
  const handleSelectType = (newType: PropertyType) => {
    updateForm((prev) => {
      const next: WizardFormData = { ...prev, type: newType };
      if (newType === 'Terreno') {
        next.bedrooms = undefined;
        next.bathrooms = undefined;
        next.parking = undefined;
        next.built_area = undefined;
        next.land_area = undefined;
        next.year = undefined;
        next.height = undefined;
        next.offices = undefined;
      } else if (newType === 'Oficina') {
        next.bedrooms = undefined;
        next.parking = undefined;
        next.built_area = undefined;
        next.land_area = undefined;
        next.year = undefined;
        next.height = undefined;
      } else if (newType === 'Galpón' || newType === 'Local') {
        next.bedrooms = undefined;
        next.parking = undefined;
        next.built_area = undefined;
        next.land_area = undefined;
        next.year = undefined;
      } else if (newType === 'Casa' || newType === 'Apartamento') {
        next.total_area = undefined;
        next.height = undefined;
        next.offices = undefined;
      }
      return next;
    });
  };

  // Cambio de estado geográfico (resetea ciudad)
  const handleStateChange = (newState: string) => {
    updateForm((prev) => ({
      ...prev,
      state: newState,
      city: '',
    }));
  };

  // Comprimir archivo de imagen a Data URL persistente para almacenamiento local
  const fileToCompressedDataUrl = (file: File, fallbackBlobUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(fallbackBlobUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch {
          resolve(fallbackBlobUrl);
        }
      };
      img.onerror = () => {
        // Respaldo con FileReader si la decodificación por Image/Canvas falla
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(fallbackBlobUrl);
          }
        };
        reader.onerror = () => resolve(fallbackBlobUrl);
        reader.readAsDataURL(file);
      };
      img.src = fallbackBlobUrl;
    });
  };

  // Procesar múltiples archivos (drag & drop, cámara o galería)
  const processFiles = (files: File[]) => {
    if (!files.length) return;

    const validFiles = files.filter(isImageFile);
    if (validFiles.length < files.length) {
      toast('⚠️ Solo se permiten archivos de imagen', 'warning');
    }
    if (validFiles.length === 0) return;

    const remainingSlots = 20 - formData.images.length;
    if (remainingSlots <= 0) {
      toast('⚠️ Límite máximo de 20 fotos alcanzado', 'warning');
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);
    if (validFiles.length > remainingSlots) {
      toast(`⚠️ Solo se agregaron ${remainingSlots} fotos (máximo 20)`, 'warning');
    }

    // 1. Vista previa instantánea con URL.createObjectURL(file)
    const entries = filesToAdd.map((file) => ({
      file,
      blobUrl: URL.createObjectURL(file),
    }));

    updateForm((prev) => ({
      ...prev,
      images: [...prev.images, ...entries.map((e) => e.blobUrl)],
    }));

    setIsProcessingImages(true);

    // 2. Subir a Supabase Storage bucket 'inmuebles' en ruta ${userId}/${filename} (con respaldo a Data URL comprimida)
    const uploadToStorageOrCompress = async (file: File, blobUrl: string, idx: number): Promise<string> => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif'].includes(ext) ? ext : 'jpg';
          const filePath = `${user.id}/${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}.${safeExt}`;

          const { error: uploadError } = await supabase.storage
            .from('inmuebles')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'image/jpeg',
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('inmuebles')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              return publicUrlData.publicUrl;
            }
          }
        }
      } catch {}

      return fileToCompressedDataUrl(file, blobUrl);
    };

    Promise.all(
      entries.map(async ({ file, blobUrl }, idx) => ({
        blobUrl,
        finalUrl: await uploadToStorageOrCompress(file, blobUrl, idx),
      }))
    )
      .then((results) => {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((imgUrl) => {
            const match = results.find((r) => r.blobUrl === imgUrl);
            return match ? match.finalUrl : imgUrl;
          }),
        }));
      })
      .catch(() => {
        toast('Error al procesar algunas fotos', 'error');
      })
      .finally(() => {
        setIsProcessingImages(false);
      });
  };

  // Subida desde input file oculto
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Eventos Drag & Drop en zona de carga
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Eliminar imagen
  const handleRemoveImage = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Marcar imagen como portada (mover a índice 0)
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    updateForm((prev) => {
      const next = [...prev.images];
      const [selected] = next.splice(index, 1);
      return {
        ...prev,
        images: [selected, ...next],
      };
    });
  };

  // Reordenar miniaturas con @dnd-kit
  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      updateForm((prev) => {
        const oldIndex = prev.images.indexOf(String(active.id));
        const newIndex = prev.images.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };

  // Validaciones obligatorias por paso (BUG 6)
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.operation) {
          toast('⚠️ Debes elegir Venta o Alquiler', 'warning');
          return false;
        }
        return true;
      case 2:
        if (!formData.type) {
          toast('⚠️ Debes elegir un tipo de inmueble', 'warning');
          return false;
        }
        return true;
      case 3:
        if (!formData.state || !formData.city) {
          toast('⚠️ El Estado y la Ciudad son obligatorios', 'warning');
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        if (formData.images.length < 1) {
          toast('⚠️ Debes subir al menos 1 foto del inmueble', 'warning');
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
          toast('⚠️ El precio en USD es obligatorio', 'warning');
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

  const createInmueblePayload = async (
    status: 'Borrador' | 'Publicado'
  ): Promise<Partial<Inmueble>> => {
    const now = new Date().toISOString();
    const existing = editId ? await propertiesStore.getById(editId) : null;

    return {
      id: editId || undefined,
      title:
        formData.title.trim() ||
        `${formData.type || 'Inmueble'} en ${formData.city || 'Venezuela'}`,
      description: formData.description.trim(),
      operation: formData.operation || 'Venta',
      type: formData.type || 'Casa',
      state: formData.state || 'Carabobo',
      city: formData.city || 'Valencia',
      sector: formData.sector.trim() || undefined,
      address: formData.address.trim() || undefined,
      show_exact_location: formData.show_exact_location,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      parking: formData.parking,
      built_area: formData.built_area,
      land_area: formData.land_area,
      year: formData.year,
      total_area: formData.total_area,
      height: formData.height,
      offices: formData.offices,
      price: formData.price || 0,
      currency: 'USD',
      internal_code: formData.internal_code.trim() || undefined,
      contact_type: formData.contact_type || 'Propietario',
      owner_name: formatContactNameForSave(formData.owner_name, formData.contact_type || 'Propietario') || undefined,
      owner_phone: formData.owner_phone.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      images: formData.images,
      status,
      visits: existing?.visits ?? 0,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
  };

  const handleSaveDraft = async () => {
    if (isInventoryFull) {
      toast(`⚠️ Has alcanzado el límite de ${INVENTORY_LIMIT} inmuebles de tu inventario. Pausa o elimina inmuebles antiguos para crear uno nuevo.`, 'warning');
      return;
    }

    try {
      const draftInmueble = await createInmueblePayload('Borrador');
      await propertiesStore.save(draftInmueble);
      storage.remove(STORAGE_KEYS.DRAFT);
      toast('Borrador guardado', 'success');
      router.push('/admin/inmuebles');
    } catch {
      toast('Error al guardar el borrador', 'error');
    }
  };

  const handlePublish = async () => {
    if (isInventoryFull) {
      toast(`⚠️ Has alcanzado el límite de ${INVENTORY_LIMIT} inmuebles de tu inventario. Pausa o elimina inmuebles antiguos para crear uno nuevo.`, 'warning');
      return;
    }

    try {
      const publishedInmueble = await createInmueblePayload('Publicado');
      await propertiesStore.save(publishedInmueble);
      storage.remove(STORAGE_KEYS.DRAFT);
      toast('Inmueble publicado', 'success');
      router.push('/admin/inmuebles');
    } catch {
      toast('Error al publicar el inmueble', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-body">
      {/* BANNER DE INVENTARIO COMPLETO (Límite Gratuito 1 GB) */}
      {isInventoryFull && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 sm:p-5 flex items-start gap-3.5 text-rose-800 shadow-xs">
          <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm sm:text-base font-display">
              Capacidad de inventario alcanzada ({inventoryCount} / {INVENTORY_LIMIT} inmuebles)
            </p>
            <p className="text-xs sm:text-sm text-rose-700 leading-relaxed font-body">
              Has alcanzado el límite recomendado de {INVENTORY_LIMIT} propiedades incluido en el plan gratuito de 1 GB. Para publicar un nuevo inmueble sin costo, puedes marcar como vendido, pausar o eliminar propiedades anteriores en la sección <strong>Mis Inmuebles</strong>. Si necesitas superar este cupo, es posible contratar capacidad de almacenamiento adicional.
            </p>
          </div>
        </div>
      )}

      {/* BANNER DE BORRADOR EN PROGRESO GUARDADO (BUG 3.5) */}
      {pendingDraft && (
        <div className="bg-[#fef7eb] border border-[#f9dfb5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0">
              <FileEdit size={18} strokeWidth={1.5} />
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#8f5b12]">
              Tienes un borrador guardado. ¿Quieres continuar?
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleContinueDraft}
            >
              Continuar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardDraft}
            >
              Descartar
            </Button>
          </div>
        </div>
      )}

      {/* BARRA DE PROGRESO */}
      <div className="bg-[#faf9f6] p-5 sm:p-7 rounded-2xl border border-stone-200/80 shadow-card">
        {/* Versión Desktop: círculos numerados conectados con líneas finas */}
        <div className="hidden md:flex items-center justify-between relative px-2">
          {/* Línea conectora fina */}
          <div className="absolute left-6 right-6 top-4 h-0.5 bg-stone-200 -z-0" />

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
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-medium font-body transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-700 text-white shadow-xs cursor-pointer hover:bg-emerald-800'
                      : isCurrent
                      ? 'bg-[#1e3a5f] text-white ring-4 ring-brand/15 shadow-sm scale-110'
                      : 'bg-white border border-stone-300 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={1.5} /> : stepNumber}
                </button>
                <span
                  className={`text-[11px] font-body uppercase tracking-wider mt-2 whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-brand font-semibold'
                      : isCompleted
                      ? 'text-emerald-800 font-medium'
                      : 'text-stone-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Versión Mobile: 'Paso X de 8: Nombre' + barra horizontal animada */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-medium text-[#C97B5A] uppercase tracking-[0.2em] font-body">
              Paso {currentStep} de 8
            </span>
            <span className="text-xs font-display font-semibold text-text-heading">
              {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <div className="w-full bg-[#f5f1ea] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#1e3a5f] h-full rounded-full transition-all duration-300 ease-editorial"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL PASO (Animado con fade-in-up 200ms) */}
      <motion.div
        key={currentStep}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#faf9f6] p-6 sm:p-9 rounded-2xl border border-stone-200/80 shadow-card min-h-[400px]"
      >
        {/* PASO 1: OPERACIÓN */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 1 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Tipo de Operación
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                ¿Qué deseas realizar con este inmueble?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <button
                type="button"
                onClick={() => updateForm((prev) => ({ ...prev, operation: 'Venta' }))}
                className={`p-7 rounded-2xl border-2 flex flex-col items-center justify-center gap-3.5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-card ${
                  formData.operation === 'Venta'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-sm ring-2 ring-brand/10'
                    : 'border-stone-200 hover:border-[#C97B5A]/60 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#edf7ee] text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                  <Tag size={26} strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-semibold text-text-heading">
                  Vender Inmueble
                </span>
                <span className="text-xs text-stone-500 text-center font-body">
                  Para venta de propiedad completa
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateForm((prev) => ({ ...prev, operation: 'Alquiler' }))}
                className={`p-7 rounded-2xl border-2 flex flex-col items-center justify-center gap-3.5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-card ${
                  formData.operation === 'Alquiler'
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-sm ring-2 ring-brand/10'
                    : 'border-stone-200 hover:border-[#C97B5A]/60 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#edf3f9] text-[#2c5282] flex items-center justify-center border border-[#2c5282]/20">
                  <KeyRound size={26} strokeWidth={1.5} />
                </div>
                <span className="font-display text-lg font-semibold text-text-heading">
                  Alquilar Inmueble
                </span>
                <span className="text-xs text-stone-500 text-center font-body">
                  Canon mensual residencial o comercial
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: TIPO */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 2 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Categoría del Inmueble
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Selecciona el tipo de propiedad que publicarás.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {[
                { type: 'Casa', icon: Home, label: 'Casa' },
                { type: 'Apartamento', icon: Building2, label: 'Apartamento' },
                { type: 'Galpón', icon: Warehouse, label: 'Galpón' },
                { type: 'Local', icon: Store, label: 'Local' },
                { type: 'Terreno', icon: TreePine, label: 'Terreno' },
                { type: 'Oficina', icon: Briefcase, label: 'Oficina' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSelectType(item.type as PropertyType)}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-card ${
                      isSelected
                        ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 ring-2 ring-brand/10 shadow-sm'
                        : 'border-stone-200 hover:border-[#C97B5A]/60 bg-white'
                    }`}
                  >
                    <Icon
                      size={24}
                      strokeWidth={1.5}
                      className={isSelected ? 'text-[#1e3a5f]' : 'text-[#C97B5A]'}
                    />
                    <span className="text-sm font-medium text-text-heading font-body">
                      {item.label}
                    </span>
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
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 3 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading flex items-center gap-2">
                <MapPin size={22} strokeWidth={1.5} className="text-[#C97B5A]" />
                <span>Ubicación Geográfica</span>
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Indica el estado y municipio del inmueble.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
              {/* Estado */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                  Estado *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs"
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
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                  Ciudad / Municipio *
                </label>
                <select
                  value={formData.city}
                  disabled={!formData.state}
                  onChange={(e) =>
                    updateForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all cursor-pointer shadow-xs disabled:bg-[#f5f1ea] disabled:text-stone-400"
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
              onChange={(e) =>
                updateForm((prev) => ({ ...prev, sector: e.target.value }))
              }
            />

            {/* Dirección exacta */}
            <Input
              label="Dirección exacta (opcional, uso interno)"
              placeholder="Ej. Calle Los Cedros, Casa #4"
              value={formData.address}
              onChange={(e) =>
                updateForm((prev) => ({ ...prev, address: e.target.value }))
              }
            />

            {/* Checkbox mostrar en público */}
            <div className="flex items-center gap-2.5 pt-2 font-body">
              <input
                type="checkbox"
                id="show_exact"
                checked={formData.show_exact_location}
                onChange={(e) =>
                  updateForm((prev) => ({
                    ...prev,
                    show_exact_location: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-brand rounded border-stone-300 focus:ring-brand/20 accent-brand cursor-pointer"
              />
              <label
                htmlFor="show_exact"
                className="text-xs sm:text-sm text-stone-700 select-none cursor-pointer"
              >
                Mostrar dirección exacta en la página pública
              </label>
            </div>
          </div>
        )}

        {/* PASO 4: DETALLES DINÁMICOS POR TIPO DE INMUEBLE (BUG 1 & BUG 5.1) */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 4 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Características de {formData.type || 'Inmueble'}
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Todos los campos son opcionales. Completa aquellos que apliquen a la propiedad.
              </p>
            </div>

            {/* Íconos dinámicos según el tipo seleccionado (ocultos para Terreno) */}
            {formData.type && formData.type !== 'Terreno' && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 py-2 px-3.5 bg-white rounded-xl border border-stone-200/70">
                {(formData.type === 'Casa' || formData.type === 'Apartamento') && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Bed size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Habitaciones
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Baños
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Car size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Estacionamientos
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize2 size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Superficie (m²)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Año
                    </span>
                  </>
                )}

                {(formData.type === 'Galpón' || formData.type === 'Local') && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize2 size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Área total (m²)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize2 size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Área construida (m²)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Baños
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Oficinas internas
                    </span>
                  </>
                )}

                {formData.type === 'Oficina' && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Maximize2 size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Área total (m²)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Bath size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Baños
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase size={14} strokeWidth={1.5} className="text-[#C97B5A]" /> Oficinas internas
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Casa / Apartamento: Habitaciones, Baños, Estacionamientos, Área construida (m²), Área terreno (m²), Año de construcción */}
            {(formData.type === 'Casa' || formData.type === 'Apartamento') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-2">
                <Input
                  label="Habitaciones"
                  type="number"
                  min="0"
                  value={formData.bedrooms ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      bedrooms: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Baños"
                  type="number"
                  min="0"
                  value={formData.bathrooms ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      bathrooms: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Estacionamientos"
                  type="number"
                  min="0"
                  value={formData.parking ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      parking: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Área construida (m²)"
                  type="number"
                  min="0"
                  value={formData.built_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      built_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Área terreno (m²)"
                  type="number"
                  min="0"
                  value={formData.land_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      land_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Año de construcción"
                  type="number"
                  placeholder="Ej. 2018"
                  value={formData.year ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      year: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            )}

            {/* Galpón / Local: Área total (m²), Área construida (m²), Baños, Oficinas internas */}
            {(formData.type === 'Galpón' || formData.type === 'Local') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
                <Input
                  label="Área total (m²)"
                  type="number"
                  min="0"
                  value={formData.total_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      total_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Área construida (m²)"
                  type="number"
                  min="0"
                  placeholder="Ej. 350"
                  value={formData.built_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      built_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Baños"
                  type="number"
                  min="0"
                  value={formData.bathrooms ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      bathrooms: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Oficinas internas"
                  type="number"
                  min="0"
                  value={formData.offices ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      offices: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            )}

            {/* Terreno: SOLO Área total (m²). NADA MÁS. */}
            {formData.type === 'Terreno' && (
              <div className="max-w-xs pt-2">
                <Input
                  label="Área total (m²)"
                  type="number"
                  min="0"
                  value={formData.total_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      total_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            )}

            {/* Oficina: Área total (m²), Baños, Oficinas internas */}
            {formData.type === 'Oficina' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-2">
                <Input
                  label="Área total (m²)"
                  type="number"
                  min="0"
                  value={formData.total_area ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      total_area: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Baños"
                  type="number"
                  min="0"
                  value={formData.bathrooms ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      bathrooms: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
                <Input
                  label="Oficinas internas"
                  type="number"
                  min="0"
                  value={formData.offices ?? ''}
                  onChange={(e) =>
                    updateForm((prev) => ({
                      ...prev,
                      offices: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            )}
          </div>
        )}

        {/* PASO 5: FOTOS */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                  PASO 5 DE 8
                </span>
                <h3 className="font-display text-2xl font-semibold text-text-heading">
                  Fotografías del Inmueble
                </h3>
                <p className="text-sm text-stone-600 mt-1 font-body">
                  Mínimo 1 foto, máximo 20 fotos. La primera foto será la portada de la ficha.
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f5f1ea] text-stone-700 border border-stone-200 self-start sm:self-auto">
                {formData.images.length} / 20 fotos
              </span>
            </div>

            {/* Botones directos con soporte nativo de cámara y galería para teléfonos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#1e3a5f] hover:bg-[#162a45] active:bg-[#112035] text-white font-medium text-sm shadow-sm transition-all cursor-pointer select-none ${
                  isProcessingImages || formData.images.length >= 20
                    ? 'opacity-60 cursor-not-allowed pointer-events-none'
                    : 'active:scale-[0.98]'
                }`}
              >
                <Camera size={19} strokeWidth={2} />
                <span>Tomar foto con cámara</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInputChange}
                  className="sr-only"
                  disabled={isProcessingImages || formData.images.length >= 20}
                />
              </label>

              <label
                className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-[#C97B5A] hover:bg-[#b56a4b] active:bg-[#9f5c40] text-white font-medium text-sm shadow-sm transition-all cursor-pointer select-none ${
                  isProcessingImages || formData.images.length >= 20
                    ? 'opacity-60 cursor-not-allowed pointer-events-none'
                    : 'active:scale-[0.98]'
                }`}
              >
                <ImageIcon size={19} strokeWidth={2} />
                <span>Elegir fotos de la galería</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="sr-only"
                  disabled={isProcessingImages || formData.images.length >= 20}
                />
              </label>
            </div>

            {/* Zona Drag & Drop funcional con input nativo transparente que cubre todo */}
            <label
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 block text-center ${
                isDraggingOver
                  ? 'border-terracotta bg-terracotta/5 scale-[1.01]'
                  : 'border-stone-300 hover:border-terracotta bg-white hover:bg-terracotta/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={isProcessingImages || formData.images.length >= 20}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                aria-label="Subir fotos del inmueble"
              />
              <Upload size={30} strokeWidth={1.5} className="text-[#C97B5A] mb-2 pointer-events-none" />
              <span className="text-sm font-medium text-text-heading font-body pointer-events-none">
                O toca aquí para explorar tus archivos
              </span>
              <span className="text-xs text-stone-500 mt-1 font-body pointer-events-none">
                Formatos JPG, PNG, WEBP, HEIC (puedes seleccionar varias a la vez)
              </span>
            </label>

            {/* Indicador de procesamiento */}
            {isProcessingImages && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-body animate-pulse">
                <Loader2 size={16} className="animate-spin text-amber-700 shrink-0" />
                <span>Optimizando y procesando fotos... Por favor espera un instante.</span>
              </div>
            )}

            {/* Grid de fotos reordenable con @dnd-kit */}
            {formData.images.length > 0 && (
              <div className="space-y-2 pt-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSortEnd}
                >
                  <SortableContext
                    items={formData.images}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {formData.images.map((imgUrl, index) => (
                        <SortablePhotoItem
                          key={imgUrl}
                          url={imgUrl}
                          index={index}
                          onRemove={handleRemoveImage}
                          onSetCover={handleSetCover}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <p className="text-[11px] text-stone-500 font-body">
                  💡 Tip: En teléfono, mantén presionada una foto un segundo para arrastrarla y cambiar el orden. Toca la estrella ⭐ para convertirla en portada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASO 6: DESCRIPCIÓN */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 6 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Título y Descripción
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Atrae el interés de los clientes con una redacción clara y detallada.
              </p>
            </div>

            {/* Título */}
            <Input
              label="Título del Inmueble *"
              placeholder="Ej. Hermosa Casa Quinta en Conjunto Cerrado de San Diego"
              value={formData.title}
              characterCount={{ current: formData.title.length, max: 80 }}
              onChange={(e) =>
                updateForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            {/* Descripción */}
            <div>
              <div className="flex justify-between items-center mb-1.5 font-body">
                <label className="block text-xs font-medium uppercase tracking-wider text-stone-700">
                  Descripción Detallada (opcional)
                </label>
                <span
                  className={`text-xs font-mono ${
                    formData.description.length > 1500
                      ? 'text-rose-600 font-semibold'
                      : 'text-stone-400'
                  }`}
                >
                  {formData.description.length}/1500
                </span>
              </div>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  updateForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe los beneficios, amenidades, planta eléctrica, pozo de agua, acabados y cercanías..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all"
              />
            </div>
          </div>
        )}

        {/* PASO 7: PRECIO */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 7 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Precio y Control Interno
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Define el valor del inmueble y tus anotaciones de control personal.
              </p>
            </div>

            <div className="max-w-md pt-2">
              <Input
                label="Precio en USD (obligatorio) *"
                type="number"
                min="1"
                placeholder="Ej. 120000"
                value={formData.price ?? ''}
                onChange={(e) =>
                  updateForm((prev) => ({
                    ...prev,
                    price: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                helperText="Siempre en dólares (USD). Para alquileres representa el canon mensual."
              />
            </div>

            <div className="max-w-md">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
                <span className="text-xs font-medium uppercase tracking-wider text-stone-700 font-body">
                  Código Interno (opcional)
                </span>
              </div>
              <Input
                placeholder="Ej. SN-V-01"
                value={formData.internal_code}
                onChange={(e) =>
                  updateForm((prev) => ({ ...prev, internal_code: e.target.value }))
                }
                helperText="Solo para tu control interno de expedientes."
              />
            </div>

            {/* Datos del Contacto / Captación (Uso Interno) */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200/80 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-heading flex items-center gap-1.5 font-body">
                  <UserCheck size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
                  <span>Contacto y Origen de Captación — Uso Interno (opcional)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5 font-body">
                  Información 100% confidencial. Identifica si es tu cartera propia o una captación compartida con un colega asesor.
                </p>
              </div>

              {/* Selector de origen / tipo de contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => updateForm((prev) => ({ ...prev, contact_type: 'Propietario' }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    formData.contact_type !== 'Colega'
                      ? 'bg-amber-50/70 border-amber-300 text-stone-900 shadow-2xs ring-1 ring-amber-300'
                      : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:bg-stone-100/60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.contact_type !== 'Colega'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-white text-stone-400 border border-stone-200'
                    }`}
                  >
                    <User size={16} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight font-display text-text-heading">
                      Propietario Directo
                    </p>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5 truncate font-body">
                      Cartera propia (Dueño del inmueble)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateForm((prev) => ({ ...prev, contact_type: 'Colega' }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    formData.contact_type === 'Colega'
                      ? 'bg-indigo-50/70 border-indigo-300 text-stone-900 shadow-2xs ring-1 ring-indigo-300'
                      : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:bg-stone-100/60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      formData.contact_type === 'Colega'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-white text-stone-400 border border-stone-200'
                    }`}
                  >
                    <Handshake size={16} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight font-display text-text-heading">
                      Colega Asesor / Aliado
                    </p>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5 truncate font-body">
                      Punta compartida / Inmobiliaria externa
                    </p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {formData.contact_type === 'Colega' ? (
                      <Handshake size={13} strokeWidth={1.5} className="text-indigo-600" />
                    ) : (
                      <User size={13} strokeWidth={1.5} className="text-stone-400" />
                    )}
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-700 font-body">
                      {formData.contact_type === 'Colega' ? 'Nombre del Colega / Inmobiliaria' : 'Nombre del Propietario'}
                    </span>
                  </div>
                  <Input
                    placeholder={formData.contact_type === 'Colega' ? 'Ej. Lic. Marcos Rivas (Rent-A-House)' : 'Ej. Sr. Carlos Mendoza'}
                    value={formData.owner_name}
                    onChange={(e) =>
                      updateForm((prev) => ({ ...prev, owner_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Phone size={13} strokeWidth={1.5} className="text-stone-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-700 font-body">
                      {formData.contact_type === 'Colega' ? 'Teléfono / WhatsApp del Colega' : 'Teléfono del Propietario'}
                    </span>
                  </div>
                  <Input
                    placeholder="Ej. +58 414-0000000"
                    value={formData.owner_phone}
                    onChange={(e) =>
                      updateForm((prev) => ({ ...prev, owner_phone: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                <StickyNote size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
                <span>Notas Privadas (opcional)</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  updateForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Comentarios confidenciales sobre propietarios, comisiones o llaves (no se publican)..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all"
              />
            </div>
          </div>
        )}

        {/* PASO 8: REVISAR */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C97B5A] block mb-1">
                PASO 8 DE 8
              </span>
              <h3 className="font-display text-2xl font-semibold text-text-heading">
                Revisión Final del Inmueble
              </h3>
              <p className="text-sm text-stone-600 mt-1 font-body">
                Verifica todos los datos antes de publicar en tu inventario o guardar como borrador.
              </p>
            </div>

            {/* Resumen Card Editorial con Foto de Portada y Detalles Técnicos */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 space-y-5 shadow-card">
              <div className="flex flex-col sm:flex-row gap-5">
                {formData.images[0] && (
                  <div className="relative w-full sm:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f1ea] border border-stone-200 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.images[0]}
                      alt="Foto de portada"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-brand text-white px-2 py-0.5 rounded-full font-body font-medium">
                      PORTADA
                    </span>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div>
                      <h4 className="font-display text-2xl font-semibold text-text-heading">
                        {formData.title || 'Sin título asignado'}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 font-body flex items-center gap-1.5">
                        <MapPin size={13} strokeWidth={1.5} className="text-[#C97B5A]" />
                        <span>
                          {formData.sector ? `${formData.sector}, ` : ''}
                          {formData.city || 'Ciudad'}, {formData.state || 'Estado'}
                        </span>
                      </p>
                    </div>
                    <div className="font-display text-2xl sm:text-3xl font-semibold text-brand whitespace-nowrap">
                      {formatPrice(formData.price || 0, formData.operation)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant={formData.operation === 'Venta' ? 'venta' : 'alquiler'}>
                      {formData.type} en {formData.operation}
                    </Badge>
                    {formData.images.length > 0 && (
                      <Badge variant="gray">{formData.images.length} Fotos cargadas</Badge>
                    )}
                    {formData.internal_code && (
                      <Badge variant="gray">Código: {formData.internal_code}</Badge>
                    )}
                    {formData.owner_name && (
                      <Badge variant="gray">
                        {formData.contact_type === 'Colega' ? '🤝 Colega: ' : '🏠 Propietario: '}
                        {formData.owner_name}
                      </Badge>
                    )}
                  </div>

                  {/* Resumen de características cargadas según el tipo */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600 pt-1">
                    {formData.built_area != null && formData.built_area > 0 && (
                      <span>
                        <strong>Área construida:</strong> {formData.built_area} m²
                      </span>
                    )}
                    {formData.land_area != null && formData.land_area > 0 && (
                      <span>
                        <strong>Terreno:</strong> {formData.land_area} m²
                      </span>
                    )}
                    {formData.total_area != null && formData.total_area > 0 && (
                      <span>
                        <strong>Área total:</strong> {formData.total_area} m²
                      </span>
                    )}
                    {formData.bedrooms != null && formData.bedrooms > 0 && (
                      <span>
                        <strong>Hab:</strong> {formData.bedrooms}
                      </span>
                    )}
                    {formData.bathrooms != null && formData.bathrooms > 0 && (
                      <span>
                        <strong>Baños:</strong> {formData.bathrooms}
                      </span>
                    )}
                    {formData.parking != null && formData.parking > 0 && (
                      <span>
                        <strong>Estac:</strong> {formData.parking}
                      </span>
                    )}
                    {formData.offices != null && formData.offices > 0 && (
                      <span>
                        <strong>Oficinas:</strong> {formData.offices}
                      </span>
                    )}
                    {formData.year != null && formData.year > 0 && (
                      <span>
                        <strong>Año:</strong> {formData.year}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {formData.description && (
                <div className="pt-3 border-t border-stone-200/60 font-body">
                  <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* BOTONES DE NAVEGACIÓN INFERIOR (Optimizado para móvil y escritorio) */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf9f6] p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-card">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={isProcessingImages}
            className="gap-2 group w-full sm:w-auto justify-center"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Anterior</span>
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isProcessingImages || isInventoryFull}
            title={isInventoryFull ? `Límite de ${INVENTORY_LIMIT} inmuebles alcanzado` : undefined}
            className="gap-1.5 text-xs sm:text-sm px-3 sm:px-4 justify-center"
          >
            <FileEdit size={15} strokeWidth={1.5} />
            <span className="truncate">Guardar borrador</span>
          </Button>

          {currentStep === 8 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handlePublish}
              disabled={isProcessingImages || isInventoryFull}
              title={isInventoryFull ? `Límite de ${INVENTORY_LIMIT} inmuebles alcanzado` : undefined}
              className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600 text-xs sm:text-sm px-3 sm:px-4 justify-center"
            >
              {isProcessingImages ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={1.5} />
                  <span>Publicar</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={isProcessingImages}
              className="gap-1.5 group text-xs sm:text-sm px-3 sm:px-4 justify-center"
            >
              {isProcessingImages ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Siguiente</span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.5}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
