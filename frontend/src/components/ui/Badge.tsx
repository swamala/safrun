'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * SAFRUN Badge Component
 * Pill-shaped badges with consistent styling
 * Used for status indicators, tags, and labels
 */
const badgeVariants = cva(
  // Base styles - rounded-full per design spec
  [
    'inline-flex items-center justify-center gap-1.5',
    'font-semibold transition-colors duration-200',
    'rounded-full',
    'text-xs',
  ],
  {
    variants: {
      variant: {
        // Primary - SAFRUN Orange
        primary: [
          'bg-safrun-500/10 dark:bg-safrun-500/15',
          'text-safrun-600 dark:text-safrun-400',
          'border border-safrun-500/20 dark:border-safrun-500/30',
        ],
        // Success - Green
        success: [
          'bg-safety-500/10 dark:bg-safety-500/15',
          'text-safety-600 dark:text-safety-400',
          'border border-safety-500/20 dark:border-safety-500/30',
        ],
        // Danger - Red
        danger: [
          'bg-danger-500/10 dark:bg-danger-500/15',
          'text-danger-600 dark:text-danger-400',
          'border border-danger-500/20 dark:border-danger-500/30',
        ],
        // Warning - Amber
        warning: [
          'bg-amber-500/10 dark:bg-amber-500/15',
          'text-amber-600 dark:text-amber-400',
          'border border-amber-500/20 dark:border-amber-500/30',
        ],
        // Info - Blue (Sky Blue Accent)
        info: [
          'bg-accent-blue dark:bg-blue-500/15',
          'text-blue-600 dark:text-blue-400',
          'border border-blue-500/20 dark:border-blue-500/30',
        ],
        // Secondary - Muted
        secondary: [
          'bg-navy-100 dark:bg-white/10',
          'text-text-light-body dark:text-text-dark-body',
          'border border-navy-200/60 dark:border-white/10',
        ],
        // Outline - Border only
        outline: [
          'bg-transparent',
          'text-text-light-body dark:text-text-dark-body',
          'border-2 border-navy-200 dark:border-white/20',
        ],
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator */
  dot?: boolean;
  /** Dot color (defaults to variant color) */
  dotColor?: string;
  /** Optional icon on the left */
  leftIcon?: React.ReactNode;
  /** Optional icon on the right */
  rightIcon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  dotColor,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColor || 'bg-current'
          )}
        />
      )}
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </span>
  );
}

/**
 * Status Badge - Pre-configured badges for common statuses
 */
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
}

const statusConfig = {
  active: { variant: 'success' as const, label: 'Active', dot: true },
  inactive: { variant: 'secondary' as const, label: 'Inactive', dot: true },
  pending: { variant: 'warning' as const, label: 'Pending', dot: true },
  success: { variant: 'success' as const, label: 'Success', dot: false },
  error: { variant: 'danger' as const, label: 'Error', dot: false },
  warning: { variant: 'warning' as const, label: 'Warning', dot: false },
};

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dot={config.dot} {...props}>
      {children || config.label}
    </Badge>
  );
}

/**
 * Counter Badge - For notifications and counts
 */
interface CounterBadgeProps {
  count: number;
  max?: number;
  variant?: 'primary' | 'danger' | 'secondary';
  className?: string;
}

export function CounterBadge({ 
  count, 
  max = 99, 
  variant = 'danger',
  className 
}: CounterBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge 
      variant={variant} 
      size="sm" 
      className={cn('min-w-[20px] h-5', className)}
    >
      {displayCount}
    </Badge>
  );
}

export { badgeVariants };

