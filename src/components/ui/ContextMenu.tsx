import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  items,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || items.length === 0) return null;

  const menuW = 200;
  const menuH = items.length * 36 + 16;
  const left = Math.max(8, Math.min(x, window.innerWidth - menuW - 8));
  const top = Math.max(8, Math.min(y, window.innerHeight - menuH - 8));

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ position: 'fixed', top: `${top}px`, left: `${left}px`, zIndex: 9999 }}
      className="w-[200px] rounded-2xl border border-border bg-surface p-1.5 shadow-popover animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            item.onClick();
            onClose();
          }}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer text-left',
            item.disabled && 'opacity-40 cursor-not-allowed',
            item.variant === 'danger'
              ? 'text-danger hover:bg-danger/10'
              : 'text-text hover:bg-hover'
          )}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};
