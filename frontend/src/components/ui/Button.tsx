'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * SAFRUN Button Component
 * Premium, modern button with consistent styling across the app
 */
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // Primary - Gradient orange (main CTA)
        primary: [
          'text-white rounded-xl',
          'bg-gradient-to-r from-orange-500 to-amber-500',
          'shadow-[0_4px_24px_rgba(255,140,0,0.35)]',
          'hover:shadow-[0_8px_32px_rgba(255,140,0,0.45)]',
          'hover:-translate-y-0.5 active:translate-y-0',
          'focus-visible:ring-orange-500',
        ],
        // Secondary - Surface with border
        secondary: [
          'rounded-xl border',
          'bg-white dark:bg-white/5',
          'border-slate-200 dark:border-white/10',
          'text-slate-900 dark:text-white',
          'hover:border-orange-500 dark:hover:border-orange-500/50',
          'hover:-translate-y-0.5 active:translate-y-0',
          'focus-visible:ring-slate-500 dark:focus-visible:ring-slate-400',
        ],
        // Danger - Red for destructive actions
        danger: [
          'text-white rounded-xl',
          'bg-red-500 hover:bg-red-600',
          'shadow-[0_4px_24px_rgba(239,68,68,0.35)]',
          'hover:shadow-[0_8px_32px_rgba(239,68,68,0.45)]',
          'hover:-translate-y-0.5 active:translate-y-0',
          'focus-visible:ring-red-500',
        ],
        // Success - Green for positive actions
        success: [
          'text-white rounded-xl',
          'bg-green-500 hover:bg-green-600',
          'shadow-[0_4px_24px_rgba(34,197,94,0.35)]',
          'hover:shadow-[0_8px_32px_rgba(34,197,94,0.45)]',
          'hover:-translate-y-0.5 active:translate-y-0',
          'focus-visible:ring-green-500',
        ],
        // Ghost - Minimal style
        ghost: [
          'rounded-xl',
          'text-slate-600 dark:text-slate-400',
          'hover:bg-slate-100 dark:hover:bg-white/5',
          'hover:text-slate-900 dark:hover:text-white',
          'focus-visible:ring-slate-500',
        ],
        // Outline - Border only
        outline: [
          'rounded-xl border-2',
          'border-slate-200 dark:border-white/10',
          'bg-transparent',
          'text-slate-700 dark:text-slate-300',
          'hover:border-orange-500 dark:hover:border-orange-500/50',
          'hover:bg-orange-50 dark:hover:bg-orange-500/10',
          'focus-visible:ring-orange-500',
        ],
        // Link - Text only
        link: [
          'text-orange-500 dark:text-orange-400',
          'hover:text-orange-600 dark:hover:text-orange-300',
          'underline-offset-4 hover:underline',
          'focus-visible:ring-orange-500',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 py-4 text-lg',
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
