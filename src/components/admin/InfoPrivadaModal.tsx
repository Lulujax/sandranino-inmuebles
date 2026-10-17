'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, X, Loader2, Camera, MapPin, StickyNote, ImagePlus, Maximize2 } from 'lucide-react';
import { Inmueble } from '@/lib/types';
import { privateInfoStore, MAX_FACHADAS } from '@/lib/private-info';
import { useToast } from '@/components/ui/Toast';
import { Lightbox } from '@/components/ui/Lightbox';

interface InfoPrivadaModalProps {
  isOpen: boolean;
  property: Inmueble | null;
  onClose: () => void;
}

export const InfoPrivadaModal: React.FC<InfoPrivadaModalProps> = ({
  isOpen,
  property,
  onClose,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ubicacion, setUbicacion] = useState('');
  const [notas, setNotas] = useState('');
  const [fachadas, setFachadas] = useState<string[]>([]);
  const [fachadaThumbs, setFachadaThumbs] = useState<Record<string, string>>({});
  const [facadeLightbox, setFacadeLightbox] = useState<{
    urls: string[];
    index: number;
  } | null>(null);

  const loadFachadaThumb = useCallback(async (facadePath: string) => {
    const signedUrl = await privateInfoStore.getSignedUrl(facadePath);
    if (signedUrl) {
      setFachadaThumbs((prev) => ({ ...prev, [facadePath]: signedUrl }));
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !property) return;
    let active = true;
    setIsLoading(true);
    setUbicacion('');
    setNotas('');
    setFachadas([]);
    setFachadaThumbs({});
    privateInfoStore
      .get(property.id)
      .then((info) => {
        if (!active) return;
        if (info) {
          setUbicacion(info.ubicacion_exacta || '');
          setNotas(info.notas || '');
          setFachadas(info.fachada_urls || []);
          (info.fachada_urls || []).forEach((facadePath) => loadFachadaThumb(facadePath));
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error al cargar info privada:', err);
        toast('Error al cargar la info privada', 'error');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, property, loadFachadaThumb, toast]);

  const handleFacadeInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !property || isUploading) return;

    if (fachadas.length >= MAX_FACHADAS) {
      toast(`⚠️ Máximo ${MAX_FACHADAS} fotos de fachada`, 'warning');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast('⚠️ La foto es demasiado grande (máx. 25 MB)', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const facadePath = await privateInfoStore.uploadFacade(file);
      setFachadas((prev) => [...prev, facadePath]);
      await loadFachadaThumb(facadePath);
      toast('Foto de fachada guardada (privada)', 'success');
    } catch (err) {
      console.error('Error al subir fachada:', err);
      toast(err instanceof Error ? err.message : 'Error al subir la foto', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFacade = (index: number) => {
    const facadePath = fachadas[index];
    setFachadas((prev) => prev.filter((_, i) => i !== index));
    if (facadePath) privateInfoStore.deleteFacade(facadePath);
  };

  // Abrir la galería a pantalla completa de una fachada (solo tú)
  const openFacadeLightbox = (index: number) => {
    const facadePath = fachadas[index];
    const signedUrl = fachadaThumbs[facadePath];
    if (!signedUrl) return;
    const signedUrls = fachadas.map((path) => fachadaThumbs[path]).filter(Boolean);
    const signedIndex = signedUrls.indexOf(signedUrl);
    if (signedIndex === -1) return;
    setFacadeLightbox({ urls: signedUrls, index: signedIndex });
  };

  const handleSave = async () => {
    if (!property || isSaving) return;
    setIsSaving(true);
    try {
      const hasData =
        Boolean(ubicacion.trim()) || Boolean(notas.trim()) || fachadas.length > 0;

      if (hasData) {
        await privateInfoStore.save(property.id, {
          ubicacion_exacta: ubicacion.trim() || undefined,
          fachada_urls: fachadas,
          notas: notas.trim() || undefined,
        });
      } else {
        await privateInfoStore.remove(property.id);
      }
      toast(
        hasData ? '🔒 Info privada guardada (solo tú)' : 'Info privada eliminada',
        'success'
      );
      onClose();
    } catch (err) {
      console.error('Error al guardar info privada:', err);
      toast(err instanceof Error ? err.message : 'Error al guardar la info privada', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in font-body">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-text-heading leading-tight truncate">
                Info Privada — {property.title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Solo con tu sesión. Nunca se muestra en la web ni viaja en nada público.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-stone-500">
              <Loader2 size={26} className="animate-spin" />
              <span className="text-sm">Cargando info privada...</span>
            </div>
          ) : (
            <>
              {/* 1) Ubicación exacta privada */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                  <MapPin size={14} strokeWidth={1.5} className="text-amber-600" />
                  <span>Ubicación Exacta (privada)</span>
                </label>
                <textarea
                  rows={3}
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej. Casa esquinera de dos pisos, color marrón, portón rojo, al final de la calle... enfrente de la bodega 'La Esquina', urbanización Freddy Rufino, Valencia — se rodea la manzana por atrás por la avenida..."
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Describe el punto con todo el detalle que necesites para llegar sin preguntar a
                  nadie. La ubicación del público (estado/ciudad/sector) sigue siendo la que ya
                  definiste antes.
                </p>
              </div>

              {/* 2) Fotos de la fachada de enfrente */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700 font-body">
                    <Camera size={14} strokeWidth={1.5} className="text-amber-600" />
                    <span>Fotos de la Fachada de Enfrente (hasta {MAX_FACHADAS}, privado)</span>
                  </label>
                  {fachadas.length < MAX_FACHADAS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-lg hover:bg-emerald-200/70 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ImagePlus size={13} />
                      )}
                      <span>{isUploading ? 'Subiendo...' : 'Agregar foto'}</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFacadeInputChange}
                />
                {fachadas.length === 0 ? (
                  <div className="border border-dashed border-stone-200 rounded-xl p-5 text-center bg-stone-50/60">
                    <p className="text-[11px] text-stone-500">
                      Foto de la casa/inmueble de enfrente para orientarte al llegar. Se guarda en
                      un lugar privado que nadie más puede ver.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {fachadas.map((facadePath, i) => (
                      <div
                        key={`${facadePath}-${i}`}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden border border-stone-200/80 bg-[#f5f1ea] group"
                      >
                        {fachadaThumbs[facadePath] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={fachadaThumbs[facadePath]}
                            alt={`Fachada ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-stone-400" />
                          </div>
                        )}
                        {fachadaThumbs[facadePath] && (
                          <button
                            type="button"
                            onClick={() => openFacadeLightbox(i)}
                            className="absolute inset-0 z-[15] cursor-zoom-in"
                            title="Ver foto ampliada"
                            aria-label={`Ver fachada ${i + 1} ampliada`}
                          >
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
                              <Maximize2
                                size={17}
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacade(i)}
                          className="absolute top-1.5 right-1.5 z-30 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center transition-all cursor-pointer"
                          title="Eliminar foto de fachada"
                          aria-label="Eliminar foto de fachada"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                        <span className="absolute bottom-1 right-1.5 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded-md pointer-events-none">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3) Notas privadas adicionales */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-700 mb-1.5 font-body">
                  <StickyNote size={14} strokeWidth={1.5} className="text-amber-600" />
                  <span>Notas Extra (opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. el propietario no acepta visitas los domingos; el portón azul del vecino confunde; se llega mejor por la parte de atrás..."
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-lg text-base sm:text-sm text-text-heading font-body focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 sm:p-5 border-t border-stone-200/80 bg-[#faf9f6] flex items-center justify-between gap-3">
          <p className="text-[11px] text-stone-500 hidden sm:block">
            Se incluye en tus ZIP con el bloque 🔒 para orientarte al enseñarlo.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#1e3a5f] hover:bg-[#152a45] text-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Lock size={15} strokeWidth={2} />
              )}
              <span>{isSaving ? 'Guardando...' : 'Guardar Info Privada'}</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {facadeLightbox && (
        <Lightbox
          urls={facadeLightbox.urls}
          initialIndex={facadeLightbox.index}
          title={property.title}
          note="Foto privada — solo tú puedes verla"
          onClose={() => setFacadeLightbox(null)}
        />
      )}
    </>
  );
};
