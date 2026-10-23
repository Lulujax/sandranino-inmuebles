'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface HeaderProps {
  whatsappUrl: string;
}

const NAV_ITEMS = [
  { label: 'Inicio', target: 'inicio' },
  { label: 'Inmuebles', target: 'inmuebles' },
  { label: 'Servicios', target: 'servicios' },
  { label: '¿Por qué conmigo?', target: 'diferenciales' },
  { label: 'Contacto', target: 'contacto' },
] as const;

export const Header: React.FC<HeaderProps> = ({ whatsappUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-[#faf9f6]/90 backdrop-blur-md border-b border-stone-200/60 shadow-xs'
          : 'bg-gradient-to-b from-[#faf9f6]/85 via-[#faf9f6]/45 to-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-18 flex items-center justify-between gap-4">
          {/* Marca */}
          <a
            href="#inicio"
            onClick={closeMenu}
            className="relative z-10 inline-flex items-baseline gap-1.5 shrink-0"
            aria-label="Ir a Inicio"
          >
            <span className="font-display text-lg sm:text-xl font-semibold leading-none tracking-tight text-text-heading transition-colors duration-200 hover:text-[#C97B5A]">
              Sandra <span className="italic font-medium text-brand">Niño</span>
            </span>
          </a>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.target}
                href={`#${item.target}`}
                className="group relative inline-flex items-center px-3.5 py-2 rounded-lg text-[13px] font-body font-medium tracking-wide text-stone-600 transition-colors duration-200 hover:bg-[#C97B5A]/10 hover:text-[#C97B5A]"
              >
                <span>{item.label}</span>
                <span
                  aria-hidden
                  className="absolute left-3.5 right-3.5 bottom-1 h-[1.5px] bg-[#C97B5A] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200"
                />
              </a>
            ))}

            {/* CTA WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white text-[12px] font-body font-medium tracking-wider uppercase shadow-sm hover:shadow-luxury hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <FaWhatsapp size={16} />
              <span>Escríbeme</span>
            </a>
          </nav>

          {/* Botón hamburguesa (móvil) */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#faf9f6]/70 border border-stone-200/60 text-stone-800 hover:text-[#C97B5A] hover:border-[#C97B5A]/40 transition-colors duration-200"
          >
            {menuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={19} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none border-t-0'
        } ${solid ? '' : ''}`}
      >
        <nav
          className="px-4 pb-4 pt-1 flex flex-col gap-1 border-t border-stone-200/60 bg-[#faf9f6]/95 backdrop-blur-md"
          aria-label="Navegación móvil"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              onClick={closeMenu}
              className="inline-flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-body font-medium text-stone-700 hover:text-[#C97B5A] hover:bg-[#C97B5A]/10 transition-colors duration-200"
            >
              <span>{item.label}</span>
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#C97B5A]/50" />
            </a>
          ))}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="mt-2 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white text-xs font-body font-medium tracking-wider uppercase shadow-sm transition-colors duration-200"
          >
            <FaWhatsapp size={16} />
            <span>Escríbeme</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
