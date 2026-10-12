import React from 'react';
import { cn } from '@/lib/utils';
import { PropertyStatus, OperationType } from '@/lib/types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'default'
    | 'publicado'
    | 'borrador'
    | 'pausado'
    | 'vendido'
    | 'venta'
    | 'alquiler'
    | 'gray';
  status?: PropertyStatus;
  operation?: OperationType;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  operation,
  className,
  size = 'md',
}) => {
  let computedVariant = variant || 'default';

  if (status) {
    switch (status) {
      case 'Publicado':
        computedVariant = 'publicado';
        break;
      case 'Borrador':
        computedVariant = 'borrador';
        break;
      case 'Pausado':
        computedVariant = 'pausado';
        break;
      case 'Vendido':
        computedVariant = 'vendido';
        break;
    }
  } else if (operation) {
    switch (operation) {
      case 'Venta':
        computedVariant = 'venta';
        break;
      case 'Alquiler':
        computedVariant = 'alquiler';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-brand/10 text-brand-dark border border-brand/20',
    publicado: 'bg-emerald-50 text-emerald-800 border border-emerald-200/70',
    borrador: 'bg-amber-50 text-amber-800 border border-amber-200/70',
    pausado: 'bg-stone-100 text-stone-700 border border-stone-200',
    vendido: 'bg-terracotta/10 text-terracotta-dark border border-terracotta/30',
    venta: 'bg-brand/10 text-brand-dark border border-brand/20',
    alquiler: 'bg-terracotta/10 text-terracotta-dark border border-terracotta/30',
    gray: 'bg-stone-100 text-stone-600 border border-stone-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wider uppercase',
    md: 'text-[11px] px-2.5 py-1 font-semibold tracking-widest uppercase',
  };

  const content = children || status || operation;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-sans transition-colors',
        variantStyles[computedVariant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size],
        className
      )}
    >
      {content}
    </span>
  );
};
