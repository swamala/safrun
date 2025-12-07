'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * SAFRUN Input Component
 * Premium, modern input field with consistent styling
 */
const inputVariants = cva(
  // Base styles
  [
    'w-full rounded-xl transition-all duration-200',
    'bg-white dark:bg-white/5',
    'border border-slate-200 dark:border-white/10',
    'text-slate-900 dark:text-white',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-400/30',
    'focus:border-orange-500/50 dark:focus:border-orange-400/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'font-sans',
  ],
  {
    variants: {
      inputSize: {
        sm: 'h-10 px-3 text-sm',
        md: 'h-12 px-4 text-base',
        lg: 'h-14 px-5 text-lg',
      },
      hasError: {
        true: 'border-red-500 dark:border-red-400 focus:ring-red-500/30 dark:focus:ring-red-400/30 focus:border-red-500 dark:focus:border-red-400',
        false: '',
      },
      hasIcon: {
        left: 'pl-11',
        right: 'pr-11',
        both: 'pl-11 pr-11',
        none: '',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      hasError: false,
      hasIcon: 'none',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputSize,
      hasError,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      wrapperClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const hasIconPosition = leftIcon && rightIcon ? 'both' : leftIcon ? 'left' : rightIcon ? 'right' : 'none';

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({
                inputSize,
                hasError: !!error || hasError,
                hasIcon: hasIconPosition,
                className,
              })
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };

/**
 * Textarea Component
 */
const textareaVariants = cva(
  [
    'w-full rounded-xl transition-all duration-200 resize-none',
    'bg-white dark:bg-white/5',
    'border border-slate-200 dark:border-white/10',
    'text-slate-900 dark:text-white',
    'placeholder:text-slate-400 dark:placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:focus:ring-orange-400/30',
    'focus:border-orange-500/50 dark:focus:border-orange-400/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'font-sans p-4',
  ],
  {
    variants: {
      hasError: {
        true: 'border-red-500 dark:border-red-400',
        false: '',
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(textareaVariants({ hasError: !!error || hasError, className }))}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

