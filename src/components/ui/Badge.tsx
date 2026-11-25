import React from 'react';
import { cn } from '../../lib/cn';

export type BadgeVariant =
  | 'neutral'
  | 'urgent'
  | 'high'
  | 'medium'
  | 'done'
  | 'project'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'emerald'
  | 'purple';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const badgeVariants: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
  neutral: {
    bg: 'bg-bar border border-border',
    text: 'text-text',
    dotColor: 'bg-muted'
  },
  urgent: {
    bg: 'bg-status-urgent-bg',
    text: 'text-status-urgent',
    dotColor: 'bg-status-urgent'
  },
  rose: {
    bg: 'bg-status-urgent-bg',
    text: 'text-status-urgent',
    dotColor: 'bg-status-urgent'
  },
  high: {
    bg: 'bg-status-high-bg',
    text: 'text-status-high',
    dotColor: 'bg-status-high'
  },
  amber: {
    bg: 'bg-status-high-bg',
    text: 'text-status-high',
    dotColor: 'bg-status-high'
  },
  medium: {
    bg: 'bg-status-medium-bg',
    text: 'text-status-medium',
    dotColor: 'bg-status-medium'
  },
  blue: {
    bg: 'bg-status-medium-bg',
    text: 'text-status-medium',
    dotColor: 'bg-status-medium'
  },
  done: {
    bg: 'bg-status-done-bg',
    text: 'text-status-done',
    dotColor: 'bg-status-done'
  },
  emerald: {
    bg: 'bg-status-done-bg',
    text: 'text-status-done',
    dotColor: 'bg-status-done'
  },
  project: {
    bg: 'bg-project-soft',
    text: 'text-project-accent',
    dotColor: 'bg-project-accent'
  },
  purple: {
    bg: 'bg-project-soft',
    text: 'text-project-accent',
    dotColor: 'bg-project-accent'
  }
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  icon,
  className = '',
  onClick
}) => {
  const current = badgeVariants[variant] || badgeVariants.neutral;

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full h-6 px-2.5 text-xs font-medium leading-none select-none transition-colors',
        current.bg,
        current.text,
        onClick && 'cursor-pointer hover:brightness-95 dark:hover:brightness-110',
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', current.dotColor)} />}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
