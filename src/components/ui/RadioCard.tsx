import React from 'react';

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface RadioCardProps {
  options: RadioCardOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer select-none transition-all duration-150 ${
              isSelected
                ? 'border-purple-500 bg-purple-50/50 shadow-2xs ring-1 ring-purple-500/30 dark:border-purple-600 dark:bg-purple-950/30'
                : 'border-appflowy-border bg-appflowy-surface hover:bg-neutral-50/80 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:hover:bg-neutral-800/40'
            }`}
          >
            {opt.icon && <div className="mt-0.5 text-purple-600 dark:text-purple-400 shrink-0">{opt.icon}</div>}
            <div>
              <p className="text-xs font-semibold text-appflowy-text dark:text-appflowy-darkText">
                {opt.label}
              </p>
              {opt.description && (
                <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted mt-0.5">
                  {opt.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};