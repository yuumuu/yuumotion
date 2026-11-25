import React, { useState, useRef, useEffect } from 'react';
import { CalendarBlank as CalendarIcon, CaretLeft, CaretRight, X } from '@phosphor-icons/react';

interface CustomDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Pick date',
  className = '',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(isNaN(initialDate.getTime()) ? new Date() : initialDate);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange(formatted);
    setViewDate(today);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const formatDisplay = (val?: string) => {
    if (!val) return placeholder;
    const parts = val.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return val;
  };

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const target = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return value === target;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const sizeClasses = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-2.5 text-xs';

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-appflowy-border bg-appflowy-surface font-medium transition-colors hover:border-neutral-300 disabled:opacity-50 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:hover:border-neutral-600 ${sizeClasses} ${
          value ? 'text-appflowy-text dark:text-appflowy-darkText' : 'text-appflowy-muted dark:text-appflowy-darkMuted'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0 text-appflowy-muted" />
          <span className="truncate">{formatDisplay(value)}</span>
        </span>
        {value && !disabled ? (
          <span
            onClick={handleClear}
            className="rounded p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Clear date"
          >
            <X className="h-3 w-3 text-appflowy-muted hover:text-rose-500" />
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-appflowy-border bg-appflowy-surface p-3 shadow-xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-appflowy-text dark:text-appflowy-darkText">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Previous month"
              >
                <CaretLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-6 w-6 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Next month"
              >
                <CaretRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-appflowy-muted dark:text-appflowy-darkMuted">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isDaySelected(day);
              const today = isToday(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : today
                      ? 'border border-purple-400 font-semibold text-purple-600 dark:border-purple-500 dark:text-purple-400'
                      : 'text-appflowy-text hover:bg-neutral-100 dark:text-appflowy-darkText dark:hover:bg-neutral-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-appflowy-border pt-2 text-[11px] dark:border-appflowy-darkBorder">
            <button
              type="button"
              onClick={handleClear}
              className="text-appflowy-muted hover:text-rose-500"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="font-medium text-purple-600 hover:underline dark:text-purple-400"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
