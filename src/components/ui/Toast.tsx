'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast container bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 stroke-[1.75]" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 stroke-[1.75]" />,
            error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 stroke-[1.75]" />,
            info: <Info className="w-4 h-4 text-terracotta-light shrink-0 stroke-[1.75]" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-luxury-hover',
                'bg-brand-darker text-cream-50 text-xs font-sans border border-brand/40 animate-fade-in-up'
              )}
            >
              <div className="flex items-center gap-3">
                {icons[t.type]}
                <span className="font-medium text-stone-100 tracking-wide">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-stone-400 hover:text-white transition-colors p-1 ml-2 rounded"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
