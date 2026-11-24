import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-appflowy-muted dark:text-appflowy-darkMuted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={generatedId}
            className={`h-8 w-full rounded-lg border bg-appflowy-bg px-3 text-xs text-appflowy-text placeholder-neutral-400 transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 dark:bg-appflowy-darkBg dark:text-appflowy-darkText ${
              error
                ? 'border-rose-400 focus:ring-rose-500 dark:border-rose-700'
                : 'border-appflowy-border hover:border-neutral-300 dark:border-appflowy-darkBorder dark:hover:border-neutral-700'
            } ${leftIcon ? 'pl-8' : ''} ${rightIcon ? 'pr-8' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-appflowy-muted dark:text-appflowy-darkMuted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';