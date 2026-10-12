import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-0';

  const variantStyles = {
    primary:
      'bg-brand hover:bg-brand-darker text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-brand rounded-lg',
    secondary:
      'bg-stone-100 hover:bg-stone-200 text-stone-800 focus:ring-stone-300 rounded-lg hover:-translate-y-0.5',
    outline:
      'border border-stone-300 bg-transparent hover:bg-stone-50/80 text-stone-800 focus:ring-brand rounded-lg hover:-translate-y-0.5',
    terracotta:
      'bg-terracotta hover:bg-terracotta-dark text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-terracotta rounded-lg',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-rose-600 rounded-lg',
    ghost:
      'bg-transparent hover:bg-stone-100/70 text-stone-700 focus:ring-stone-300 rounded-lg',
    success:
      'bg-[#1d6447] hover:bg-[#164e37] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-[#1d6447] rounded-lg',
  };

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 tracking-wide',
    md: 'text-sm px-4.5 py-2.5 gap-2 tracking-wide',
    lg: 'text-base px-6 py-3.5 gap-2.5 tracking-wide',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
