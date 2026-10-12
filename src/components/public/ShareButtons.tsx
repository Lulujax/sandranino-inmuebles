'use client';

import React, { useEffect, useState } from 'react';
import { Share2, MessageCircle, Send } from 'lucide-react';
import { getShareUrls } from '@/lib/utils';

// Lucide-compatible Facebook icon (removed in lucide-react v1.x)
const FacebookIcon: React.FC<{ size?: number; strokeWidth?: number; className?: string }> = ({
  size = 16,
  strokeWidth = 1.5,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface ShareButtonsProps {
  title: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title }) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareUrls = getShareUrls(title, currentUrl);

  return (
    <div className="bg-[#faf9f6] p-6 rounded-2xl border border-stone-200/80 shadow-card font-body">
      <div className="flex items-center gap-2.5 mb-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-700 font-body">
        <Share2 size={16} strokeWidth={1.5} className="text-[#C97B5A]" />
        <span>Compartir este inmueble</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* WhatsApp */}
        <a
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en WhatsApp"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#edf7ee] text-[#226738] border border-[#cbe8cf] hover:bg-emerald-100/80 hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          <span>WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={shareUrls.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Telegram"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#edf3f9] text-[#1e3a5f] border border-[#d4e2f0] hover:bg-blue-100/70 hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200"
        >
          <Send size={16} strokeWidth={1.5} />
          <span>Telegram</span>
        </a>

        {/* Facebook */}
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#f9ede7] text-[#a85d3d] border border-[#f0d4c7] hover:bg-[#C97B5A]/20 hover:-translate-y-0.5 font-medium text-xs font-body transition-all duration-200"
        >
          <FacebookIcon size={16} strokeWidth={1.5} />
          <span>Facebook</span>
        </a>
      </div>
    </div>
  );
};
