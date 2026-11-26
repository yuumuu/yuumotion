import React from 'react';
import { Skeleton } from './Skeleton';

interface LoadingScreenProps {
  label?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ label = 'Memuat Yuumotion...' }) => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-bg text-text select-none">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg yuu-logo-float">
          <svg viewBox="0 0 100 100" fill="none" className="h-16 w-16">
            <defs>
              <linearGradient id="yuu-load-blue" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="55%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="url(#yuu-load-blue)" />
            <path
              d="M30 32L50 62L70 32"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="yuu-logo-stroke"
            />
            <circle cx="50" cy="75" r="5.5" fill="#BFDBFE" className="yuu-logo-dot" />
          </svg>
        </div>
        <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
      </div>
    </div>
  );
};

export const WorkspaceSkeleton: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-5 bg-bg">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface/70 p-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((col) => (
          <div key={col} className="flex flex-col gap-3 rounded-2xl border border-border bg-bar/40 p-3">
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            {[0, 1, 2].map((card) => (
              <div key={card} className="space-y-2.5 rounded-xl border border-border bg-surface p-3.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
