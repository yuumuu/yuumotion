import React from 'react';
import { Check } from '@phosphor-icons/react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, className = '', id, ...props }, ref) => {
    const generatedId = id || (typeof label === 'string' ? `chk-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label htmlFor={generatedId} className="inline-flex items-start gap-2 cursor-pointer select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`h-4 w-4 rounded border transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
              checked
                ? 'border-purple-600 bg-purple-600 text-white dark:border-purple-500 dark:bg-purple-500'
                : 'border-appflowy-border bg-appflowy-bg hover:border-neutral-400 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:hover:border-neutral-600'
            } ${className}`}
          >
            {checked && <Check className="h-3 w-3 stroke-[3]" />}
          </div>
        </div>
        {(label || description) && (
          <div className="text-xs">
            {label && <span className="font-medium text-appflowy-text dark:text-appflowy-darkText">{label}</span>}
            {description && <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';