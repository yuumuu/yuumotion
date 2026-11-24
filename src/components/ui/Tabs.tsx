import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  size = 'sm',
  className = ''
}) => {
  const sizeStyles: Record<string, string> = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs font-semibold gap-2'
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center rounded-xl border border-appflowy-border/80 bg-appflowy-bg/80 p-0.5 dark:border-appflowy-darkBorder/80 dark:bg-appflowy-darkBg/80 ${className}`}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`flex items-center rounded-lg font-medium transition-all duration-150 cursor-pointer select-none ${
              sizeStyles[size]
            } ${
              isActive
                ? 'bg-appflowy-surface text-purple-600 shadow-2xs dark:bg-appflowy-darkSurface dark:text-purple-400'
                : 'text-appflowy-muted hover:text-appflowy-text dark:text-appflowy-darkMuted dark:hover:text-appflowy-darkText'
            }`}
          >
            {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && <span className="ml-1 inline-flex shrink-0">{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};