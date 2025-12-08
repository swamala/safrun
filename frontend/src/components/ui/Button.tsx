'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * SAFRUN Button Component
 * Premium pill-shaped buttons with SAFRUN orange gradient
 * Follows design system: rounded-full, 18-24px radius, soft shadows
 */
const buttonVariants = cva(
  // Base styles - All buttons are pill-shaped (rounded-full)
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold transition-all duration-300 ease-out-expo',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'rounded-full',  // Pill style per spec
    'font-sans',
  ],
  {
    variants: {
      variant: {
        // Primary - SAFRUN Orange Gradient (#FF8A00 → #FF5E00)
        primary: [
          'text-white',
          'bg-gradient-to-r from-safrun-start to-safrun-end',
          'shadow-glow-orange',
          'hover:shadow-glow-orange-lg hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-glow-orange',
          'focus-visible:ring-safrun-500',
        ],
        // Secondary - Navy Background (#0E172A)
        secondary: [
          'text-white',
          'bg-navy-900',
          'shadow-soft-sm',
          'hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-soft',
          'active:translate-y-0',
          'dark:bg-white/10 dark:hover:bg-white/15',
          'focus-visible:ring-navy-500',
        ],
        // Danger - Red Gradient
        danger: [
          'text-white',
          'bg-gradient-to-r from-danger-500 to-danger-600',
          'shadow-glow-red',
          'hover:shadow-glow-red-lg hover:-translate-y-0.5',
          'active:translate-y-0',
          'focus-visible:ring-danger-500',
        ],
        // Success - Green Gradient
        success: [
          'text-white',
          'bg-gradient-to-r from-safety-500 to-safety-600',
          'shadow-glow-green',
          'hover:shadow-glow-green-lg hover:-translate-y-0.5',
          'active:translate-y-0',
          'focus-visible:ring-safety-500',
        ],
        // Ghost - Minimal/Transparent
        ghost: [
          'text-text-light-body dark:text-text-dark-body',
          'bg-transparent',
          'hover:bg-navy-100 dark:hover:bg-white/5',
          'hover:text-text-light-heading dark:hover:text-text-dark-heading',
          'focus-visible:ring-navy-400',
        ],
        // Outline - Border only with hover fill
        outline: [
          'border-2',
          'border-navy-200 dark:border-white/10',
          'bg-transparent',
          'text-text-light-heading dark:text-text-dark-body',
          'hover:border-safrun-500 hover:bg-safrun-500/10',
          'dark:hover:border-safrun-500/50 dark:hover:bg-safrun-500/10',
          'focus-visible:ring-safrun-500',
        ],
        // Link - Text only with underline
        link: [
          'text-safrun-500 dark:text-safrun-400',
          'hover:text-safrun-600 dark:hover:text-safrun-300',
          'underline-offset-4 hover:underline',
          'focus-visible:ring-safrun-500',
          '!p-0 !h-auto',
        ],
      },
      size: {
        sm: 'h-9 px-5 text-sm font-medium',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 py-4 text-lg',
        xl: 'h-14 px-10 py-4 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };

/**
 * IconButton - Circular icon-only button
 */
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('!rounded-full', className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
