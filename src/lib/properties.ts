import { Inmueble } from './types';
import { createClient } from './supabase/client';
import { parseContactInfo } from './utils';

/**
 * Límites de inventario para el plan gratuito
 * - Capacidad gratuita incluida: 1 GB (1,000 MB)
 * - Por ficha reservamos ~2.4 MB MEDIDO con el uso real (oct 2026):
 *   fotos públicas comprimidas al subir (~1.71 MB/ficha con 12.8 fotos)
 *   + hasta 3 fachadas privadas comprimidas (~0.72 MB, bucket aparte)
 * - 350 inmuebles ocupan ~840 MB, dejando ~160 MB para perfil, BD y sistema
 */
export const INVENTORY_LIMIT = 350;
export const STORAGE_LIMIT_MB = 1000;
export const ESTIMATED_MB_PER_PROPERTY = 2.4;

export interface InventoryCapacity {
  total: number;
  max: number;
  percentage: number;
  estimatedStorageMb: number;
  maxStorageMb: number;
  isFull: boolean;
  isWarning: boolean;
}

export function calculateInventoryCapacity(count: number): InventoryCapacity {
  const max = INVENTORY_LIMIT;
  const percentage = Math.min(Math.round((count / max) * 100), 100);
  const estimatedStorageMb = Math.round(count * ESTIMATED_MB_PER_PROPERTY);
  return {
    total: count,
    max,
    percentage,
    estimatedStorageMb,
    maxStorageMb: STORAGE_LIMIT_MB,
    isFull: count >= max,
    isWarning: count >= max * 0.8,
  };
}

export function toPublicProperty(inmueble: Inmueble): Inmueble {
  const {
    owner_name: _ownerName,
    owner_phone: _ownerPhone,
    contact_type: _contactType,
    notes: _notes,
    address,
    ...rest
  } = inmueble;

  return {
    ...rest,
    address: inmueble.show_exact_location ? address : undefined,
  };
}

let propertiesCache: {
  data: Inmueble[];
  timestamp: number;
  userId?: string;
} | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 segundos de caché en memoria

export const propertiesStore = {
  getAll: async (userId?: string, forceRefresh = false): Promise<Inmueble[]> => {
    const supabase = createClient();
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      targetUserId = sessionData.session?.user?.id;
      if (!targetUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }
    }

    // Retornar caché en memoria si está vigente para navegación instantánea (0ms)
    if (
      !forceRefresh &&
      propertiesCache &&
      propertiesCache.userId === targetUserId &&
      Date.now() - propertiesCache.timestamp < CACHE_TTL_MS
    ) {
      return propertiesCache.data;
    }

    let query = supabase
      .from('inmuebles')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    const result = ((data as Inmueble[]) || []).map((p) => ({
      ...p,
      contact_type: p.contact_type || parseContactInfo(p).type,
    }));

    // Guardar en caché
    propertiesCache = {
      data: result,
      timestamp: Date.now(),
      userId: targetUserId,
    };

    return result;
  },

  getPublic: async (): Promise<Inmueble[]> => {
    const supabase = createClient();

    // Lectura directa de publicados (incluye el correlativo público de cada ficha)
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .eq('status', 'Publicado')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return ((data as Inmueble[]) || []).map(toPublicProperty);
    }

    // Respaldo: vista pública (por si la tabla no estuviera accesible)
    const { data: viewData, error: viewError } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .order('created_at', { ascending: false });
    if (viewError) throw viewError;
    return (viewData as Inmueble[]) || [];
  },

  getById: async (id: string): Promise<Inmueble | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const item = data as Inmueble;
    return {
      ...item,
      contact_type: item.contact_type || parseContactInfo(item).type,
    };
  },

  getPublicById: async (id: string): Promise<Inmueble | null> => {
    const supabase = createClient();

    // Lectura directa del publicado (incluye el correlativo público de la ficha)
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .eq('id', id)
      .eq('status', 'Publicado')
      .maybeSingle();

    if (!error && data) {
      return toPublicProperty(data as Inmueble);
    }

    // Respaldo: vista pública (por si la tabla no estuviera accesible)
    const { data: viewData, error: viewError } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (viewError) throw viewError;
    return (viewData as Inmueble) || null;
  },

  save: async (inmueble: Partial<Inmueble>): Promise<Inmueble> => {
    const supabase = createClient();
    const {
      id,
      user_id: _userId,
      created_at: _createdAt,
      updated_at: _updatedAt,
      contact_type: _contactType,
      ...payload
    } = inmueble;

    // Si viene un UUID válido existente, actualizamos; de lo contrario, insertamos (user_id automático por default auth.uid())
    const isUuid =
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const { data, error } = await supabase
        .from('inmuebles')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      propertiesCache = null;
      const saved = data as Inmueble;
      return {
        ...saved,
        contact_type: inmueble.contact_type || parseContactInfo(saved).type,
      };
    }

    const { data, error } = await supabase
      .from('inmuebles')
      .insert([payload])
      .select('*')
      .single();
    if (error) throw error;
    propertiesCache = null;
    const saved = data as Inmueble;
    return {
      ...saved,
      contact_type: inmueble.contact_type || parseContactInfo(saved).type,
    };
  },

  update: async (id: string, changes: Partial<Inmueble>): Promise<Inmueble> => {
    const supabase = createClient();
    const {
      id: _id,
      user_id: _userId,
      created_at: _createdAt,
      contact_type: _contactType,
      ...payload
    } = changes;

    const { data, error } = await supabase
      .from('inmuebles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    propertiesCache = null;
    const updated = data as Inmueble;
    return {
      ...updated,
      contact_type: changes.contact_type || parseContactInfo(updated).type,
    };
  },

  delete: async (id: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from('inmuebles').delete().eq('id', id);
    if (error) throw error;
    propertiesCache = null;
  },

  incrementVisits: async (id: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.rpc('increment_property_visits', {
      property_id: id,
    });
    if (error) throw error;
  },
};

