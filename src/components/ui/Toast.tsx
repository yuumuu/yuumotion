import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

type ToastListener = (toasts: ToastMessage[]) => void;
let activeToasts: ToastMessage[] = [];
const listeners: ToastListener[] = [];

export const toast = {
  success: (text: string) => showToast('success', text),
  error: (text: string) => showToast('error', text),
  info: (text: string) => showToast('info', text)
};

function showToast(type: ToastMessage['type'], text: string) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  activeToasts = [...activeToasts, { id, type, text }];
  notify();
  setTimeout(() => {
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notify();
  }, 3500);
}

function notify() {
  listeners.forEach((fn) => fn([...activeToasts]));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>(activeToasts);

  useEffect(() => {
    const fn: ToastListener = (next) => setToasts(next);
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between gap-2.5 rounded-xl border border-appflowy-border bg-appflowy-surface p-3 shadow-lg dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface animate-in slide-in-from-bottom-2 duration-150 text-xs"
        >
          <div className="flex items-center gap-2">
            {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="h-4 w-4 text-purple-500 shrink-0" />}
            <span className="font-medium text-appflowy-text dark:text-appflowy-darkText">{t.text}</span>
          </div>
          <button
            onClick={() => {
              activeToasts = activeToasts.filter((item) => item.id !== t.id);
              notify();
            }}
            className="text-appflowy-muted hover:text-appflowy-text dark:hover:text-appflowy-darkText cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};