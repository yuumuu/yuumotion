import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, checked, onChange, className = '', id, ...props }, ref) => {
    const generatedId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label htmlFor={generatedId} className="inline-flex items-center justify-between gap-3 cursor-pointer select-none">
        {(label || description) && (
          <div>
            {label && <p className="text-xs font-medium text-appflowy-text dark:text-appflowy-darkText">{label}</p>}
            {description && <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">{description}</p>}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`h-5 w-9 rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
              checked ? 'bg-purple-600 dark:bg-purple-500' : 'bg-neutral-300 dark:bg-neutral-700'
            } ${className}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                checked ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';