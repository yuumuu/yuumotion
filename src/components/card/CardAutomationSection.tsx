import React from 'react';
import { Card } from '../../types/board';
import { CustomSelect, Switch } from '../ui';
import { Lock, ArrowsClockwise, X } from '@phosphor-icons/react';

interface CardAutomationSectionProps {
  card: Card;
  allCards: Card[];
  autoMoveDone: boolean;
  setAutoMoveDone: (val: boolean) => void;
  syncChanges: (patch: Partial<Card>) => void;
  addActivity: (action: string, extraPatch?: Partial<Card>) => void;
}

export const CardAutomationSection: React.FC<CardAutomationSectionProps> = ({
  card,
  allCards,
  autoMoveDone,
  setAutoMoveDone,
  syncChanges,
  addActivity
}) => {
  const availableBlockers = allCards.filter(
    (c) => c.id !== card.id && !(card.blockedBy || []).includes(c.id)
  );

  return (
    <>
      <div className="p-3.5 rounded-xl border border-border bg-bar space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <Lock className="h-3.5 w-3.5 text-rose-500" />
            Dependensi (Diblokir Oleh)
          </span>
          <span className="text-[11px] font-mono text-muted">
            {(card.blockedBy || []).length} pemblokir
          </span>
        </div>

        {(card.blockedBy || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(card.blockedBy || []).map((blockerId) => {
              const blocker = allCards.find((c) => c.id === blockerId);
              if (!blocker) return null;
              return (
                <span
                  key={blockerId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"
                >
                  <span className="truncate max-w-[180px]">{blocker.title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (card.blockedBy || []).filter((id) => id !== blockerId);
                      syncChanges({ blockedBy: next });
                      addActivity(`Menghapus pemblokir "${blocker.title}"`);
                    }}
                    className="hover:text-text cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {availableBlockers.length > 0 && (
          <CustomSelect
            value=""
            placeholder="Tambah kartu pemblokir..."
            onChange={(blockerId) => {
              if (!blockerId) return;
              const next = [...(card.blockedBy || []), blockerId];
              syncChanges({ blockedBy: next });
              const blocker = allCards.find((c) => c.id === blockerId);
              if (blocker) addActivity(`Menandai diblokir oleh "${blocker.title}"`);
            }}
            options={availableBlockers.map((c) => ({ value: c.id, label: c.title }))}
          />
        )}
      </div>

      <div className="p-3.5 rounded-xl border border-border bg-bar space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text">
              <ArrowsClockwise className="h-3.5 w-3.5 text-sky-500" />
              Tugas Berulang (Recurring)
            </span>
            <span className="text-[11px] text-muted block">
              Otomatis buat kartu baru di kolom pertama saat dipindah ke Done
            </span>
          </div>
          <Switch
            checked={Boolean(card.recurrence)}
            onChange={(e) => {
              if (e.target.checked) {
                syncChanges({ recurrence: { frequency: 'weekly', interval: 1 } });
                addActivity('Mengaktifkan pengulangan mingguan');
              } else {
                syncChanges({ recurrence: undefined });
                addActivity('Menonaktifkan pengulangan kartu');
              }
            }}
          />
        </div>

        {card.recurrence && (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <CustomSelect
              value={card.recurrence.frequency}
              onChange={(freq) => {
                syncChanges({
                  recurrence: {
                    ...card.recurrence!,
                    frequency: freq as 'daily' | 'weekly' | 'monthly'
                  }
                });
              }}
              options={[
                { value: 'daily', label: 'Harian' },
                { value: 'weekly', label: 'Mingguan' },
                { value: 'monthly', label: 'Bulanan' }
              ]}
            />
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1">
              <span className="text-[11px] text-muted shrink-0">Tiap</span>
              <input
                type="number"
                min={1}
                max={30}
                value={card.recurrence.interval}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  syncChanges({
                    recurrence: { ...card.recurrence!, interval: val }
                  });
                }}
                className="w-full bg-transparent text-xs font-mono text-text focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-bar">
        <div>
          <span className="block text-xs font-semibold text-text">Automasi Selesai (Auto-Move)</span>
          <span className="text-[11px] text-muted block">
            Pindahkan otomatis ke kolom Done saat seluruh checklist tercentang
          </span>
        </div>
        <Switch
          checked={autoMoveDone}
          onChange={(e) => {
            setAutoMoveDone(e.target.checked);
            syncChanges({ autoMoveDone: e.target.checked });
          }}
        />
      </div>
    </>
  );
};
