import React, { useState } from 'react';
import { CloudSyncConfig, SyncConnectionStatus } from '../types/board';
import { X, Cloud, CheckCircle, Warning, Spinner, Sparkle, ArrowSquareOut } from '@phosphor-icons/react';

interface CloudSyncModalProps {
  config: CloudSyncConfig;
  status: SyncConnectionStatus;
  onSave: (config: CloudSyncConfig) => void;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  config,
  status,
  onSave,
  onClose
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.supabaseAnonKey);
  const [enabled, setEnabled] = useState(config.enabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      enabled
    });
    onClose();
  };

  const handleUseDemoChannel = () => {
    setSupabaseUrl('https://demo-yuumotion.supabase.co');
    setSupabaseAnonKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key');
    setEnabled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border pb-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
              <Cloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-appflowy-text dark:text-appflowy-darkText">
                Cloud Realtime Sync
              </h2>
              <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                Sync across distinct devices & networks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-900/50">
          <span className="text-appflowy-muted dark:text-appflowy-darkMuted">Current Status</span>
          <span className="flex items-center gap-1.5 font-medium">
            {status === 'connected' && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Connected (Cloud Active)
              </span>
            )}
            {status === 'connecting' && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Spinner className="h-3.5 w-3.5 animate-spin" />
                Connecting...
              </span>
            )}
            {status === 'local' && (
              <span className="text-neutral-500 dark:text-neutral-400">
                Local Only (BroadcastChannel)
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <Warning className="h-3.5 w-3.5" />
                Connection Error
              </span>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-appflowy-text dark:text-appflowy-darkText">
              Enable Supabase Realtime
            </label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              placeholder="ey..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 font-mono text-xs text-appflowy-text placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            />
          </div>

          <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-2.5 text-[11px] text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300">
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-start gap-1.5">
                <Sparkle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                <span>
                  Yuumotion uses Supabase Realtime Broadcast. No database tables or migrations are required.
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseDemoChannel}
                className="whitespace-nowrap font-medium text-purple-700 underline hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
              >
                Fill Demo
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://supabase.com/docs/guides/realtime/broadcast"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline dark:text-purple-400"
            >
              Supabase Docs <ArrowSquareOut className="h-3 w-3" />
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-3 py-1.5 text-xs text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-purple-700"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
