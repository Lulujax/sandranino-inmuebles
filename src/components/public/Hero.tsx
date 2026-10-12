import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Home, Key, ShieldCheck, ArrowRight, Award, Clock, HeartHandshake } from 'lucide-react';
import { PerfilAsesor } from '@/lib/types';

interface HeroProps {
  asesor: PerfilAsesor;
}

export const Hero: React.FC<HeroProps> = ({ asesor }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Principal */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Foto de perfil */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-2">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-gray-200">
                <Image
                  src={asesor.profile_photo_url || 'https://placehold.co/400x400/1e3a5f/ffffff?text=Sandra+Nino'}
                  alt={asesor.full_name}
                  fill
                  sizes="(max-width: 768px) 256px, 320px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Texto de presentación */}
            <div className="md:col-span-7 text-center md:text-left order-2 md:order-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand mb-4">
                <Award className="w-4 h-4" />
                Asesora Inmobiliaria Certificada
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Hola, soy <span className="text-brand">{asesor.full_name}</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
                {asesor.hero_text ||
                  'Te acompaño en cada paso para encontrar el inmueble perfecto o vender tu propiedad con total confianza, seguridad jurídica y el mejor valor de mercado en Carabobo.'}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/inventario"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-light text-white font-semibold shadow-md transition-all gap-2 text-base"
                >
                  Ver Inventario de Inmuebles
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Qué puedo hacer por ti? */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              ¿Qué puedo hacer por ti?
            </h2>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Soluciones integrales adaptadas a tus metas inmobiliarias personales y comerciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Tarjeta 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand flex items-center justify-center mb-5">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Venta de Inmuebles</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Promoción estratégica de tu propiedad con alcance efectivo a compradores calificados, asegurando un precio justo y cierre transparente.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand flex items-center justify-center mb-5">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Alquileres</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gestión segura de arrendamientos residenciales, comerciales e industriales, verificando perfiles para tu absoluta tranquilidad.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center md:items-start text-center md:text-left transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-brand flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Asesoría Personalizada</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Acompañamiento legal y comercial desde la primera visita hasta la firma ante el registro inmobiliario correspondiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué trabajar conmigo? */}
      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              ¿Por qué trabajar conmigo?
            </h2>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              Compromiso real, cercanía y resultados garantizados en cada operación.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-base">Atención 100% personalizada</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Trato directo conmigo de principio a fin, sin intermediarios ni desvíos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-base">Seguridad y respaldo jurídico</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Revisión exhaustiva de documentación legal antes de comprometer cualquier firma.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-base">Conocimiento profundo del mercado</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Valoración certera de inmuebles en los municipios más demandados de Carabobo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-base">Cierre ágil por WhatsApp</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Comunicación rápida, directa y transparente por el canal que tú prefieres.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-brand text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-200 max-w-xl mx-auto">
            Explora las propiedades disponibles en mi catálogo o contáctame directamente para ayudarte a buscar lo que necesitas.
          </p>
          <div className="mt-8">
            <Link
              href="/inventario"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-brand hover:bg-gray-100 font-bold text-base shadow-lg transition-all gap-2"
            >
              Ver Inventario
              <ArrowRight className="w-5 h-5 text-brand" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} Sandra Nino — Asesora Inmobiliaria. Todos los derechos reservados.</p>
          <Link
            href="/login"
            className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline text-xs"
          >
            Acceso Asesores
          </Link>
        </div>
      </footer>
    </div>
  );
};

