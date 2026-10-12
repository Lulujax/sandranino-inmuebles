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
  topBorderColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#1e3a5f]',
  iconBg = 'bg-[#1e3a5f]/8',
  topBorderColor = 'border-t-[#1e3a5f]',
  className = '',
}) => {
  const isNumeric = typeof value === 'number';

  return (
    <div
      className={cn(
        'bg-[#faf9f6] p-5 sm:p-6 rounded-2xl border border-stone-200/80 border-t-[3px] shadow-card hover:shadow-luxury transition-all duration-200 flex items-center justify-between font-body',
        topBorderColor,
        className
      )}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500 font-body">
          {title}
        </p>
        <p className="font-display text-3xl sm:text-4xl font-semibold text-text-heading mt-1.5 tracking-tight">
          {isNumeric ? (
            <AnimatedCounter value={value as number} duration={800} />
          ) : (
            value
          )}
        </p>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-1 font-body">{subtitle}</p>
        )}
      </div>
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-stone-200/60',
          iconBg,
          iconColor
        )}
      >
        <Icon size={20} strokeWidth={1.5} />
      </div>
    </div>
  );
};
