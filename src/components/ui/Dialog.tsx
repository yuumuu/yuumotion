import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`relative flex max-h-[90vh] w-full ${maxWidths[maxWidth]} flex-col overflow-hidden rounded-2xl border border-appflowy-border bg-appflowy-surface shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface`}
      >
        {(title || description) && (
          <div className="flex items-center justify-between border-b border-appflowy-border px-5 py-3.5 dark:border-appflowy-darkBorder shrink-0">
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-tight text-appflowy-text dark:text-appflowy-darkText">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-appflowy-muted hover:bg-neutral-100 hover:text-appflowy-text dark:hover:bg-neutral-800 dark:hover:text-appflowy-darkText cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
              aria-label="Tutup dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-appflowy-border bg-neutral-50/50 px-5 py-3 dark:border-appflowy-darkBorder dark:bg-neutral-900/30 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};