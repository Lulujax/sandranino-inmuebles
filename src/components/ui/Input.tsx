import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterCount?: { current: number; max: number };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, characterCount, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-sans">
              {label}
            </label>
            {characterCount && (
              <span
                className={cn(
                  'text-[11px] font-mono',
                  characterCount.current > characterCount.max
                    ? 'text-rose-600 font-bold'
                    : 'text-stone-400'
                )}
              >
                {characterCount.current}/{characterCount.max}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-text-heading placeholder-stone-400 font-sans',
            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs',
            error
              ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
              : 'border-stone-200 hover:border-stone-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-sans">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-stone-500 font-sans">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
