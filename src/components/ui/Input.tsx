import React from 'react';
import { cn } from '../../lib/cn';

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
          <label htmlFor={generatedId} className="block text-xs font-semibold text-text">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={generatedId}
            className={cn(
              'h-8 w-full rounded-xl border bg-surface px-3 text-xs text-text placeholder:text-muted transition-all duration-150',
              'focus:outline-none focus:border-project-accent focus:ring-2 focus:ring-project-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-danger focus:ring-danger/20'
                : 'border-border hover:border-border-strong',
              leftIcon && 'pl-8',
              rightIcon && 'pr-8',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-danger">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
