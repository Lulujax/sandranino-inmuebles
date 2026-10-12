export type OperationType = 'Venta' | 'Alquiler';

export type PropertyType =
  | 'Casa'
  | 'Apartamento'
  | 'Galpón'
  | 'Local'
  | 'Terreno'
  | 'Oficina';

export type PropertyStatus = 'Publicado' | 'Borrador' | 'Pausado' | 'Vendido';

export interface Inmueble {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  operation: OperationType;
  type: PropertyType;
  state: string;
  city: string;
  sector?: string;
  address?: string; // Interno
  show_exact_location?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  built_area?: number;
  land_area?: number;
  year?: number;
  total_area?: number;
  height?: number;
  offices?: number;
  price: number;
  currency: 'USD';
  internal_code?: string; // Interno
  notes?: string; // Interno
  images: string[];
  status: PropertyStatus;
  visits: number;
  created_at: string;
  updated_at: string;
}

export interface PerfilAsesor {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  whatsapp: string; // formato internacional e.g. 584241234567
  email?: string;
  instagram?: string;
  facebook?: string;
  hero_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FilterState {
  searchQuery: string;
  type: string; // 'Todos' or PropertyType
  operation: string; // 'Todas' or OperationType
  city: string; // 'Todas' or specific city
  maxPrice: string; // e.g. '50000', '100000', '200000', 'all'
  sortBy: 'recent' | 'price_desc' | 'price_asc' | 'area_desc' | 'area_asc';
}

export interface AdminFilterState {
  searchQuery: string;
  status: string; // 'Todos' | PropertyStatus
  operation: string; // 'Todas' | OperationType
  type: string; // 'Todos' | PropertyType
  sortBy: 'recent' | 'oldest' | 'price_desc' | 'price_asc';
}

export interface WizardFormData {
  operation?: OperationType;
  type?: PropertyType;
  state: string;
  city: string;
  sector: string;
  address: string;
  show_exact_location: boolean;
  // Dynamic fields
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  built_area?: number;
  land_area?: number;
  year?: number;
  total_area?: number;
  height?: number;
  offices?: number;
  // Photos
  images: string[];
  // Description
  title: string;
  description: string;
  // Price & internals
  price?: number;
  internal_code: string;
  notes: string;
}

