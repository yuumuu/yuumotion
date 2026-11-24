import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'sm',
      loading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none';

    const variants: Record<string, string> = {
      primary:
        'bg-purple-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_12px_rgba(139,92,246,0.35)] hover:bg-purple-700 active:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500',
      secondary:
        'border border-zinc-200 bg-zinc-100 text-appflowy-text hover:bg-zinc-200/80 active:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 dark:text-appflowy-darkText dark:hover:bg-zinc-700',
      outline:
        'border border-appflowy-border bg-transparent text-appflowy-text hover:bg-zinc-100/70 dark:border-appflowy-darkBorder dark:text-appflowy-darkText dark:hover:bg-zinc-800/60',
      ghost:
        'bg-transparent text-appflowy-muted hover:bg-zinc-100 hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:bg-zinc-800 dark:hover:text-appflowy-darkText',
      danger:
        'border border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 active:bg-rose-500/25 dark:text-rose-400'
    };

    const sizes: Record<string, string> = {
      xs: 'h-6 px-2 text-[11px] rounded-md gap-1',
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-xs font-semibold rounded-xl gap-2',
      lg: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2.5'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';