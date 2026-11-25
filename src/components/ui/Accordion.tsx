import React, { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  badge,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border border-appflowy-border/80 bg-appflowy-surface dark:border-appflowy-darkBorder/80 dark:bg-appflowy-darkSurface overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium text-appflowy-text hover:bg-neutral-50/70 dark:text-appflowy-darkText dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {badge && <span>{badge}</span>}
        </div>
        <CaretDown
          className={`h-3.5 w-3.5 text-appflowy-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-project-solid' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-appflowy-border/60 px-3.5 py-3 text-xs dark:border-appflowy-darkBorder/60 bg-neutral-50/30 dark:bg-neutral-900/20">
          {children}
        </div>
      )}
    </div>
  );
};