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
  const styles: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
    neutral: {
      bg: 'bg-zinc-100 dark:bg-zinc-800/80',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
      dotColor: 'bg-zinc-400'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500/25',
      dotColor: 'bg-purple-500 shadow-[0_0_6px_#8B5CF6]'
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/25',
      dotColor: 'bg-blue-500 shadow-[0_0_6px_#3B82F6]'
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/25',
      dotColor: 'bg-emerald-500 shadow-[0_0_6px_#10B981]'
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/25',
      dotColor: 'bg-amber-500 shadow-[0_0_6px_#F59E0B]'
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500/25',
      dotColor: 'bg-rose-500 shadow-[0_0_6px_#F43F5E]'
    }
  };

  const style = styles[variant] || styles.neutral;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none ${style.bg} ${style.text} ${style.border} ${
        onClick ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};