'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Award,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const MIN_PROFILE_PHOTO_PIXELS = 400;
export const ADAPTED_OUTPUT_SIZE = 800; // 800x800 px para máxima nitidez en pantallas retina

interface ProfilePhotoModalProps {
  isOpen: boolean;
  imageSrc: string;
  originalWidth: number;
  originalHeight: number;
  fullName?: string;
  onClose: () => void;
  onSave: (adaptedDataUrlOrPublicUrl: string) => Promise<void> | void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  imageSrc,
  originalWidth,
  originalHeight,
  fullName = 'Sandra Niño',
  onClose,
  onSave,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPan, setInitialPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const CROP_VIEWPORT_SIZE = 300; // Tamaño del visor interactivo en px

  // Cargar imagen en memoria
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageElementRef.current = img;
      // Resetear controles
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
  }, [isOpen, imageSrc]);

  // Calcular límites de movimiento y dibujo
  const getRenderMetrics = useCallback(() => {
    if (!imageElementRef.current) return null;
    const img = imageElementRef.current;
    const isRotatedSideways = rotation % 180 !== 0;
    const effW = isRotatedSideways ? img.naturalHeight : img.naturalWidth;
    const effH = isRotatedSideways ? img.naturalWidth : img.naturalHeight;

    const baseScale = Math.max(CROP_VIEWPORT_SIZE / effW, CROP_VIEWPORT_SIZE / effH);
    const currentScale = baseScale * zoom;

    const drawW = effW * currentScale;
    const drawH = effH * currentScale;

    const maxPanX = Math.max(0, (drawW - CROP_VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (drawH - CROP_VIEWPORT_SIZE) / 2);

    return {
      img,
      effW,
      effH,
      baseScale,
      currentScale,
      drawW,
      drawH,
      maxPanX,
      maxPanY,
    };
  }, [rotation, zoom]);

  // Dibujar en los lienzos interactivo y de vista previa
  const drawCanvases = useCallback(() => {
    const metrics = getRenderMetrics();
    if (!metrics) return;

    const { img, currentScale } = metrics;
    const canvases = [
      { ref: canvasRef, size: CROP_VIEWPORT_SIZE },
      { ref: previewCanvasRef, size: 160 },
      { ref: avatarCanvasRef, size: 64 },
    ];

    canvases.forEach(({ ref, size }) => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = size / CROP_VIEWPORT_SIZE;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fondo azul de marca (#1e3a5f)
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      // Trasladar al centro más el desplazamiento del usuario
      ctx.translate(size / 2 + pan.x * ratio, size / 2 + pan.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);

      const targetDrawW = img.naturalWidth * currentScale * ratio;
      const targetDrawH = img.naturalHeight * currentScale * ratio;

      ctx.drawImage(img, -targetDrawW / 2, -targetDrawH / 2, targetDrawW, targetDrawH);
      ctx.restore();
    });
  }, [getRenderMetrics, pan, rotation]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  // Manejo de arrastre (Pan) con ratón
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPan({ ...pan });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const metrics = getRenderMetrics();
    if (!metrics) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const newX = Math.min(metrics.maxPanX, Math.max(-metrics.maxPanX, initialPan.x + deltaX));
    const newY = Math.min(metrics.maxPanY, Math.max(-metrics.maxPanY, initialPan.y + deltaY));

    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejo de arrastre con pantalla táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setInitialPan({ ...pan });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const metrics = getRenderMetrics();
    if (!metrics) return;

    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    const newX = Math.min(metrics.maxPanX, Math.max(-metrics.maxPanX, initialPan.x + deltaX));
    const newY = Math.min(metrics.maxPanY, Math.max(-metrics.maxPanY, initialPan.y + deltaY));

    setPan({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Girar 90 grados
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPan({ x: 0, y: 0 });
  };

  // Recentrar
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Al ajustar zoom, restringir pan si sobrepasa los nuevos límites
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (!imageElementRef.current) return;
    const img = imageElementRef.current;
    const isRotatedSideways = rotation % 180 !== 0;
    const effW = isRotatedSideways ? img.naturalHeight : img.naturalWidth;
    const effH = isRotatedSideways ? img.naturalWidth : img.naturalHeight;
    const baseScale = Math.max(CROP_VIEWPORT_SIZE / effW, CROP_VIEWPORT_SIZE / effH);
    const currentScale = baseScale * newZoom;
    const maxPanX = Math.max(0, (effW * currentScale - CROP_VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (effH * currentScale - CROP_VIEWPORT_SIZE) / 2);

    setPan((prev) => ({
      x: Math.min(maxPanX, Math.max(-maxPanX, prev.x)),
      y: Math.min(maxPanY, Math.max(-maxPanY, prev.y)),
    }));
  };

  // Confirmar y generar imagen adaptada de 800x800 px
  const handleConfirm = async () => {
    const metrics = getRenderMetrics();
    if (!metrics) return;

    setIsSaving(true);
    try {
      const { img, currentScale } = metrics;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = ADAPTED_OUTPUT_SIZE;
      exportCanvas.height = ADAPTED_OUTPUT_SIZE;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo inicializar el procesador de imágenes.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fondo oscuro base de marca
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, ADAPTED_OUTPUT_SIZE, ADAPTED_OUTPUT_SIZE);

      const exportRatio = ADAPTED_OUTPUT_SIZE / CROP_VIEWPORT_SIZE;

      ctx.save();
      ctx.translate(
        ADAPTED_OUTPUT_SIZE / 2 + pan.x * exportRatio,
        ADAPTED_OUTPUT_SIZE / 2 + pan.y * exportRatio
      );
      ctx.rotate((rotation * Math.PI) / 180);

      const targetDrawW = img.naturalWidth * currentScale * exportRatio;
      const targetDrawH = img.naturalHeight * currentScale * exportRatio;

      ctx.drawImage(img, -targetDrawW / 2, -targetDrawH / 2, targetDrawW, targetDrawH);
      ctx.restore();

      // Generar DataURL de alta fidelidad (JPEG 90%)
      const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);

      // Intentar subir a Supabase Storage si está configurado
      let finalUrl = dataUrl;

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const blob = await new Promise<Blob | null>((resolve) =>
              exportCanvas.toBlob(resolve, 'image/jpeg', 0.9)
            );

            if (blob) {
              const filePath = `avatars/${user.id}-${Date.now()}.jpg`;

              // Intentar en bucket 'inmuebles' (utilizado por el inventario)
              const { error: uploadError } = await supabase.storage
                .from('inmuebles')
                .upload(filePath, blob, {
                  cacheControl: '3600',
                  upsert: true,
                  contentType: 'image/jpeg',
                });

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from('inmuebles')
                  .getPublicUrl(filePath);
                if (publicUrlData?.publicUrl) {
                  finalUrl = publicUrlData.publicUrl;
                }
              }
            }
          }
        } catch {
          // Fallback a dataUrl en caso de cualquier excepción de red
          finalUrl = dataUrl;
        }
      }

      await onSave(finalUrl);
      onClose();
    } catch (err) {
      console.error('Error al exportar imagen adaptada:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in font-body">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C97B5A]/10 text-[#C97B5A] flex items-center justify-center">
              <Sparkles size={17} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-text-heading leading-tight">
                Adaptar Foto para el Inicio
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Ajusta el encuadre para que tu rostro y retrato encajen de forma perfecta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Badge de validación de resolución */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Resolución de origen: <strong>{originalWidth} × {originalHeight} px</strong>
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
              ✅ Cumple el mínimo de {MIN_PROFILE_PHOTO_PIXELS} px
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visor interactivo de encuadre */}
            <div className="md:col-span-7 flex flex-col items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2 self-start flex items-center gap-1.5">
                <Maximize2 size={13} />
                <span>Área de recorte 1:1 (Arrastra para mover)</span>
              </span>

              <div
                className="relative rounded-2xl overflow-hidden border-2 border-[#1e3a5f]/30 shadow-card bg-[#1e3a5f] select-none touch-none cursor-grab active:cursor-grabbing"
                style={{ width: CROP_VIEWPORT_SIZE, height: CROP_VIEWPORT_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Canvas interactivo */}
                <canvas
                  ref={canvasRef}
                  width={CROP_VIEWPORT_SIZE}
                  height={CROP_VIEWPORT_SIZE}
                  className="w-full h-full block pointer-events-none"
                />

                {/* Guías sutiles de composición (Regla de tercios) */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>
              </div>

              {/* Barra de herramientas: Zoom, Girar, Centrar */}
              <div className="w-full max-w-[300px] mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ZoomOut size={15} className="text-stone-400 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-[#C97B5A] cursor-pointer"
                  />
                  <ZoomIn size={15} className="text-stone-400 shrink-0" />
                  <span className="text-xs font-mono font-medium text-stone-600 w-9 text-right">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="text-xs flex-1 gap-1.5"
                  >
                    <RotateCw size={13} />
                    <span>Girar 90°</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-xs flex-1 gap-1.5"
                  >
                    <Maximize2 size={13} />
                    <span>Centrar</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Vista previa en tiempo real de cómo quedará en el Inicio */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#f8f6f2] p-4.5 rounded-2xl border border-stone-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 mb-3 text-center">
                Vista previa real en Inicio
              </span>

              {/* Tarjeta idéntica al Hero del Inicio */}
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-luxury bg-[#1e3a5f] border-2 border-white/80 flex items-center justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={160}
                  height={160}
                  className="w-full h-full block"
                />

                {/* Badge Glassmorphic idéntico al Hero */}
                <div className="absolute -bottom-1 -left-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg border border-white/80 shadow-sm flex items-center gap-1.5 z-20 pointer-events-none scale-90 origin-bottom-left">
                  <div className="w-5 h-5 rounded-md bg-[#C97B5A]/10 text-[#C97B5A] flex items-center justify-center shrink-0">
                    <Award size={11} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-display text-[9px] font-semibold text-text-heading leading-tight">
                      +10 Años
                    </p>
                    <p className="text-[8px] text-stone-500 font-medium">Experiencia</p>
                  </div>
                </div>
              </div>

              {/* Vista previa en miniatura de barra y menú */}
              <div className="mt-4 pt-4 border-t border-stone-200/60 w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-stone-300 shadow-xs bg-[#1e3a5f]">
                    <canvas
                      ref={avatarCanvasRef}
                      width={64}
                      height={64}
                      className="w-full h-full block"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-heading leading-tight">{fullName}</p>
                    <p className="text-[10px] text-stone-500">Avatar en barra y menú</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-stone-200/60 text-[11px] text-stone-600 leading-snug w-full">
                💡 <strong>Optimización automática:</strong> Se adaptará a {ADAPTED_OUTPUT_SIZE} × {ADAPTED_OUTPUT_SIZE} px para garantizar carga ultrarrápida y máxima definición.
              </div>
            </div>
          </div>
        </div>

        {/* Pie de modal */}
        <div className="p-4 sm:p-5 border-t border-stone-200/80 flex items-center justify-end gap-2.5 bg-[#faf9f6]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isSaving}
            className="gap-2 px-6"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Adaptando foto...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Guardar y Adaptar Foto</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
