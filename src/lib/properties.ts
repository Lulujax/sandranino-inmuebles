import { Inmueble } from './types';
import { storage } from './storage';
import { STORAGE_KEYS } from './storage-keys';

export const propertiesStore = {
  getAll: (): Inmueble[] => storage.get<Inmueble[]>(STORAGE_KEYS.PROPERTIES, []),

  getById: (id: string): Inmueble | undefined =>
    propertiesStore.getAll().find((p) => p.id === id),

  save: (inmueble: Inmueble): Inmueble => {
    const current = propertiesStore.getAll();
    const exists = current.some((p) => p.id === inmueble.id);
    const updated = exists
      ? current.map((p) => (p.id === inmueble.id ? inmueble : p))
      : [inmueble, ...current];
    storage.set(STORAGE_KEYS.PROPERTIES, updated);
    return inmueble;
  },

  delete: (id: string): void => {
    const updated = propertiesStore.getAll().filter((p) => p.id !== id);
    storage.set(STORAGE_KEYS.PROPERTIES, updated);
  },

  update: (id: string, changes: Partial<Inmueble>): Inmueble | undefined => {
    const current = propertiesStore.getAll();
    let updatedProperty: Inmueble | undefined;
    const updated = current.map((p) => {
      if (p.id === id) {
        updatedProperty = {
          ...p,
          ...changes,
          updated_at: new Date().toISOString(),
        };
        return updatedProperty;
      }
      return p;
    });
    storage.set(STORAGE_KEYS.PROPERTIES, updated);
    return updatedProperty;
  },
};

