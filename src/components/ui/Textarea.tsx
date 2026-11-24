import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-appflowy-text dark:text-appflowy-darkText">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={generatedId}
          className={`w-full rounded-lg border bg-appflowy-bg p-2.5 text-xs text-appflowy-text placeholder-neutral-400 transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50 dark:bg-appflowy-darkBg dark:text-appflowy-darkText ${
            error
              ? 'border-rose-400 focus:ring-rose-500 dark:border-rose-700'
              : 'border-appflowy-border hover:border-neutral-300 dark:border-appflowy-darkBorder dark:hover:border-neutral-700'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';