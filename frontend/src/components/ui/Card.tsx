'use client';

import { cn } from '@/lib/utils';

/**
 * SAFRUN Card Component
 * Premium cards with soft, diffuse shadows (blur 24-32)
 * Border radius: 18-24px per design spec
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
  const baseClasses = 'rounded-lg overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    default: [
      'bg-white dark:bg-white/[0.03]',
      'border border-navy-200/60 dark:border-white/[0.06]',
      'shadow-card dark:shadow-card-dark',
    ],
    elevated: [
      'bg-white dark:bg-white/[0.03]',
      'border border-navy-200/60 dark:border-white/[0.06]',
      'shadow-soft-md dark:shadow-soft-lg',
    ],
    glass: [
      'bg-white/85 dark:bg-white/[0.05]',
      'backdrop-blur-xl',
      'border border-white/40 dark:border-white/[0.08]',
      'shadow-soft-md dark:shadow-soft-lg',
    ],
    outline: [
      'bg-transparent',
      'border-2 border-navy-200 dark:border-white/10',
    ],
  };

  const hoverClasses = hover ? [
    'hover:border-safrun-500/30 dark:hover:border-safrun-500/30',
    'hover:shadow-card-hover dark:hover:shadow-card-dark-hover',
    'hover:-translate-y-1',
    'cursor-pointer',
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
        'text-lg font-semibold font-sans',
        'text-text-light-heading dark:text-text-dark-heading',
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
    <p className={cn(
      'text-sm mt-1',
      'text-text-light-body dark:text-text-dark-body',
      className
    )}>
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
        'mt-4 pt-4 border-t border-navy-200/60 dark:border-white/[0.06]',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stat Card - For displaying metrics with icon
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  iconBgColor = 'bg-safrun-500/10',
  iconColor = 'text-safrun-500',
  className 
}: StatCardProps) {
  return (
    <Card padding="md" className={className}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBgColor
          )}>
            <div className={iconColor}>{icon}</div>
          </div>
        )}
        <div>
          <p className="text-sm text-text-light-body dark:text-text-dark-body">{label}</p>
          <p className="text-2xl font-bold text-text-light-heading dark:text-text-dark-heading">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-1 font-medium',
              trend.isPositive ? 'text-safety-500' : 'text-danger-500'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Feature Card - For highlighting features with gradient icons
 */
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
  shadowColor?: string;
  className?: string;
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  gradient = 'from-safrun-start to-safrun-end',
  shadowColor = 'shadow-glow-orange/50',
  className 
}: FeatureCardProps) {
  return (
    <Card padding="md" hover className={cn('group', className)}>
      <div 
        className={cn(
          'w-14 h-14 rounded-xl mb-5 flex items-center justify-center',
          'bg-gradient-to-br text-white',
          'group-hover:scale-110 transition-transform duration-300',
          gradient,
          shadowColor
        )}
      >
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-text-light-heading dark:text-text-dark-heading mb-2">
        {title}
      </h4>
      <p className="text-text-light-body dark:text-text-dark-body leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

/**
 * Action Card - Card with action button footer
 */
interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function ActionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
}: ActionCardProps) {
  return (
    <Card padding="none" className={className}>
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-safrun-500/10 flex items-center justify-center text-safrun-500">
                {icon}
              </div>
            )}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {action}
        </div>
      </CardHeader>
      {children && (
        <CardContent className="p-6 pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
