import React, { useState } from 'react';
import { Board, DatabaseBridgeConfig } from '../types/board';
import { generateBoardSqlDump, syncBoardToDatabase } from '../lib/dbBridge';
import { CustomSelect } from './ui/CustomSelect';
import { X, Database, DownloadSimple, ArrowsClockwise, CheckCircle, Warning, FileCode } from '@phosphor-icons/react';

interface DatabaseBridgeModalProps {
  board: Board;
  config: DatabaseBridgeConfig;
  onSaveConfig: (config: DatabaseBridgeConfig) => void;
  onClose: () => void;
}

export const DatabaseBridgeModal: React.FC<DatabaseBridgeModalProps> = ({
  board,
  config,
  onSaveConfig,
  onClose
}) => {
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [target, setTarget] = useState<'mysql' | 'sqlite' | 'wasmer-edge'>(config.target);
  const [enabled, setEnabled] = useState(config.enabled);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      endpoint: endpoint.trim(),
      target,
      enabled,
      autoSync: config.autoSync
    });
    setStatusMessage({ text: 'Settings saved successfully.', isError: false });
  };

  const handleDownloadSql = (dialect: 'mysql' | 'sqlite') => {
    const dump = generateBoardSqlDump(board, dialect);
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yuumotion-${board.id}-${dialect}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    const result = await syncBoardToDatabase(board, {
      endpoint: endpoint.trim(),
      target,
      enabled: true,
      autoSync: config.autoSync
    });
    setIsSyncing(false);
    setStatusMessage({ text: result.message, isError: !result.success });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-appflowy-border bg-appflowy-surface p-6 shadow-2xl dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface">
        <div className="flex items-center justify-between border-b border-appflowy-border pb-3 dark:border-appflowy-darkBorder">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-appflowy-text dark:text-appflowy-darkText">
                Local MySQL & Wasmer Edge Database Bridge
              </h2>
              <p className="text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
                Direct export & relational sync bridge
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

        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
              statusMessage.isError
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {statusMessage.isError ? (
              <Warning className="h-4 w-4 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-medium text-appflowy-text dark:text-appflowy-darkText">
              Enable Database Sync Bridge
            </label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted mb-1">
              Database Dialect / Target
            </label>
            <CustomSelect
              value={target}
              options={[
                { value: 'mysql', label: 'Local MySQL Database (schema.mysql.sql)' },
                { value: 'sqlite', label: 'SQLite Database (schema.sqlite.sql)' },
                { value: 'wasmer-edge', label: 'Wasmer Edge Relational D1' }
              ]}
              onChange={(t) => setTarget(t as 'mysql' | 'sqlite' | 'wasmer-edge')}
              className="w-full"
              size="md"
            />
          </div>

          <div>
            <label className="block font-medium text-appflowy-muted dark:text-appflowy-darkMuted">
              Bridge HTTP Sync Endpoint
            </label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:3001/api/sync"
              className="mt-1 h-8 w-full rounded border border-appflowy-border bg-appflowy-bg px-2.5 font-mono text-xs text-appflowy-text dark:border-appflowy-darkBorder dark:bg-appflowy-darkBg dark:text-appflowy-darkText"
            />
          </div>

          <div className="rounded-xl border border-appflowy-border bg-neutral-50/70 p-3 dark:border-appflowy-darkBorder dark:bg-neutral-900/40">
            <div className="mb-2 flex items-center gap-1.5 font-medium text-appflowy-text dark:text-appflowy-darkText">
              <FileCode className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Instant SQL Dump Export</span>
            </div>
            <p className="mb-3 text-[11px] text-appflowy-muted dark:text-appflowy-darkMuted">
              Export all cards, tags, columns, attachments, and rich documentation as ready-to-run SQL migrations.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadSql('mysql')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-appflowy-border bg-appflowy-surface px-2.5 py-1 text-xs font-medium text-appflowy-text hover:bg-neutral-100 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
              >
                <DownloadSimple className="h-3.5 w-3.5" />
                <span>Export MySQL Dump</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSql('sqlite')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-appflowy-border bg-appflowy-surface px-2.5 py-1 text-xs font-medium text-appflowy-text hover:bg-neutral-100 dark:border-appflowy-darkBorder dark:bg-appflowy-darkSurface dark:text-appflowy-darkText"
              >
                <DownloadSimple className="h-3.5 w-3.5" />
                <span>Export SQLite Dump</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <ArrowsClockwise className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Push to DB Endpoint'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-3 py-1.5 text-xs text-appflowy-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded bg-purple-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-purple-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
