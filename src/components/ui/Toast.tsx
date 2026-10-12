'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const shouldReduceMotion = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (rawMessage: string, type: ToastType = 'info') => {
      // Eliminar cualquier emoji que provenga de llamadas antiguas (Regla: Cero emojis)
      const cleanMessage = rawMessage.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\uFE0F\s]+/u, '').trim();
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message: cleanMessage }]);

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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none font-body">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 size={18} strokeWidth={1.5} className="text-emerald-400 shrink-0" />,
              warning: <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-300 shrink-0" />,
              error: <AlertCircle size={18} strokeWidth={1.5} className="text-rose-400 shrink-0" />,
              info: <Info size={18} strokeWidth={1.5} className="text-terracotta-light shrink-0" />,
            };

            return (
              <motion.div
                key={t.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-luxury-hover',
                  'bg-brand-darker text-cream-50 text-xs font-body border border-brand/40'
                )}
              >
                <div className="flex items-center gap-3">
                  {icons[t.type]}
                  <span className="font-normal text-stone-100 tracking-wide">{t.message}</span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-stone-400 hover:text-white transition-colors p-1 ml-2 rounded cursor-pointer"
                  aria-label="Cerrar notificación"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
