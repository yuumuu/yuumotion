import React from 'react';

export interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd: React.FC<KbdProps> = ({ children, className = '' }) => {
  return (
    <kbd
      className={`inline-flex min-w-5 select-none items-center justify-center rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-700 shadow-2xs dark:border-[#27272A] dark:bg-[#18181B] dark:text-zinc-300 ${className}`}
    >
      {children}
    </kbd>
  );
};