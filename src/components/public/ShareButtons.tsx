'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  Sparkles,
  X,
  ExternalLink,
  Loader2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from 'react-icons/fa';
import { Inmueble } from '@/lib/types';
import { getShareUrls } from '@/lib/utils';
import {
  generatePropertyCollage,
  urlToFile,
  downloadBlobOrFile,
  copyImageBlobToClipboard,
} from '@/lib/collage-generator';

interface ShareButtonsProps {
  property: Inmueble;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ property }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCollage, setCopiedCollage] = useState(false);

  // Estados del modal y generación de collage
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  const [collageData, setCollageData] = useState<{
    blob: Blob;
    dataUrl: string;
    file: File;
  } | null>(null);

  const [isSharingPhotos, setIsSharingPhotos] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareUrls = getShareUrls(property, currentUrl);

  const propertyPhotos = (property.images || []).filter(
    (img) => typeof img === 'string' && img.length > 0
  );
  const photoCountToShare = Math.min(propertyPhotos.length, 5);

  /**
   * Genera el collage si aún no está generado
   */
  const ensureCollage = async () => {
    if (collageData) return collageData;
    setIsGeneratingCollage(true);
    try {
      const result = await generatePropertyCollage(property, 5);
      setCollageData(result);
      return result;
    } catch (err) {
      console.error('Error generando collage:', err);
      return null;
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  /**
   * Acción principal: Compartir en WhatsApp con Fotos (estilo Wasi.co)
   * En Móvil: Usa Web Share API con los archivos de las 5 fotos directamente a WhatsApp.
   * En Desktop: Copia el texto y abre el asistente de fotos y collage para WhatsApp Web.
   */
  const handleShareWhatsAppWithPhotos = async () => {
    setStatusMessage('Preparando fotos para WhatsApp...');
    setIsSharingPhotos(true);

    try {
      // 1. Preparar las primeras 5 fotos como File[]
      const filesToShare: File[] = [];
      const photosToProcess = propertyPhotos.slice(0, 5);

      for (let i = 0; i < photosToProcess.length; i++) {
        try {
          const file = await urlToFile(
            photosToProcess[i],
            `inmueble-${property.id.slice(0, 8)}-foto-${i + 1}.jpg`
          );
          filesToShare.push(file);
        } catch {}
      }

      // 2. Verificar si el navegador móvil soporta compartir archivos directamente
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        !!navigator.share &&
        !!navigator.canShare &&
        filesToShare.length > 0 &&
        navigator.canShare({ files: filesToShare });

      if (canShareFiles) {
        // Enviar directamente a WhatsApp móvil con fotos adjuntas
        await navigator.share({
          title: property.title,
          text: shareUrls.message,
          files: filesToShare,
        });
        setStatusMessage(null);
        setIsSharingPhotos(false);
        return;
      }

      // 3. Si es desktop o no soporta compartir múltiples archivos:
      // Copiamos el texto al portapapeles y abrimos el modal asistido
      await navigator.clipboard.writeText(shareUrls.message);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);

      // Abrir modal asistido para WhatsApp Web y collage
      setIsModalOpen(true);
      startTransition(() => {
        ensureCollage();
      });
    } catch (err) {
      console.warn('Share WhatsApp fallback:', err);
      // Fallback final: abrir enlace tradicional wa.me
      window.open(shareUrls.whatsapp, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSharingPhotos(false);
      setStatusMessage(null);
    }
  };

  /**
   * Abre directamente el modal para ver y exportar el collage de 5 fotos
   */
  const handleOpenCollageModal = async () => {
    setIsModalOpen(true);
    await ensureCollage();
  };

  /**
   * Descarga las 5 fotos del inmueble en el dispositivo
   */
  const handleDownloadPhotos = async () => {
    setStatusMessage('Descargando fotos...');
    const photosToDownload = propertyPhotos.slice(0, 5);
    for (let i = 0; i < photosToDownload.length; i++) {
      try {
        const file = await urlToFile(
          photosToDownload[i],
          `inmueble-${property.id.slice(0, 8)}-foto-${i + 1}.jpg`
        );
        downloadBlobOrFile(file, file.name);
        // Pequeño retardo entre descargas para evitar bloqueos del navegador
        await new Promise((res) => setTimeout(res, 250));
      } catch {}
    }
    // Copiar también el texto al portapapeles para facilitar arrastrar a WhatsApp Web
    try {
      await navigator.clipboard.writeText(shareUrls.message);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3500);
    } catch {}
    setStatusMessage(null);
  };

  /**
   * Copia la imagen del collage al portapapeles (para pegar directamente en WhatsApp Web con Ctrl+V)
   */
  const handleCopyCollage = async () => {
    if (!collageData) return;
    const success = await copyImageBlobToClipboard(collageData.blob);
    if (success) {
      setCopiedCollage(true);
      setTimeout(() => setCopiedCollage(false), 3000);
    } else {
      // Si el navegador bloquea copiar imagen, ofrecemos descargar
      downloadBlobOrFile(collageData.file, collageData.file.name);
    }
  };

  /**
   * Copia el enlace a la ficha
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  return (
    <>
      <div className="bg-[#faf9f6] p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-card font-body space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 font-body">
            <Share2 size={16} strokeWidth={1.5} className="text-[#C97B5A]" />
            <span>Compartir este inmueble</span>
          </div>
          {photoCountToShare > 0 && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
              📸 {photoCountToShare} fotos listas
            </span>
          )}
        </div>

        {/* Botón Principal: WhatsApp con Fotos (estilo Wasi) */}
        <button
          type="button"
          onClick={handleShareWhatsAppWithPhotos}
          disabled={isSharingPhotos}
          className="w-full relative group overflow-hidden flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
        >
          {isSharingPhotos ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>{statusMessage || 'Preparando fotos...'}</span>
            </>
          ) : (
            <>
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm leading-tight">
                  Compartir en WhatsApp
                </span>
                <span className="text-[11px] text-emerald-200 leading-tight">
                  {photoCountToShare > 0
                    ? `Incluye texto completo y ${photoCountToShare} fotos`
                    : 'Texto y ficha completa'}
                </span>
              </div>
              <ArrowRight
                size={16}
                className="ml-auto opacity-70 group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>

        {/* Acciones Secundarias: Collage de Fotos y Descarga */}
        <div className="grid grid-cols-2 gap-2">
          {/* Botón Generar Collage */}
          <button
            type="button"
            onClick={handleOpenCollageModal}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5f1ea] text-[#1e3a5f] border border-stone-200/90 text-xs font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:-translate-y-0.5"
          >
            <Sparkles size={14} className="text-[#C97B5A] shrink-0" />
            <span className="truncate">Collage de 5 fotos</span>
          </button>

          {/* Botón Descargar Fotos */}
          <button
            type="button"
            onClick={handleDownloadPhotos}
            disabled={photoCountToShare === 0}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-700 border border-stone-200/90 text-xs font-medium transition-all duration-150 cursor-pointer shadow-2xs hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Download size={14} className="text-[#C97B5A] shrink-0" />
            <span className="truncate">Bajar {photoCountToShare} fotos</span>
          </button>
        </div>

        {/* Redes Secundarias: Telegram, Facebook y Copiar */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-200/60">
          {/* Telegram */}
          <a
            href={shareUrls.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Telegram"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#edf3f9] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-medium text-xs transition-all duration-150 shadow-2xs"
          >
            <FaTelegramPlane className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">Telegram</span>
          </a>

          {/* Facebook */}
          <a
            href={shareUrls.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Facebook"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#eef4ff] text-[#1877F2] hover:bg-[#1877F2] hover:text-white font-medium text-xs transition-all duration-150 shadow-2xs"
          >
            <FaFacebookF className="w-3 h-3 shrink-0" />
            <span className="text-[11px]">Facebook</span>
          </a>

          {/* Copiar enlace */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white hover:bg-[#f5f1ea] text-stone-700 border border-stone-200/80 text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check size={12} className="text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={12} className="text-[#C97B5A]" />
                <span>Copiar link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MODAL / DIÁLOGO DE COMPARTIR Y COLLAGE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col font-body">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-200/80 bg-[#faf9f6]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <FaWhatsapp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-heading">
                    Compartir Inmueble con Fotos
                  </h3>
                  <p className="text-xs text-stone-500">
                    Estilo Wasi • Fotos y collage listos para WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Modal con Scroll */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Notificación de texto copiado */}
              {copiedText && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    ¡Texto de la ficha copiado al portapapeles! Listo para pegar con{' '}
                    <strong>Ctrl + V</strong> en WhatsApp Web.
                  </span>
                </div>
              )}

              {/* Vista previa del Collage de 5 Fotos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                    <Sparkles size={14} className="text-[#C97B5A]" />
                    <span>Collage de 5 Fotos (1080×1080 HD)</span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Ideal para WhatsApp Web, Estados y Grupos
                  </span>
                </div>

                <div className="relative aspect-square w-full max-w-sm mx-auto bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/90 shadow-inner flex items-center justify-center">
                  {isGeneratingCollage ? (
                    <div className="flex flex-col items-center gap-2 text-stone-500 text-xs">
                      <Loader2 className="w-8 h-8 animate-spin text-[#C97B5A]" />
                      <span>Componiendo collage de 5 fotos...</span>
                    </div>
                  ) : collageData ? (
                    <img
                      src={collageData.dataUrl}
                      alt={`Collage de ${property.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-stone-400">
                      No se pudo generar la vista previa
                    </div>
                  )}
                </div>

                {/* Acciones para el Collage */}
                {collageData && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyCollage}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      {copiedCollage ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700">
                            ¡Collage copiado!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="text-[#C97B5A]" />
                          <span>Copiar collage (Ctrl+V)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        downloadBlobOrFile(collageData.file, collageData.file.name)
                      }
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:-translate-y-0.5"
                    >
                      <Download size={14} className="text-[#C97B5A]" />
                      <span>Descargar imagen</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sección Opciones para WhatsApp Web */}
              <div className="p-4 bg-[#f5f1ea] rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1e3a5f] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Layers size={14} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-heading">
                      ¿Estás en WhatsApp Web (Computadora)?
                    </h4>
                    <p className="text-[12px] text-stone-600 leading-relaxed">
                      En WhatsApp Web puedes descargar las 5 fotos del inmueble en
                      1 clic y arrastrarlas directamente al chat junto con el
                      texto copiado.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadPhotos}
                    disabled={photoCountToShare === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Download size={14} className="text-[#C97B5A]" />
                    <span>Descargar las {photoCountToShare} fotos</span>
                  </button>

                  <a
                    href={shareUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <FaWhatsapp size={14} />
                    <span>Abrir WhatsApp Web</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
              <span>Sandra Niño • Inventario Exclusivo</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="font-medium text-stone-700 hover:text-stone-900 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
