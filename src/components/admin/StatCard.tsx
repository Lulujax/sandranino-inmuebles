import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand',
  iconBg = 'bg-brand/5',
  className = '',
}) => {
  const isNumeric = typeof value === 'number';

  return (
    <div
      className={cn(
        'bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-card hover:shadow-luxury transition-all duration-200 flex items-center justify-between',
        className
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans">{title}</p>
        <p className="font-serif text-3xl font-normal text-text-heading mt-1.5 tracking-tight">
          {isNumeric ? (
            <AnimatedCounter value={value as number} duration={800} />
          ) : (
            value
          )}
        </p>
        {subtitle && <p className="text-xs text-stone-400 mt-1 font-sans">{subtitle}</p>}
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-stone-100', iconBg, iconColor)}>
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
    </div>
  );
};
