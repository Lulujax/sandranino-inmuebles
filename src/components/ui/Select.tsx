import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none px-3.5 py-2.5 pr-10 bg-white border rounded-lg text-sm text-text-heading font-sans',
              'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand shadow-xs',
              error
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                : 'border-stone-200 hover:border-stone-300',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
            <ChevronDown className="w-4 h-4 stroke-[1.5]" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-sans">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-stone-500 font-sans">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
