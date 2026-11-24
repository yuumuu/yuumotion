import React from 'react';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = ''
}) => {
  return orientation === 'horizontal' ? (
    <div className={`h-px w-full bg-appflowy-border/80 dark:bg-appflowy-darkBorder/80 ${className}`} />
  ) : (
    <div className={`h-4 w-px bg-appflowy-border/80 dark:bg-appflowy-darkBorder/80 ${className}`} />
  );
};