import { useSyncExternalStore } from 'react';
import { Inmueble } from './types';
import { downloadBulkPropertiesZip, BulkProgress } from './property-zip-exporter';

export interface ZipExportState {
  isExporting: boolean;
  progress: BulkProgress | null;
  error: string | null;
}

type Listener = () => void;

class ZipExportManager {
  private state: ZipExportState = {
    isExporting: false,
    progress: null,
    error: null,
  };

  private listeners = new Set<Listener>();
  private abortController: AbortController | null = null;
  private beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

  public getState(): ZipExportState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error en listener de exportación ZIP:', err);
      }
    }
  }

  private setState(partial: Partial<ZipExportState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public isBusy(): boolean {
    return this.state.isExporting;
  }

  public async startExport(
    properties: Inmueble[],
    filename: string,
    onSuccess?: () => void,
    onError?: (errorMsg: string) => void
  ): Promise<boolean> {
    if (this.state.isExporting) {
      return false;
    }

    if (!properties || properties.length === 0) {
      return false;
    }

    this.abortController = new AbortController();
    this.setState({
      isExporting: true,
      progress: {
        current: 0,
        total: properties.length,
        title: 'Preparando descarga...',
      },
      error: null,
    });

    if (typeof window !== 'undefined') {
      this.beforeUnloadHandler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    try {
      await downloadBulkPropertiesZip(properties, filename, {
        signal: this.abortController.signal,
        onProgress: (prog) => {
          this.setState({ progress: prog });
        },
      });

      if (!this.abortController?.signal.aborted) {
        onSuccess?.();
      }
      return true;
    } catch (err: unknown) {
      if (this.abortController?.signal.aborted) {
        console.info('Exportación de ZIP cancelada por el usuario');
      } else {
        console.error('Error durante la exportación de ZIP:', err);
        const msg = (err as Error)?.message || 'Error al generar el archivo ZIP';
        this.setState({ error: msg });
        onError?.(msg);
      }
      return false;
    } finally {
      if (typeof window !== 'undefined' && this.beforeUnloadHandler) {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        this.beforeUnloadHandler = null;
      }
      this.abortController = null;
      this.setState({
        isExporting: false,
        progress: null,
      });
    }
  }

  public cancelExport(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (typeof window !== 'undefined' && this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
    this.setState({
      isExporting: false,
      progress: null,
      error: null,
    });
  }
}

export const zipExportManager = new ZipExportManager();

/**
 * Hook de React para suscribirse reactivamente al progreso global de exportación ZIP.
 */
export function useZipExport(): ZipExportState {
  return useSyncExternalStore(
    (onStoreChange) => zipExportManager.subscribe(onStoreChange),
    () => zipExportManager.getState(),
    () => zipExportManager.getState()
  );
}
