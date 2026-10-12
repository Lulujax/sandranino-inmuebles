import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Home,
  Key,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PerfilAsesor } from '@/lib/types';

interface HeroProps {
  asesor: PerfilAsesor;
}

export const Hero: React.FC<HeroProps> = ({ asesor }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cream text-text-body font-sans selection:bg-terracotta/20 selection:text-text-heading">
      {/* Hero Principal */}
      <section className="relative overflow-hidden bg-cream-50/60 border-b border-stone-200/60 py-16 md:py-24 lg:py-28">
        {/* Sutil halo cálido de fondo estilo publicación */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-terracotta/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-brand/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
            {/* Foto de perfil con marco elegante (stagger-1) */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-2 animate-fade-in-up stagger-1">
              <div className="relative group">
                {/* Borde exterior decorativo editorial */}
                <div className="absolute -inset-2.5 rounded-3xl border border-terracotta/30 pointer-events-none transition-transform duration-500 group-hover:scale-[1.02]" />
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-84 md:h-84 rounded-2xl overflow-hidden shadow-luxury bg-cream-200 border-2 border-white/80">
                  <Image
                    src={asesor.profile_photo_url || 'https://placehold.co/400x400/1e3a5f/ffffff?text=Sandra+Nino'}
                    alt={asesor.full_name}
                    fill
                    sizes="(max-width: 768px) 256px, 340px"
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Texto de presentación */}
            <div className="md:col-span-7 text-center md:text-left order-2 md:order-1">
              {/* Título en mayúsculas espaciadas (stagger-2) */}
              <div className="animate-fade-in-up stagger-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.22em] bg-terracotta/10 text-terracotta-dark border border-terracotta/20 mb-6 font-sans">
                  <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
                  Asesoría Inmobiliaria Exclusiva
                </span>
                
                {/* Nombre con Playfair Display grande */}
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-text-heading tracking-tight leading-[1.1] mb-6">
                  Hola, soy <span className="text-brand font-normal italic">{asesor.full_name}</span>
                </h1>
              </div>

              {/* Subtítulo (stagger-3) */}
              <p className="animate-fade-in-up stagger-3 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto md:mx-0 font-sans font-normal">
                {asesor.hero_text ||
                  'Te acompaño en cada paso para encontrar el inmueble perfecto o vender tu propiedad con total confianza, seguridad jurídica y el mejor valor de mercado en Carabobo.'}
              </p>

              {/* Botón Ver Inventario (stagger-4) */}
              <div className="animate-fade-in-up stagger-4 mt-9 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/inventario"
                  className="group inline-flex items-center justify-center px-7 py-4 rounded-xl bg-brand hover:bg-brand-darker text-white font-sans text-sm font-semibold tracking-wider uppercase shadow-luxury hover:shadow-luxury-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-3"
                >
                  <span>Ver Inventario</span>
                  <ArrowRight className="w-4 h-4 stroke-[2] transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Qué puedo hacer por ti? */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta block mb-2 font-sans">
              Servicios & Enfoque
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-heading tracking-tight">
              ¿Qué puedo hacer por ti?
            </h2>
            <div className="w-12 h-0.5 bg-terracotta/40 mx-auto mt-4 mb-4" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans max-w-lg mx-auto">
              Soluciones integrales diseñadas con rigor jurídico y adaptadas a tus metas inmobiliarias residenciales y comerciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <div className="group bg-white p-8 sm:p-9 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/70 hover:border-brand/20 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-1">
              <div className="w-13 h-13 p-3.5 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                <Home className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-text-heading mb-3 tracking-tight">
                Venta de Inmuebles
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                Promoción estratégica de tu propiedad con alcance efectivo a compradores calificados, asegurando un precio justo y un cierre transparente.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="group bg-white p-8 sm:p-9 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/70 hover:border-brand/20 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-2">
              <div className="w-13 h-13 p-3.5 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                <Key className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-text-heading mb-3 tracking-tight">
                Alquileres Seguros
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                Gestión segura de arrendamientos residenciales, comerciales e industriales, verificando exhaustivamente perfiles para tu absoluta tranquilidad.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="group bg-white p-8 sm:p-9 rounded-2xl shadow-card hover:shadow-luxury-hover border border-stone-200/70 hover:border-brand/20 flex flex-col items-start transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-3">
              <div className="w-13 h-13 p-3.5 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-text-heading mb-3 tracking-tight">
                Asesoría Personalizada
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                Acompañamiento legal y comercial desde la primera visita hasta la firma final ante el registro inmobiliario correspondiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué trabajar conmigo? */}
      <section className="py-20 md:py-28 bg-cream-50 border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta block mb-2 font-sans">
              Diferenciales
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-heading tracking-tight">
              ¿Por qué trabajar conmigo?
            </h2>
            <div className="w-12 h-0.5 bg-terracotta/40 mx-auto mt-4 mb-4" />
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans max-w-lg mx-auto">
              Compromiso real, cercanía humana y resultados garantizados en cada operación inmobiliaria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Beneficio 1 */}
            <div className="flex items-start gap-4.5 p-6 rounded-2xl bg-white border border-stone-200/70 shadow-card hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up stagger-1">
              <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold text-text-heading">
                  Atención 100% personalizada
                </h4>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed font-sans">
                  Trato directo conmigo de principio a fin, sin intermediarios ni desvíos que dilaten tu tiempo.
                </p>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="flex items-start gap-4.5 p-6 rounded-2xl bg-white border border-stone-200/70 shadow-card hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up stagger-2">
              <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold text-text-heading">
                  Seguridad y respaldo jurídico
                </h4>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed font-sans">
                  Revisión minuciosa de documentación legal y solvencias antes de comprometer cualquier firma.
                </p>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="flex items-start gap-4.5 p-6 rounded-2xl bg-white border border-stone-200/70 shadow-card hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up stagger-3">
              <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold text-text-heading">
                  Conocimiento profundo del mercado
                </h4>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed font-sans">
                  Valoración certera de inmuebles en los municipios más demandados de Carabobo (San Diego, Valencia, Naguanagua, Guacara).
                </p>
              </div>
            </div>

            {/* Beneficio 4 */}
            <div className="flex items-start gap-4.5 p-6 rounded-2xl bg-white border border-stone-200/70 shadow-card hover:shadow-luxury hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up stagger-4">
              <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold text-text-heading">
                  Cierre ágil por WhatsApp
                </h4>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed font-sans">
                  Comunicación rápida, directa y transparente por el canal que tú prefieres, sin trámites burocráticos innecesarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-brand to-brand-darker text-cream-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C97B5A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-light block mb-3 font-sans">
            Comienza Hoy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-stone-200 max-w-xl mx-auto leading-relaxed font-sans font-light">
            Explora las propiedades disponibles en mi catálogo exclusivo o contáctame directamente para una búsqueda personalizada.
          </p>
          <div className="mt-10">
            <Link
              href="/inventario"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-cream text-brand hover:bg-white font-sans text-sm font-semibold tracking-wider uppercase shadow-luxury hover:shadow-luxury-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 gap-3"
            >
              <span>Ver Inventario</span>
              <ArrowRight className="w-4 h-4 text-brand stroke-[2] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="bg-brand-darker text-stone-400 py-10 border-t border-brand/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-sans">
          <div className="text-center sm:text-left">
            <p className="font-serif text-stone-200 text-sm tracking-wide">Sandra Nino</p>
            <p className="text-stone-400 text-[11px] mt-0.5">Asesora Inmobiliaria • Carabobo, Venezuela</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="text-stone-500 text-[11px]">© {new Date().getFullYear()} Todos los derechos reservados.</p>
            <Link
              href="/login"
              className="text-stone-400 hover:text-terracotta-light transition-colors text-xs font-medium tracking-wide underline-offset-4 hover:underline"
            >
              Acceso Asesores
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
