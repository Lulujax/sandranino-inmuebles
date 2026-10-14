'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from 'react-icons/fa';
import { Inmueble } from '@/lib/types';
import { getShareUrls } from '@/lib/utils';

interface ShareButtonsProps {
  property: Inmueble;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ property }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareUrls = getShareUrls(property, currentUrl);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareUrls.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  return (
    <div className="bg-[#faf9f6] p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-card font-body space-y-3.5">
      {/* Encabezado */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 font-body">
        <Share2 size={16} strokeWidth={1.5} className="text-[#C97B5A]" />
        <span>Compartir este inmueble</span>
      </div>

      {/* Botón Principal: WhatsApp Directo (1 Clic, sin popups ni ventanas del sistema) */}
      <a
        href={shareUrls.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
      >
        <FaWhatsapp size={20} className="shrink-0" />
        <span className="font-semibold text-sm">Compartir en WhatsApp</span>
        <ExternalLink size={14} className="opacity-70 ml-0.5" />
      </a>

      {/* Copiar Enlace Directo */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-700 border border-stone-200/90 text-xs font-medium transition-all cursor-pointer shadow-2xs"
      >
        {copiedLink ? (
          <>
            <Check size={14} className="text-emerald-600" />
            <span className="text-emerald-700 font-semibold">¡Enlace copiado!</span>
          </>
        ) : (
          <>
            <Copy size={14} className="text-[#C97B5A]" />
            <span>Copiar enlace de la ficha</span>
          </>
        )}
      </button>

      {/* Otras Redes */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
        <a
          href={shareUrls.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Telegram"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#edf3f9] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white font-medium text-xs transition-all duration-150 shadow-2xs"
        >
          <FaTelegramPlane className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs">Telegram</span>
        </a>

        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#eef4ff] text-[#1877F2] hover:bg-[#1877F2] hover:text-white font-medium text-xs transition-all duration-150 shadow-2xs"
        >
          <FaFacebookF className="w-3 h-3 shrink-0" />
          <span className="text-xs">Facebook</span>
        </a>
      </div>
    </div>
  );
};
