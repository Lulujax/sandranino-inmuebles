'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, MapPin, StickyNote, PencilLine, ImageOff } from 'lucide-react';
import { InfoPrivadaInmueble } from '@/lib/types';
import { privateInfoStore } from '@/lib/private-info';
import { Lightbox } from '@/components/ui/Lightbox';

interface InfoPrivadaSeccionProps {
  inmuebleId: string;
  /** Solo se activa cuando la página ya verificó la sesión del asesor. */
  enabled: boolean;
  title?: string;
}

/**
 * 🔒 Info Privada dentro de la ficha pública.
 * Se arma 100% en el navegador tras verificar sesión; si no hay sesión con
 * permisos ni siquiera se dispara la consulta (y el RLS devuelve vacío de
 * todos modos). El público jamás ve esta sección ni en el HTML inicial.
 */
export const InfoPrivadaSeccion: React.FC<InfoPrivadaSeccionProps> = ({
  inmuebleId,
  enabled,
  title,
}) => {
  const [info, setInfo] = useState<InfoPrivadaInmueble | null>(null);
  const [checked, setChecked] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !inmuebleId) {
      setInfo(null);
      setChecked(false);
      setThumbs({});
      return;
    }

    const load = async () => {
      try {
        const data = await privateInfoStore.get(inmuebleId);
        if (cancelled) return;
        setInfo(data);
        setChecked(true);

        const paths = (data?.fachada_urls || []).filter(Boolean);
        if (paths.length === 0) {
          setThumbs({});
          return;
        }

        const entries = await Promise.all(
          paths.map(async (path) => ({
            path,
            url: await privateInfoStore.getSignedUrl(path),
          }))
        );
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const entry of entries) {
          if (entry.url) next[entry.path] = entry.url;
        }
        setThumbs(next);
      } catch {
        if (!cancelled) {
          setInfo(null);
          setChecked(true);
          setThumbs({});
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, inmuebleId]);

  if (!enabled || !checked) return null;

  const ubicacionExacta = (info?.ubicacion_exacta || '').trim();
  const notas = (info?.notas || '').trim();
  const facadePaths = (info?.fachada_urls || []).filter(Boolean);
  const lightboxUrls = facadePaths
    .map((path) => thumbs[path])
    .filter((url): url is string => Boolean(url));

  // Sin fila guardada todavía: aviso discreto (solo para ella)
  if (!info) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-300/90 bg-[#fef7eb]/70 px-5 py-4 flex flex-wrap items-center justify-between gap-3 font-body">
        <div className="flex items-center gap-2.5 text-amber-900 min-w-0">
          <Lock size={15} strokeWidth={1.75} className="shrink-0 text-amber-700" />
          <span className="text-xs sm:text-sm leading-snug">
            Sin info privada guardada en este inmueble todavía.
          </span>
        </div>
        <Link
          href={`/admin/publicar?edit=${inmuebleId}&paso=7`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300/90 text-amber-900 text-[11px] font-semibold uppercase tracking-wider hover:bg-amber-100/70 transition-colors shrink-0"
        >
          <PencilLine size={13} strokeWidth={1.75} />
          <span>Añadir (Paso 7)</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-[#fef7eb] p-5 sm:p-7 shadow-card font-body">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Lock size={16} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-amber-900 leading-tight">
              Info Privada
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amber-800/70 uppercase tracking-[0.18em] font-medium">
              Solo tú con tu sesión · nunca visible al público
            </p>
          </div>
        </div>
        <Link
          href={`/admin/publicar?edit=${inmuebleId}&paso=7`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300/90 text-amber-900 text-[11px] font-semibold uppercase tracking-wider hover:bg-amber-100/70 transition-colors shrink-0"
          title="Editar esta info en el asistente (Paso 7)"
        >
          <PencilLine size={13} strokeWidth={1.75} />
          <span>Editar (Paso 7)</span>
        </Link>
      </div>

      {/* Ubicación exacta */}
      {ubicacionExacta && (
        <div className="mt-5 flex gap-2.5">
          <MapPin size={15} strokeWidth={1.75} className="shrink-0 mt-0.5 text-amber-700" />
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 block">
              Ubicación exacta
            </span>
            <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-line mt-1 font-body">
              {ubicacionExacta}
            </p>
          </div>
        </div>
      )}

      {/* Fachadas */}
      {facadePaths.length > 0 && (
        <div className="mt-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 block">
            Fachadas ({facadePaths.length})
          </span>
          <div className="flex flex-wrap gap-2.5 mt-2">
            {facadePaths.map((path, i) => {
              const signed = thumbs[path];
              if (!signed) {
                return (
                  <span
                    key={path || i}
                    className="w-24 h-24 rounded-xl bg-amber-100/70 border border-amber-200/80 flex flex-col items-center justify-center gap-1 text-amber-700/60"
                  >
                    <ImageOff size={16} strokeWidth={1.5} />
                    <span className="text-[9px] font-medium uppercase tracking-wider">
                      Sin acceso
                    </span>
                  </span>
                );
              }
              const index = lightboxUrls.indexOf(signed);
              return (
                <button
                  type="button"
                  key={path || i}
                  onClick={() => setLightbox({ urls: lightboxUrls, index })}
                  className="group relative w-24 h-24 rounded-xl overflow-hidden border border-amber-200/80 hover:border-amber-400 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={`Ver fachada ${i + 1} ampliada`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signed}
                    alt={`Fachada ${i + 1} del inmueble`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    draggable={false}
                  />
                  <span className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 py-0.5 rounded-md bg-black/45 text-[9px] text-white font-medium uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                    <Lock size={8} />
                    <span>Ampliar</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notas */}
      {notas && (
        <div className="mt-5 flex gap-2.5">
          <StickyNote size={15} strokeWidth={1.75} className="shrink-0 mt-0.5 text-amber-700" />
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/80 block">
              Notas adicionales
            </span>
            <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-line mt-1 font-body">
              {notas}
            </p>
          </div>
        </div>
      )}

      {lightbox && (
        <Lightbox
          urls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          title={title ? `Fachadas · ${title}` : 'Fachadas · Info Privada'}
          note="Solo tú puedes ver estas fotos"
        />
      )}
    </div>
  );
};
