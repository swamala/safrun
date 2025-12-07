'use client';

import { cn } from '@/lib/utils';

/**
 * SAFRUN Card Component
 * Premium, modern card with consistent styling across light/dark modes
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ 
  children, 
  className, 
  variant = 'default', 
  padding = 'md',
  hover = false,
}: CardProps) {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    default: [
      'bg-white dark:bg-white/[0.03]',
      'border border-slate-200/80 dark:border-white/[0.06]',
    ],
    elevated: [
      'bg-white dark:bg-white/[0.03]',
      'border border-slate-200/80 dark:border-white/[0.06]',
      'shadow-lg shadow-slate-900/5 dark:shadow-black/20',
    ],
    glass: [
      'bg-white/80 dark:bg-white/[0.05]',
      'backdrop-blur-xl',
      'border border-white/30 dark:border-white/[0.08]',
    ],
    outline: [
      'bg-transparent',
      'border-2 border-slate-200 dark:border-white/10',
    ],
  };

  const hoverClasses = hover ? [
    'hover:border-orange-500/30 dark:hover:border-orange-500/30',
    'hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-black/30',
    'hover:-translate-y-1',
  ] : [];

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  as: Component = 'h3',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}) {
  return (
    <Component 
      className={cn(
        'font-display text-lg font-semibold',
        'text-slate-900 dark:text-white',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'mt-4 pt-4 border-t border-slate-200/80 dark:border-white/[0.06]',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stat Card - For displaying metrics
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-1 font-medium',
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Feature Card - For highlighting features
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  className?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  gradient = 'from-orange-500 to-amber-500',
  className 
}: FeatureCardProps) {
  return (
    <Card padding="md" hover className={cn('group', className)}>
      <div 
        className={cn(
          'w-12 h-12 rounded-xl mb-4 flex items-center justify-center',
          'bg-gradient-to-br text-white',
          'group-hover:scale-110 transition-transform duration-300',
          'shadow-lg',
          gradient
        )}
      >
        {icon}
      </div>
      <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
