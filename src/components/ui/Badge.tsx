import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  dot?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  onClick
}) => {
  const styles: Record<string, { bg: string; text: string; dotColor: string }> = {
    neutral: {
      bg: 'bg-neutral-100 dark:bg-neutral-800',
      text: 'text-neutral-700 dark:text-neutral-300',
      dotColor: 'bg-neutral-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      dotColor: 'bg-purple-500'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      dotColor: 'bg-emerald-500'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      dotColor: 'bg-amber-500'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      dotColor: 'bg-rose-500'
    }
  };

  const style = styles[variant] || styles.neutral;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none ${style.bg} ${style.text} ${
        onClick ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};