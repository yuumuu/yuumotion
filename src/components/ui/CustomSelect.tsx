import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  colorDot?: string;
  description?: string;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CustomSelect<T extends string | number = string>({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select option...',
  className = '',
  size = 'sm'
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-2.5 text-xs';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-appflowy-border bg-appflowy-surface font-medium text-appflowy-text transition-colors hover:border-neutral-300 disabled:opacity-50 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText dark:hover:border-neutral-600 ${sizeClasses}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption?.colorDot && (
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: selectedOption.colorDot }}
            />
          )}
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-appflowy-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-56 min-w-[140px] w-full overflow-y-auto rounded-xl border border-appflowy-border bg-appflowy-surface p-1 shadow-lg dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-purple-50 text-purple-700 font-medium dark:bg-purple-950/40 dark:text-purple-300'
                    : 'text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {opt.colorDot && (
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: opt.colorDot }}
                    />
                  )}
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3 w-3 flex-shrink-0 text-purple-600 dark:text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
