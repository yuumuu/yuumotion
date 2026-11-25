import React, { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  mode?: 'confirm' | 'prompt';
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: (value?: string) => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  mode = 'confirm',
  placeholder = '',
  initialValue = '',
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  onConfirm
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    if (!isOpen || mode !== 'confirm') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        onConfirm(undefined);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, onConfirm, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'prompt' && !inputValue.trim()) return;
    onConfirm(mode === 'prompt' ? inputValue.trim() : undefined);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'prompt' && (
          <Input
            autoFocus
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            disabled={mode === 'prompt' && !inputValue.trim()}
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
