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
    default: 'bg-[#edf3f9] text-[#1e3a5f] border border-[#d4e2f0]',
    publicado: 'bg-[#edf7ee] text-[#226738] border border-[#cbe8cf]',
    borrador: 'bg-[#fef7eb] text-[#8f5b12] border border-[#f9dfb5]',
    pausado: 'bg-[#f3f0e8] text-[#555047] border border-[#ded7c8]',
    vendido: 'bg-[#f9ede7] text-[#a85d3d] border border-[#f0d4c7]',
    venta: 'bg-[#edf3f9] text-[#1e3a5f] border border-[#d4e2f0]',
    alquiler: 'bg-[#f9ede7] text-[#a85d3d] border border-[#f0d4c7]',
    gray: 'bg-[#f3f0e8] text-[#555047] border border-[#ded7c8]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2.5 py-0.5 font-medium tracking-wider uppercase',
    md: 'text-[11px] px-3 py-1 font-medium tracking-wider uppercase',
  };

  const content = children || status || operation;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-body transition-colors',
        variantStyles[computedVariant as keyof typeof variantStyles] || variantStyles.default,
        sizeStyles[size],
        className
      )}
    >
      {content}
    </span>
  );
};
