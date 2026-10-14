import { Inmueble } from './types';
import { createClient } from './supabase/client';

/**
 * Límites de inventario recomendados para el plan gratuito de Supabase
 * - Almacenamiento gratuito en Supabase: 1 GB (1,000 MB)
 * - Con fotos optimizadas por inmueble (~2 MB por ficha), 350 inmuebles ocupan ~700 MB
 * - Permite un amplio inventario de 350 propiedades manteniéndose dentro de la cuota gratuita
 */
export const INVENTORY_LIMIT = 350;
export const STORAGE_LIMIT_MB = 1000;
export const ESTIMATED_MB_PER_PROPERTY = 2.0;

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
    notes: _notes,
    internal_code: _internalCode,
    address,
    ...rest
  } = inmueble;

  return {
    ...rest,
    address: inmueble.show_exact_location ? address : undefined,
  };
}

export const propertiesStore = {
  getAll: async (userId?: string): Promise<Inmueble[]> => {
    const supabase = createClient();
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
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
    return (data as Inmueble[]) || [];
  },

  getPublic: async (): Promise<Inmueble[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Inmueble[]) || [];
  },

  getById: async (id: string): Promise<Inmueble | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inmuebles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as Inmueble) || null;
  },

  getPublicById: async (id: string): Promise<Inmueble | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('inmuebles_publicos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as Inmueble) || null;
  },

  save: async (inmueble: Partial<Inmueble>): Promise<Inmueble> => {
    const supabase = createClient();
    const {
      id,
      user_id: _userId,
      created_at: _createdAt,
      updated_at: _updatedAt,
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
      return data as Inmueble;
    }

    const { data, error } = await supabase
      .from('inmuebles')
      .insert([payload])
      .select('*')
      .single();
    if (error) throw error;
    return data as Inmueble;
  },

  update: async (id: string, changes: Partial<Inmueble>): Promise<Inmueble> => {
    const supabase = createClient();
    const {
      id: _id,
      user_id: _userId,
      created_at: _createdAt,
      ...payload
    } = changes;

    const { data, error } = await supabase
      .from('inmuebles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Inmueble;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from('inmuebles').delete().eq('id', id);
    if (error) throw error;
  },

  incrementVisits: async (id: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.rpc('increment_property_visits', {
      property_id: id,
    });
    if (error) throw error;
  },
};

