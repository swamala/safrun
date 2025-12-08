'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * SAFRUN Input Component
 * Premium inputs with 14-16px font, soft borders, subtle shadows
 * Border radius: 18px per design spec
 */
const inputVariants = cva(
  // Base styles
  [
    'w-full transition-all duration-200',
    'bg-white dark:bg-white/5',
    'border border-navy-200/60 dark:border-white/10',
    'text-text-light-heading dark:text-text-dark-heading',
    'placeholder:text-text-light-body/50 dark:placeholder:text-text-dark-body/50',
    'focus:outline-none focus:ring-2 focus:ring-safrun-500/20 dark:focus:ring-safrun-400/25',
    'focus:border-safrun-500/50 dark:focus:border-safrun-400/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'font-sans text-[15px]',
    'shadow-soft-xs dark:shadow-none',
    'rounded-[18px]',  // 18px radius per spec
  ],
  {
    variants: {
      inputSize: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-4',
        lg: 'h-14 px-5 text-base',
      },
      hasError: {
        true: [
          'border-danger-500 dark:border-danger-400',
          'focus:ring-danger-500/20 dark:focus:ring-danger-400/25',
          'focus:border-danger-500 dark:focus:border-danger-400',
        ],
        false: '',
      },
      hasIcon: {
        left: 'pl-12',
        right: 'pr-12',
        both: 'pl-12 pr-12',
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
            className="block text-sm font-medium text-text-light-heading dark:text-text-dark-body"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light-body/60 dark:text-text-dark-body/60 pointer-events-none">
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
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light-body/60 dark:text-text-dark-body/60">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-danger-500 dark:text-danger-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-text-light-body dark:text-text-dark-body">{hint}</p>
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
    'w-full transition-all duration-200 resize-none',
    'bg-white dark:bg-white/5',
    'border border-navy-200/60 dark:border-white/10',
    'text-text-light-heading dark:text-text-dark-heading',
    'placeholder:text-text-light-body/50 dark:placeholder:text-text-dark-body/50',
    'focus:outline-none focus:ring-2 focus:ring-safrun-500/20 dark:focus:ring-safrun-400/25',
    'focus:border-safrun-500/50 dark:focus:border-safrun-400/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'font-sans text-[15px] p-4',
    'shadow-soft-xs dark:shadow-none',
    'rounded-[18px]',
  ],
  {
    variants: {
      hasError: {
        true: [
          'border-danger-500 dark:border-danger-400',
          'focus:ring-danger-500/20 dark:focus:ring-danger-400/25',
        ],
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
            className="block text-sm font-medium text-text-light-heading dark:text-text-dark-body"
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
          <p className="text-sm text-danger-500 dark:text-danger-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-text-light-body dark:text-text-dark-body">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Search Input with built-in search icon
 */
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch((e.target as HTMLInputElement).value);
          }
        }}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
