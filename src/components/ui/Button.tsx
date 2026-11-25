import * as React from 'react';
import { Spinner } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'soft' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-project-solid text-white shadow-tactile-btn hover:brightness-105 active:translate-y-[1px]',
  soft:
    'bg-project-soft text-project-accent hover:brightness-95 dark:hover:brightness-110 active:translate-y-[1px]',
  secondary:
    'bg-surface text-text border border-border shadow-card-rest hover:bg-hover active:translate-y-[1px]',
  ghost:
    'bg-transparent text-muted hover:bg-hover hover:text-text active:translate-y-[1px]',
  danger:
    'bg-danger text-white shadow-tactile-btn hover:brightness-105 active:translate-y-[1px]'
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-[11px] rounded-lg gap-1',
  sm: 'h-8 px-3 text-xs rounded-xl',
  md: 'h-9 px-3.5 text-sm rounded-xl',
  lg: 'h-11 px-5 text-sm rounded-xl'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-project-accent',
          'disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
