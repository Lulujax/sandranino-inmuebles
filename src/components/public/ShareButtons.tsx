'use client';

import React, { useEffect, useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from 'react-icons/fa';
import { Inmueble } from '@/lib/types';
import { getShareUrls } from '@/lib/utils';
import { urlToFile, downloadBlobOrFile } from '@/lib/collage-generator';

interface ShareButtonsProps {
  property: Inmueble;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ property }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [shareMode, setShareMode] = useState<'cliente' | 'colega'>('cliente');
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Genera los enlaces en modo Cliente o Colega (Ficha blanca)
  const shareUrls = getShareUrls(property, currentUrl, shareMode);

  const propertyPhotos = (property.images || []).filter(
    (img) => typeof img === 'string' && img.length > 0
  );

  /**
   * Copia el mensaje completo de WhatsApp al portapapeles
   */
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareUrls.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {}
  };

  /**
   * Copia el enlace directo al portapapeles
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  /**
   * Descarga las fotos del inmueble (hasta 5)
   */
  const handleDownloadPhotos = async () => {
    setIsDownloading(true);
    const photosToDownload = propertyPhotos.slice(0, 5);
    for (let i = 0; i < photosToDownload.length; i++) {
      try {
        const file = await urlToFile(
          photosToDownload[i],
          `inmueble-${property.id.slice(0, 8)}-foto-${i + 1}.jpg`
        );
        downloadBlobOrFile(file, file.name);
        await new Promise((res) => setTimeout(res, 250));
      } catch {}
    }
    setIsDownloading(false);
  };

  return (
    <div className="bg-[#faf9f6] p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-card font-body space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 font-body">
          <Share2 size={16} strokeWidth={1.5} className="text-[#C97B5A]" />
          <span>Compartir Ficha (Estilo Wasi)</span>
        </div>
        <span className="text-[11px] font-medium text-stone-500">
          WhatsApp Directo
        </span>
      </div>

      {/* Selector de Modalidad Wasi: Para Clientes vs Para Colegas (Ficha Blanca) */}
      <div className="bg-stone-200/70 p-1 rounded-xl flex gap-1">
        <button
          type="button"
          onClick={() => setShareMode('cliente')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            shareMode === 'cliente'
              ? 'bg-white text-[#1e3a5f] shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <UserCheck size={14} className="shrink-0 text-[#C97B5A]" />
          <span>Para Cliente</span>
        </button>

        <button
          type="button"
          onClick={() => setShareMode('colega')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            shareMode === 'colega'
              ? 'bg-white text-[#1e3a5f] shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users size={14} className="shrink-0 text-[#1e3a5f]" />
          <span>Para Colega (Sin datos)</span>
        </button>
      </div>

      <p className="text-[11px] text-stone-500 leading-tight">
        {shareMode === 'cliente'
          ? '✓ Incluye tu información de contacto de Sandra Niño y Century 21.'
          : '✓ Ficha blanca neutral (sin teléfonos ni agencia) para alianzas con colegas.'}
      </p>

      {/* Botón Principal: WhatsApp Directo (1 Clic, sin modales de sistema operativo) */}
      <a
        href={shareUrls.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir WhatsApp directamente"
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
      >
        <FaWhatsapp size={20} className="shrink-0" />
        <span className="font-semibold text-sm">Abrir en WhatsApp</span>
        <ExternalLink size={14} className="opacity-70 ml-1" />
      </a>

      {/* Botones de Acción Secundaria */}
      <div className="grid grid-cols-2 gap-2">
        {/* Copiar Mensaje Formateado */}
        <button
          type="button"
          onClick={handleCopyMessage}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5f1ea] text-[#1e3a5f] border border-stone-200/90 text-xs font-medium transition-all cursor-pointer shadow-2xs"
        >
          {copiedMessage ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-700 font-semibold">¡Mensaje copiado!</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-[#C97B5A]" />
              <span className="truncate">Copiar mensaje</span>
            </>
          )}
        </button>

        {/* Descargar Fotos */}
        <button
          type="button"
          onClick={handleDownloadPhotos}
          disabled={isDownloading || propertyPhotos.length === 0}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-700 border border-stone-200/90 text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <Download size={14} className="text-[#C97B5A]" />
          <span className="truncate">
            {isDownloading ? 'Descargando...' : `Bajar ${Math.min(propertyPhotos.length, 5)} fotos`}
          </span>
        </button>
      </div>

      {/* Redes Secundarias y Copiar Link */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/60">
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

        {/* Copiar enlace directo */}
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

      {/* Vista Previa Desplegable del Texto estilo Wasi */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between text-[11px] text-stone-500 hover:text-stone-800 transition-colors cursor-pointer py-1"
        >
          <span>Ver texto que se enviará</span>
          {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPreview && (
          <div className="mt-2 p-3 bg-stone-100/90 rounded-xl border border-stone-200/80 text-[11px] text-stone-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
            {shareUrls.message}
          </div>
        )}
      </div>
    </div>
  );
};
