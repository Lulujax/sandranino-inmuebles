// ============================================================================
// 🔒 Info privada por inmueble (SOLO visible con la sesión del asesor)
// - Tabla 'info_privada_inmuebles' con RLS: user_id = auth.uid()
// - Bucket de storage privado 'inmuebles-privadas' con URLs firmadas (1 h)
// La web pública (llave anónima) no tiene permisos: jamás se mezcla aquí con
// el resto del contenido público.
// ============================================================================

import { InfoPrivadaInmueble } from './types';
import { createClient, isSupabaseConfigured } from './supabase/client';
import { compressImageToBlob } from './image-compress';

export const PRIVATE_INFO_BUCKET = 'inmuebles-privadas';
export const MAX_FACHADAS = 3;
export const MAX_FACHADA_BYTES = 12 * 1024 * 1024; // 12 MB por foto de fachada

export interface PrivateInfoInput {
  ubicacion_exacta?: string;
  fachada_urls: string[];
  notas?: string;
}

export const privateInfoStore = {
  /** Trae la info privada de un inmueble (requiere tu sesión). */
  async get(inmuebleId: string): Promise<InfoPrivadaInmueble | null> {
    if (!inmuebleId || !isSupabaseConfigured()) return null;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('info_privada_inmuebles')
      .select('*')
      .eq('inmueble_id', inmuebleId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...(data as InfoPrivadaInmueble),
      fachada_urls: Array.isArray(data.fachada_urls) ? data.fachada_urls : [],
    };
  },

  /** Guarda (crea o actualiza) la info privada de un inmueble. */
  async save(inmuebleId: string, info: PrivateInfoInput): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado');
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

    const payload: Partial<InfoPrivadaInmueble> = {
      inmueble_id: inmuebleId,
      user_id: user.id,
      ubicacion_exacta: info.ubicacion_exacta?.trim()
        ? info.ubicacion_exacta.trim()
        : undefined,
      fachada_urls: (info.fachada_urls || []).filter(Boolean),
      notas: info.notas?.trim() ? info.notas.trim() : undefined,
    };

    const { error } = await supabase
      .from('info_privada_inmuebles')
      .upsert(payload, { onConflict: 'inmueble_id' });

    if (error) throw error;
  },

  /** Elimina la fila de info privada (se usa si borras todo su contenido). */
  async remove(inmuebleId: string): Promise<void> {
    if (!inmuebleId || !isSupabaseConfigured()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('info_privada_inmuebles')
      .delete()
      .eq('inmueble_id', inmuebleId);
    if (error) throw error;
  },

  /**
   * Sube una foto de fachada al bucket privado (comprimida a JPEG).
   * Devuelve la ruta dentro del bucket, ej: `${userId}/fachada-1729-abc.jpg`
   */
  async uploadFacade(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase no está configurado');
    }
    if (file.size > MAX_FACHADA_BYTES * 2) {
      throw new Error('La foto es demasiado grande (máx. 12 MB)');
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

    const blob = await compressImageToBlob(file);
    if (!blob) throw new Error('No se pudo procesar la foto. Intenta con otra.');

    const filePath = `${user.id}/fachada-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;

    const { error } = await supabase.storage
      .from(PRIVATE_INFO_BUCKET)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (error) {
      if (
        error.message?.toLowerCase().includes('policy') ||
        error.message?.toLowerCase().includes('row-level') ||
        (error as { status?: number }).status === 403
      ) {
        throw new Error(
          'Info privada desactivada: falta ejecutar supabase/info_privada.sql en Supabase'
        );
      }
      throw error;
    }
    return filePath;
  },

  /** Elimina una foto de fachada del bucket privado (ignora errores). */
  async deleteFacade(facadePath: string): Promise<void> {
    try {
      if (!facadePath || !isSupabaseConfigured()) return;
      const supabase = createClient();
      const supabaseStorage = supabase.storage.from(PRIVATE_INFO_BUCKET);
      await supabaseStorage.remove([facadePath]);
    } catch {
      // Si no se puede borrar el archivo, no bloqueamos el flujo del usuario
    }
  },

  /** URL firmada temporal (1 h por defecto) para mostrar una foto de fachada. */
  async getSignedUrl(facadePath: string, expiresIn = 3600): Promise<string | null> {
    if (!facadePath || !isSupabaseConfigured()) return null;
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(PRIVATE_INFO_BUCKET)
        .createSignedUrl(facadePath, expiresIn);
      if (error) return null;
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  },

  /**
   * Devuelve la info privada lista para el ZIP: descarga cada fachada como
   * Blob con su URL firmada (solo con tu sesión).
   */
  async getFacadeBlobs(
    fachadaUrls: string[]
  ): Promise<Array<{ path: string; blob: Blob }>> {
    const out: Array<{ path: string; blob: Blob }> = [];
    for (const facadePath of fachadaUrls || []) {
      try {
        const supabase = createClient();
        const signed = await privateInfoStore.getSignedUrl(facadePath, 120);
        if (!signed) continue;
        const response = await fetch(signed);
        if (!response.ok) continue;
        const blobData = await response.blob();
        if (blobData.size === 0) continue;
        out.push({ path: facadePath, blob: blobData });
      } catch {
        // Si una foto no está disponible, seguimos con las demás
      }
    }
    return out;
  },
};
