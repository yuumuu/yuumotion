import React, { useState, useRef } from 'react';
import { DownloadSimple, UploadSimple, Database, WifiHigh } from '@phosphor-icons/react';
import { Button, Input, Switch, toast } from '../ui';
import { CloudSyncConfig, SyncConnectionStatus } from '../../types/board';

interface SyncSettingsTabProps {
  cloudConfig: CloudSyncConfig;
  syncStatus: SyncConnectionStatus;
  onSaveCloudConfig: (cfg: CloudSyncConfig) => void;
  onOpenDbBridge: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCloseModal: () => void;
}

export const SyncSettingsTab: React.FC<SyncSettingsTabProps> = ({
  cloudConfig,
  syncStatus,
  onSaveCloudConfig,
  onOpenDbBridge,
  onExportBackup,
  onImportBackup,
  onCloseModal
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(cloudConfig.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(cloudConfig.supabaseAnonKey);
  const [cloudEnabled, setCloudEnabled] = useState(cloudConfig.enabled);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSync = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCloudConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
      enabled: cloudEnabled
    });
    toast.success('Pengaturan sinkronisasi disimpan');
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSaveSync} className="p-4 space-y-3 rounded-2xl border border-border bg-bg">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <WifiHigh className="w-4 h-4 text-status-done" />
            <span className="text-xs font-semibold text-text">
              Supabase Realtime ({syncStatus === 'connected' ? 'Terhubung' : 'Mode Lokal'})
            </span>
          </div>
          <Switch
            checked={cloudEnabled}
            onChange={(e) => setCloudEnabled(e.target.checked)}
          />
        </div>
        <Input
          value={supabaseUrl}
          onChange={(e) => setSupabaseUrl(e.target.value)}
          placeholder="https://xxx.supabase.co"
        />
        <Input
          type="password"
          value={supabaseKey}
          onChange={(e) => setSupabaseKey(e.target.value)}
          placeholder="Supabase Anon Key"
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="xs">
            Simpan Koneksi Cloud
          </Button>
        </div>
      </form>

      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-text">Cadangan Data &amp; SQL Bridge</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onExportBackup}
            leftIcon={<DownloadSimple className="h-3.5 w-3.5" />}
          >
            Unduh JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadSimple className="h-3.5 w-3.5" />}
          >
            Pulihkan JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              onCloseModal();
              onOpenDbBridge();
            }}
            leftIcon={<Database className="h-3.5 w-3.5" />}
          >
            SQL Bridge
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImportBackup}
          className="hidden"
        />
      </div>
    </div>
  );
};
