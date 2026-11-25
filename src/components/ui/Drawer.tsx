import React, { useEffect } from 'react';
import { X, ArrowsOut, Square } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { CardOpenMode } from '../../types/preferences';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  currentMode?: CardOpenMode;
  onChangeMode?: (mode: CardOpenMode) => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  isSplitView?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  currentMode = 'drawer',
  onChangeMode,
  headerExtra,
  children,
  footer,
  className,
  isSplitView = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Split View: Renders directly alongside the canvas without dark blocking backdrop
  if (isSplitView) {
    return (
      <aside
        aria-label="Detail Inspector"
        className={cn(
          'flex h-full w-[440px] lg:w-[480px] flex-col border-l border-border bg-surface shadow-2xs animate-in slide-in-from-right-4 duration-200 shrink-0 z-20 overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4 bg-bar shrink-0">
          <div className="min-w-0 pr-2">
            {title && (
              <div className="font-display text-xs font-bold text-text truncate">
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-[11px] text-muted truncate">{subtitle}</div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {headerExtra}
            {onChangeMode && (
              <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                <button
                  type="button"
                  onClick={() => onChangeMode('modal')}
                  className={cn(
                    'p-1 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                    currentMode === 'modal' && 'bg-hover text-text font-semibold'
                  )}
                  title="Mode Center Modal"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMode('fullpage')}
                  className={cn(
                    'p-1 rounded-md text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                    currentMode === 'fullpage' && 'bg-hover text-text font-semibold'
                  )}
                  title="Mode Halaman Penuh"
                >
                  <ArrowsOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-4 py-3 bg-bar shrink-0">
            {footer}
          </div>
        )}
      </aside>
    );
  }

  // Standard Floating Overlay Drawer
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-black/25 dark:bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'flex w-screen max-w-[560px] flex-col border-l border-border bg-surface shadow-card-drag animate-in slide-in-from-right duration-250',
            className
          )}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border px-5 bg-bar shrink-0">
            <div className="min-w-0 pr-2">
              {title && (
                <div className="font-display text-sm font-semibold text-text truncate">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs text-muted truncate">{subtitle}</div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onChangeMode && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeMode('modal')}
                    className={cn(
                      'p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                      currentMode === 'modal' && 'bg-hover text-text font-semibold'
                    )}
                    title="Ubah ke Center Modal"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeMode('fullpage')}
                    className={cn(
                      'p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer',
                      currentMode === 'fullpage' && 'bg-hover text-text font-semibold'
                    )}
                    title="Buka Halaman Penuh"
                  >
                    <ArrowsOut className="h-4 w-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-hover transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-border px-6 py-4 bg-bar shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
