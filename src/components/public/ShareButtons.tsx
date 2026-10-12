'use client';

import React, { useEffect, useState } from 'react';
import { Share2, MessageCircle, Send } from 'lucide-react';
import { getShareUrls } from '@/lib/utils';

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
    <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-card">
      <div className="flex items-center gap-2.5 mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700 font-sans">
        <Share2 className="w-4 h-4 text-terracotta stroke-[1.75]" />
        <span>Compartir este inmueble</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* WhatsApp */}
        <a
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100 hover:border-emerald-300 hover:-translate-y-0.5 font-medium text-xs font-sans transition-all duration-200 shadow-xs"
        >
          <MessageCircle className="w-4 h-4 stroke-[1.75]" />
          <span className="font-semibold">WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={shareUrls.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-sky-50/80 text-sky-800 border border-sky-200/60 hover:bg-sky-100 hover:border-sky-300 hover:-translate-y-0.5 font-medium text-xs font-sans transition-all duration-200 shadow-xs"
        >
          <Send className="w-4 h-4 stroke-[1.75]" />
          <span className="font-semibold">Telegram</span>
        </a>

        {/* Facebook */}
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-50/80 text-blue-800 border border-blue-200/60 hover:bg-blue-100 hover:border-blue-300 hover:-translate-y-0.5 font-medium text-xs font-sans transition-all duration-200 shadow-xs"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="font-semibold">Facebook</span>
        </a>
      </div>
    </div>
  );
};
