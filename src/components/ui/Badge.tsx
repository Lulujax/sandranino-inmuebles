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
  // Determine variant automatically if status or operation is provided
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
    default: 'bg-brand/10 text-brand border border-brand/20',
    publicado: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    borrador: 'bg-amber-100 text-amber-800 border border-amber-200',
    pausado: 'bg-gray-100 text-gray-700 border border-gray-200',
    vendido: 'bg-red-100 text-red-800 border border-red-200',
    venta: 'bg-blue-100 text-blue-800 border border-blue-200',
    alquiler: 'bg-purple-100 text-purple-800 border border-purple-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const content = children || status || operation;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-wide',
        variantStyles[computedVariant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size],
        className
      )}
    >
      {content}
    </span>
  );
};

