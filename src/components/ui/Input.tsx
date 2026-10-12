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
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            {characterCount && (
              <span
                className={cn(
                  'text-xs',
                  characterCount.current > characterCount.max
                    ? 'text-red-500 font-semibold'
                    : 'text-gray-400'
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
            'w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

