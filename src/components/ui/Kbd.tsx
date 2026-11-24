import React from 'react';

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex min-w-5 select-none items-center justify-center rounded border border-appflowy-border bg-appflowy-bg px-1.5 py-0.5 font-mono text-[10px] font-semibold text-appflowy-text shadow-2xs dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText ${className}`}
    >
      {children}
    </kbd>
  );
};