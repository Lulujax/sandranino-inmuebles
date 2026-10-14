'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Tag,
  KeyRound,
  Home,
  ArrowRight,
  Mail,
  Award,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';
import { PerfilAsesor } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { FeaturedProperties } from '@/components/public/FeaturedProperties';

interface HeroProps {
  asesor: PerfilAsesor;
}

export const Hero: React.FC<HeroProps> = ({ asesor: initialAsesor }) => {
  const [asesor, setAsesor] = useState<PerfilAsesor>(initialAsesor);

  useEffect(() => {
    const syncProfile = () => {
      const savedProfile = storage.get<PerfilAsesor | null>(STORAGE_KEYS.PROFILE, null);
      if (savedProfile) {
        setAsesor(savedProfile);
      }
    };

    syncProfile();
    window.addEventListener('sn_profile_updated', syncProfile);
    window.addEventListener('storage', syncProfile);

    const supabase = createClient();
    supabase
      .from('perfil_asesor')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAsesor((prev) => ({
            ...prev,
            ...data,
            full_name: data.full_name?.replace(/Nino/g, 'Niño') || prev.full_name,
            profile_photo_url: data.profile_photo_url || prev.profile_photo_url || '/images/sandra-nino-hero.png',
            instagram: data.instagram || prev.instagram || 'sandranino.inmuebles',
            facebook: data.facebook || prev.facebook || 'sandranino.asesora',
            email: data.email || prev.email || 'sandra.nino@gmail.com',
          }));
        }
      });

    return () => {
      window.removeEventListener('sn_profile_updated', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, []);

  const advisorName = asesor.full_name?.replace(/Nino/g, 'Niño') || 'Sandra Niño';
  const cleanWhatsapp = asesor.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hola Sandra, vi tu inventario de inmuebles exclusivos y me gustaría recibir asesoría.'
  )}`;
  const whatsappBuyUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hola Sandra, estoy buscando un inmueble en Carabobo y me gustaría recibir asesoría personalizada.'
  )}`;
  const whatsappSellUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hola Sandra, tengo una propiedad que deseo vender en Carabobo y quisiera una valoración de mercado.'
  )}`;
  const instagramHandle = asesor.instagram || 'sandranino.inmuebles';
  const facebookHandle = asesor.facebook || 'sandranino.asesora';
  const emailAddress = asesor.email || 'sandra.nino@gmail.com';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] text-text-body font-body selection:bg-terracotta/20 selection:text-text-heading">
      {/* Hero Principal con fondo arquitectónico de villa de lujo y máscara suave */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea] border-b border-stone-200/60 py-16 md:py-20">
        {/* Fondo arquitectónico con vista a Valencia */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-80 sm:opacity-85 md:opacity-90"
          style={{
            backgroundImage: `url('/images/hero-luxury-villa.jpg')`,
          }}
        />
        {/* Máscara inteligente: Legibilidad cristalina a la izquierda, arquitectura viva a la derecha */}
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#faf9f6]/95 via-[#faf9f6]/80 via-45% to-[#faf9f6]/20 md:to-transparent pointer-events-none" />

        {/* Textura de papel sutil (SVG noise, opacidad 0.03) */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.03] z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="hero-paper-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-paper-noise)" />
        </svg>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-center">
            {/* Bloque de Identidad con microinteracción de resorte 3D */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-2">
              <FadeInUp duration={0.6} delay={0}>
                <motion.div
                  className="relative group cursor-default"
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                >
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-luxury bg-[#1e3a5f] border-2 border-white/60 flex items-center justify-center select-none transition-shadow duration-300 group-hover:shadow-2xl">
                    {asesor.profile_photo_url ? (
                      <img
                        src={asesor.profile_photo_url}
                        alt={asesor.full_name}
                        className="w-full h-full object-cover relative z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 opacity-[0.05] pointer-events-none"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 14px)',
                          }}
                        />
                        <span className="font-display text-[100px] sm:text-[120px] font-semibold text-white leading-none tracking-tight relative z-10">
                          SN
                        </span>
                      </>
                    )}
                  </div>

                  {/* Badge Glassmorphic de Trayectoria con entrada suave */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-3.5 -left-2.5 sm:-bottom-4 sm:-left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/80 shadow-luxury flex items-center gap-2.5 z-20 pointer-events-none"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#C97B5A]/10 text-[#C97B5A] flex items-center justify-center shrink-0">
                      <Award size={15} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-display text-xs font-semibold text-text-heading leading-tight">+10 Años</p>
                      <p className="text-[9px] text-stone-500 font-body uppercase tracking-wider font-medium">Experiencia</p>
                    </div>
                  </motion.div>
                </motion.div>
              </FadeInUp>
            </div>

            {/* Texto de presentación */}
            <div className="md:col-span-7 text-center md:text-left order-2 md:order-1">
              <FadeInUp duration={0.5} delay={0.1}>
                <div className="flex flex-col items-center md:items-start mb-5">
                  <span className="text-[11px] font-body font-medium uppercase tracking-[0.22em] text-[#C97B5A] mb-2">
                    — Desde 2014 —
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="h-[2px] bg-[#C97B5A]"
                  />
                </div>

                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-body font-medium uppercase tracking-[0.2em] bg-transparent text-[#C97B5A] border border-[#C97B5A] mb-5">
                  Asesoría Inmobiliaria Exclusiva
                </span>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-text-heading leading-[1.1] mb-5">
                  Hola, soy <span className="text-brand italic font-medium">{advisorName}</span>
                </h1>
              </FadeInUp>

              <FadeInUp duration={0.5} delay={0.2}>
                <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto md:mx-0 font-body font-normal">
                  {asesor.hero_text ||
                    'Te acompaño en cada paso para encontrar el inmueble perfecto o vender tu propiedad con total confianza, seguridad jurídica y el mejor valor de mercado en Carabobo.'}
                </p>
              </FadeInUp>

              {/* Botones Principales con reflejo sutil de luz al hacer hover */}
              <FadeInUp duration={0.5} delay={0.3}>
                <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center md:justify-start">
                  <Link
                    href="/inventario"
                    className="group relative overflow-hidden inline-flex items-center justify-center px-7 py-4 rounded-xl bg-brand hover:bg-brand-darker text-white font-body text-sm font-medium tracking-wider uppercase shadow-luxury hover:shadow-luxury-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-2.5"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                    <span>Ver Inventario</span>
                    <ArrowRight size={20} strokeWidth={1.5} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white font-body text-sm font-medium tracking-wider uppercase shadow-sm hover:shadow-luxury hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-2.5"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                    <FaWhatsapp size={20} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    <span>WhatsApp Directo</span>
                  </a>
                </div>

                {/* Íconos de redes sociales y correo (siempre visibles con Instagram, Facebook y Correo) */}
                <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
                  <a
                    href={`https://instagram.com/${instagramHandle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram de Sandra Niño"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 text-[#C97B5A] hover:bg-[#C97B5A] hover:text-white flex items-center justify-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <FaInstagram size={18} />
                  </a>

                  <a
                    href={`https://facebook.com/${facebookHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook de Sandra Niño"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 text-brand hover:bg-brand hover:text-white flex items-center justify-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <FaFacebook size={18} />
                  </a>

                  <a
                    href={`mailto:${emailAddress}`}
                    title="Correo electrónico"
                    aria-label="Correo electrónico"
                    className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 text-stone-700 hover:bg-brand hover:text-white flex items-center justify-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Mail size={18} strokeWidth={1.5} />
                  </a>
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección: Propiedades Destacadas (Selección Exclusiva de Inmuebles) */}
      <FeaturedProperties />

      {/* Sección: ¿Qué puedo hacer por ti? */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#faf9f6] to-[#f5f1ea]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-body font-medium uppercase tracking-[0.25em] text-[#C97B5A] block mb-2">
              Servicios & Enfoque
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text-heading">
              ¿Qué puedo hacer por ti?
            </h2>
            <div className="w-[40px] h-[2px] bg-[#C97B5A] mx-auto mt-4 mb-4" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-body max-w-lg mx-auto">
              Soluciones integrales diseñadas con rigor jurídico y adaptadas a tus metas inmobiliarias residenciales y comerciales.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <FadeInUp delay={0.1}>
              <div className="group h-full bg-[#faf9f6] p-8 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/80 hover:border-[#C97B5A]/40 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  <Tag size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-text-heading mb-3">
                  Venta de Inmuebles
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed font-body">
                  Promoción estratégica de tu propiedad con alcance efectivo a compradores calificados, asegurando un precio justo y un cierre transparente.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="group h-full bg-[#faf9f6] p-8 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/80 hover:border-[#C97B5A]/40 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  <KeyRound size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-text-heading mb-3">
                  Alquileres Seguros
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed font-body">
                  Gestión segura de arrendamientos residenciales, comerciales e industriales, verificando exhaustivamente perfiles para tu absoluta tranquilidad.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <div className="group h-full bg-[#faf9f6] p-8 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/80 hover:border-[#C97B5A]/40 flex flex-col items-start transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  <Home size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-semibold text-text-heading mb-3">
                  Asesoría Personalizada
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed font-body">
                  Acompañamiento legal y comercial desde la primera visita hasta la firma final ante el registro inmobiliario correspondiente.
                </p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué trabajar conmigo? */}
      <section className="py-16 md:py-24 bg-[#f5f1ea]/60 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-body font-medium uppercase tracking-[0.25em] text-[#C97B5A] block mb-2">
              Diferenciales
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text-heading">
              ¿Por qué trabajar conmigo?
            </h2>
            <div className="w-[40px] h-[2px] bg-[#C97B5A] mx-auto mt-4 mb-4" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-body max-w-lg mx-auto">
              Compromiso real, cercanía humana y resultados garantizados en cada operación inmobiliaria.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Atención 100% personalizada',
                desc: 'Trato directo conmigo de principio a fin, sin intermediarios ni desvíos que dilaten tu tiempo.',
              },
              {
                title: 'Seguridad y respaldo jurídico',
                desc: 'Revisión minuciosa de documentación legal y solvencias antes de comprometer cualquier firma.',
              },
              {
                title: 'Conocimiento profundo del mercado',
                desc: 'Valoración certera de inmuebles en los municipios más demandados de Carabobo.',
              },
              {
                title: 'Cierre ágil por WhatsApp',
                desc: 'Comunicación rápida, directa y transparente por el canal que tú prefieres.',
              },
            ].map((item, idx) => (
              <FadeInUp key={item.title} delay={0.1 * (idx + 1)}>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#faf9f6] border border-stone-200/80 shadow-card hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200 h-full">
                  <div className="w-8 h-8 rounded-full border border-[#C97B5A]/40 bg-[#C97B5A]/10 text-[#C97B5A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={16} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-text-heading">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-600 mt-1 leading-relaxed font-body">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final con fondo arquitectónico de Valencia y máscara de contraste */}
      <section className="py-20 md:py-28 text-cream-50 relative overflow-hidden bg-[#152a45]">
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transform scale-105"
          style={{
            backgroundImage: `url('/images/valencia-penthouse-banner.jpg')`,
          }}
        />
        {/* Capa de contraste azul marino profundo para legibilidad perfecta */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#152a45]/95 via-[#1e3a5f]/85 to-[#152a45]/95 pointer-events-none backdrop-blur-[1px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <FadeInUp>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-body font-medium uppercase tracking-[0.2em] bg-white/10 text-[#f0a888] border border-[#f0a888]/30 mb-4 backdrop-blur-sm">
              <Sparkles size={13} className="text-[#f0a888]" />
              <span>Asesoría Inmobiliaria Directa</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight">
              ¿Cómo prefieres que comencemos?
            </h2>
            <div className="w-[42px] h-[2px] bg-[#f0a888] mx-auto my-4" />
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-body max-w-xl mx-auto">
              Cada operación inmobiliaria es única. Cuéntame tu objetivo y diseñemos juntos el camino más seguro y rentable.
            </p>

            {/* Tarjetas de acción rápida por tipo de cliente */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left max-w-2xl mx-auto">
              {/* Opción 1: Comprador o Inquilino */}
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#f0a888]/40 hover:bg-white/15 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f0a888] block mb-2 font-body">
                    Comprador o Inquilino
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">
                    Busco mi próximo inmueble
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed font-body mb-5">
                    Indícame qué buscas y te comparto opciones verificadas que se ajusten a tus requerimientos.
                  </p>
                </div>
                <a
                  href={whatsappBuyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#1d6447] hover:bg-[#164e37] text-white text-xs font-medium tracking-wider uppercase shadow-sm transition-all duration-200 group-hover:shadow-luxury"
                >
                  <FaWhatsapp size={17} />
                  <span>Escribir por WhatsApp</span>
                </a>
              </div>

              {/* Opción 2: Propietario que desea vender */}
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#f0a888]/40 hover:bg-white/15 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f0a888] block mb-2 font-body">
                    Propietario
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">
                    Quiero vender o consignar
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed font-body mb-5">
                    Valoración real de mercado y estrategia de comercialización con respaldo legal.
                  </p>
                </div>
                <a
                  href={whatsappSellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white text-[#152a45] hover:bg-stone-100 text-xs font-medium tracking-wider uppercase shadow-sm transition-all duration-200 group-hover:shadow-luxury"
                >
                  <FaWhatsapp size={17} className="text-[#1d6447]" />
                  <span>Valorar mi propiedad</span>
                </a>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="bg-brand-darker text-stone-300 py-10 border-t border-brand/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-body">
          <div className="text-center sm:text-left">
            <p className="font-display text-white text-sm font-semibold">{asesor.full_name}</p>
            <p className="text-stone-300 text-[11px] mt-0.5">Asesora Inmobiliaria • Carabobo, Venezuela</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-stone-300 text-[11px]">© {new Date().getFullYear()} Todos los derechos reservados.</p>
            <Link
              href="/login"
              className="text-[#f0a888] hover:text-white transition-colors text-xs font-medium tracking-wide underline-offset-4 hover:underline"
            >
              Acceso Asesores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
