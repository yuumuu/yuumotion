import React, { useEffect, useRef, useState } from 'react';
import { Check, Eyedropper, X } from '@phosphor-icons/react';
import { cn } from '../../lib/cn';

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
  align?: 'left' | 'right';
  className?: string;
  isCustomActive?: boolean;
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

const DEFAULT_PRESETS = ['#2563EB', '#1D4ED8', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0B0D12'];

function normalizeHex(hex: string): string {
  const clean = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean.split('').map((c) => c + c).join('').toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean.toUpperCase()}`;
  }
  return '#2563EB';
}

function hexToHsv(hex: string): HsvColor {
  const norm = normalizeHex(hex).slice(1);
  const r = parseInt(norm.slice(0, 2), 16) / 255;
  const g = parseInt(norm.slice(2, 4), 16) / 255;
  const b = parseInt(norm.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToHex({ h, s, v }: HsvColor): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Custom interactive HSV color picker with elevated popover. */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  align = 'right',
  className,
  isCustomActive
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(value));
  const [hexInput, setHexInput] = useState(() => normalizeHex(value));

  const rootRef = useRef<HTMLDivElement>(null);
  const svAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const norm = normalizeHex(value);
    setHexInput(norm);
    if (norm !== hsvToHex(hsv)) {
      setHsv(hexToHsv(norm));
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const commitHsv = (next: HsvColor) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexInput(hex);
    onChange(hex);
  };

  const updateSvFromPointer = (clientX: number, clientY: number) => {
    const rect = svAreaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
    commitHsv({ ...hsv, s, v });
  };

  const updateHueFromPointer = (clientX: number) => {
    const rect = hueBarRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    commitHsv({ ...hsv, h: Math.round(ratio * 359) });
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const clean = raw.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(clean) || /^[0-9a-fA-F]{3}$/.test(clean)) {
      const norm = normalizeHex(raw);
      setHsv(hexToHsv(norm));
      onChange(norm);
    }
  };

  const activeCustom = isCustomActive ?? !presets.map(normalizeHex).includes(normalizeHex(value));

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title="Pilih warna kustom"
        style={activeCustom ? { backgroundColor: normalizeHex(value) } : undefined}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border transition-transform cursor-pointer',
          activeCustom
            ? 'border-transparent text-white ring-2 ring-project-accent ring-offset-2 scale-105'
            : 'border-dashed border-border bg-bg text-muted hover:text-text hover:bg-hover'
        )}
      >
        <Eyedropper className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-surface p-3 shadow-popover ring-1 ring-black/5 dark:ring-white/10',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
            <span>Warna Kustom</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-hover hover:text-text cursor-pointer"
              aria-label="Tutup pemilih warna"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 2D Saturation / Value Canvas */}
          <div
            ref={svAreaRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              updateSvFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) updateSvFromPointer(e.clientX, e.clientY);
            }}
            style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
            className="relative h-32 w-full cursor-crosshair overflow-hidden rounded-xl border border-border select-none touch-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: normalizeHex(value)
              }}
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
            />
          </div>

          {/* Hue Slider */}
          <div
            ref={hueBarRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              updateHueFromPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) updateHueFromPointer(e.clientX);
            }}
            style={{
              background:
                'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
            className="relative mt-3 h-3 w-full cursor-pointer rounded-full border border-border select-none touch-none"
          >
            <div
              style={{ left: `${(hsv.h / 359) * 100}%` }}
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-surface shadow-sm"
            />
          </div>

          {/* Hex Input & Active Preview */}
          <div className="mt-3 flex items-center gap-2">
            <span
              style={{ backgroundColor: normalizeHex(value) }}
              className="h-7 w-7 shrink-0 rounded-lg border border-border shadow-2xs"
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={7}
              placeholder="#2563EB"
              className="h-7 flex-1 rounded-lg border border-border bg-bg px-2 font-mono text-xs uppercase text-text focus:border-project-accent focus:outline-none"
            />
          </div>

          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
              {presets.map((preset) => {
                const active = normalizeHex(preset) === normalizeHex(value);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const norm = normalizeHex(preset);
                      setHsv(hexToHsv(norm));
                      setHexInput(norm);
                      onChange(norm);
                    }}
                    style={{ backgroundColor: preset }}
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-white transition-transform cursor-pointer',
                      active ? 'ring-2 ring-project-accent ring-offset-1 scale-110' : 'opacity-85 hover:opacity-100'
                    )}
                  >
                    {active && <Check className="h-2.5 w-2.5" weight="bold" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
