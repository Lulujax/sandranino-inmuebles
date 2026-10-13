'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane, FaFacebookF } from 'react-icons/fa';
import { Inmueble } from '@/lib/types';
import { getShareUrls } from '@/lib/utils';

interface ShareButtonsProps {
  property: Inmueble;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ property }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareUrls = getShareUrls(property, currentUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="bg-[#faf9f6] p-6 rounded-2xl border border-stone-200/80 shadow-card font-body space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 font-body">
          <Share2 size={16} strokeWidth={1.5} className="text-[#C97B5A]" />
          <span>Compartir este inmueble</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* WhatsApp */}
        <a
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en WhatsApp"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#edf7ee] text-[#1d6447] border border-[#cbe8cf] hover:bg-[#1d6447] hover:text-white hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200 shadow-2xs"
        >
          <FaWhatsapp className="w-4 h-4 shrink-0" />
          <span>WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={shareUrls.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Telegram"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#edf3f9] text-[#1e3a5f] border border-[#d4e2f0] hover:bg-[#1e3a5f] hover:text-white hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200 shadow-2xs"
        >
          <FaTelegramPlane className="w-4 h-4 shrink-0" />
          <span>Telegram</span>
        </a>

        {/* Facebook */}
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#eef4ff] text-[#1877F2] border border-[#cddff8] hover:bg-[#1877F2] hover:text-white hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200 shadow-2xs"
        >
          <FaFacebookF className="w-3.5 h-3.5 shrink-0" />
          <span>Facebook</span>
        </a>
      </div>

      {/* Copiar enlace */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-700 border border-stone-200/90 text-xs font-medium transition-all cursor-pointer shadow-2xs"
      >
        {copied ? (
          <>
            <Check size={14} strokeWidth={1.8} className="text-emerald-600" />
            <span className="text-emerald-700">¡Enlace copiado!</span>
          </>
        ) : (
          <>
            <Copy size={14} strokeWidth={1.5} className="text-[#C97B5A]" />
            <span>Copiar enlace</span>
          </>
        )}
      </button>
    </div>
  );
};
