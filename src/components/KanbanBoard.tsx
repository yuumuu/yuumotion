import React, { useState, useEffect, useRef } from 'react';
import { Board, Card, WorkspaceMember } from '../types/board';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Plus } from '@phosphor-icons/react';
import { Button, Input } from './ui';

interface KanbanBoardProps {
  board: Board;
  members?: WorkspaceMember[];
  searchQuery: string;
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => void;
  onRenameCard?: (cardId: string, newTitle: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onReorderColumns?: (columnId: string, targetIndex: number) => void;
  onUpdateWipLimit?: (columnId: string, wipLimit?: number) => void;
  onDropCard: (cardId: string, targetColumnId: string) => void;
}

interface PointerDragState {
  card: Card;
  originColumnId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  lastX: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  tilt: number;
  isDragging: boolean;
  hoverColumnId: string | null;
}

const PRESET_COLORS = ['#6366F1', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  members,
  searchQuery,
  onCardClick,
  onAddCard,
  onRenameCard,
  onAddColumn,
  onDeleteColumn,
  onReorderColumns,
  onUpdateWipLimit,
  onDropCard
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [quickAddColumnId, setQuickAddColumnId] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<PointerDragState | null>(null);
  const dragStateRef = useRef<PointerDragState | null>(null);
  dragStateRef.current = dragState;

  const [colDragState, setColDragState] = useState<{
    columnId: string;
    startX: number;
    isDragging: boolean;
    hoverColumnId: string | null;
  } | null>(null);
  const colDragRef = useRef(colDragState);
  colDragRef.current = colDragState;

  const [keyboardDragCardId, setKeyboardDragCardId] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleShortcutN = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || isEditable || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const targetColId = hoveredColumnId || sortedColumns[0]?.id || null;
        if (targetColId) setQuickAddColumnId(targetColId);
      }
    };
    window.addEventListener('keydown', handleShortcutN);
    return () => window.removeEventListener('keydown', handleShortcutN);
  }, [hoveredColumnId, sortedColumns]);

  useEffect(() => {
    if (!colDragState) return;
    const handleMove = (e: PointerEvent) => {
      const prev = colDragRef.current;
      if (!prev) return;
      const isDragging = prev.isDragging || Math.abs(e.clientX - prev.startX) > 8;
      let hoverColumnId = prev.hoverColumnId;
      if (isDragging) {
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const colEl = els.find((el) => el.hasAttribute('data-column-id'));
        hoverColumnId = colEl ? colEl.getAttribute('data-column-id') : prev.hoverColumnId;
      }
      setColDragState({ ...prev, isDragging, hoverColumnId });
    };
    const handleUp = () => {
      const current = colDragRef.current;
      if (current && current.isDragging && current.hoverColumnId && current.hoverColumnId !== current.columnId) {
        const targetIndex = sortedColumns.findIndex((c) => c.id === current.hoverColumnId);
        if (targetIndex !== -1) {
          onReorderColumns?.(current.columnId, targetIndex);
        }
      }
      setColDragState(null);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [Boolean(colDragState), sortedColumns, onReorderColumns]);

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const prev = dragStateRef.current;
      if (!prev) return;

      const dxTotal = e.clientX - prev.startX;
      const dyTotal = e.clientY - prev.startY;
      const distance = Math.hypot(dxTotal, dyTotal);

      const isNowDragging = prev.isDragging || distance > 6;
      const dxStep = e.clientX - prev.lastX;
      const targetTilt = isNowDragging
        ? Math.max(-4.5, Math.min(4.5, dxStep * 0.45 + 1.8))
        : 0;

      let hoverColId: string | null = prev.hoverColumnId;
      if (isNowDragging) {
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const colEl = els.find((el) => el.hasAttribute('data-column-id'));
        hoverColId = colEl ? colEl.getAttribute('data-column-id') : null;
      }

      setDragState({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
        lastX: e.clientX,
        tilt: targetTilt,
        isDragging: isNowDragging,
        hoverColumnId: hoverColId
      });
    };

    const handlePointerUp = () => {
      const current = dragStateRef.current;
      if (current && current.isDragging && current.hoverColumnId && current.hoverColumnId !== current.originColumnId) {
        onDropCard(current.card.id, current.hoverColumnId);
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [Boolean(dragState), onDropCard]);

  const handleCardPointerDown = (card: Card, columnId: string, e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();

    setDragState({
      card,
      originColumnId: columnId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      lastX: e.clientX,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      tilt: 1.8,
      isDragging: false,
      hoverColumnId: columnId
    });
  };

  const handleQuickComplete = (card: Card) => {
    const doneCol = sortedColumns.find((col) => {
      const t = col.title.toLowerCase();
      return t.includes('done') || t.includes('selesai') || t.includes('completed');
    });
    if (doneCol && card.columnId !== doneCol.id) {
      onDropCard(card.id, doneCol.id);
      setLiveAnnouncement(`Kartu ${card.title} ditandai selesai dan dipindahkan ke ${doneCol.title}.`);
    }
  };

  const handleKeyboardDragToggle = (card: Card, columnId: string) => {
    if (keyboardDragCardId === card.id) {
      setKeyboardDragCardId(null);
      const col = sortedColumns.find((c) => c.id === columnId);
      setLiveAnnouncement(`Kartu ${card.title} diletakkan di kolom ${col?.title || ''}.`);
    } else {
      setKeyboardDragCardId(card.id);
      setLiveAnnouncement(`Kartu ${card.title} diangkat. Gunakan panah kiri atau kanan untuk memindahkan kolom, Spasi untuk meletakkan, atau Esc untuk batal.`);
    }
  };

  const handleKeyboardMove = (card: Card, direction: 'left' | 'right') => {
    const currentIndex = sortedColumns.findIndex((c) => c.id === card.columnId);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    const targetCol = sortedColumns[nextIndex];
    if (!targetCol) return;

    onDropCard(card.id, targetCol.id);
    setLiveAnnouncement(`Kartu ${card.title} dipindahkan ke kolom ${targetCol.title}.`);
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim()) {
      onAddColumn(columnTitle.trim(), selectedColor);
      setColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const getFilteredCards = (columnId: string): Card[] => {
    const list = Object.values(board.cards).filter((card) => card.columnId === columnId);
    if (!searchQuery.trim()) {
      return list.sort((a, b) => a.order - b.order);
    }
    const q = searchQuery.toLowerCase();
    return list
      .filter((card) => card.title.toLowerCase().includes(q) || card.tags.some((t) => t.name.toLowerCase().includes(q)))
      .sort((a, b) => a.order - b.order);
  };

  const activeDraggingCardId = dragState?.isDragging ? dragState.card.id : null;

  return (
    <div className="relative flex h-full flex-1 gap-6 overflow-x-auto px-6 py-4 bg-bg items-start">
      {/* Screen Reader Announcer for Keyboard DnD */}
      <div aria-live="assertive" className="sr-only">
        {liveAnnouncement}
      </div>

      {sortedColumns.map((col) => (
        <div
          key={col.id}
          onMouseEnter={() => setHoveredColumnId(col.id)}
          className="h-full"
        >
          <KanbanColumn
            column={col}
            cards={getFilteredCards(col.id)}
            members={members}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
            onRenameCard={onRenameCard}
            onDeleteColumn={onDeleteColumn}
            onUpdateWipLimit={onUpdateWipLimit}
            onQuickComplete={handleQuickComplete}
            draggingCardId={activeDraggingCardId}
            draggingCardHeight={dragState?.height}
            isDropTarget={
              Boolean(dragState?.isDragging) &&
              dragState?.hoverColumnId === col.id &&
              dragState?.originColumnId !== col.id
            }
            isColumnDragging={Boolean(colDragState?.isDragging && colDragState.columnId === col.id)}
            isColumnDropTarget={
              Boolean(colDragState?.isDragging) &&
              colDragState?.hoverColumnId === col.id &&
              colDragState?.columnId !== col.id
            }
            onColumnPointerDown={
              onReorderColumns
                ? (column, e) => {
                    if (e.button !== 0) return;
                    setColDragState({
                      columnId: column.id,
                      startX: e.clientX,
                      isDragging: false,
                      hoverColumnId: column.id
                    });
                  }
                : undefined
            }
            keyboardDragCardId={keyboardDragCardId}
            onCardPointerDown={handleCardPointerDown}
            onKeyboardDragToggle={handleKeyboardDragToggle}
            onKeyboardMove={handleKeyboardMove}
            onKeyboardCancel={() => {
              setKeyboardDragCardId(null);
              setLiveAnnouncement('Pemindahan kartu dibatalkan.');
            }}
            autoFocusAdd={quickAddColumnId === col.id}
            onAutoFocusHandled={() => setQuickAddColumnId(null)}
            wipLimit={col.wipLimit}
          />
        </div>
      ))}

      {/* Add Column Control */}
      <div className="w-80 flex-shrink-0">
        {isAddingColumn ? (
          <form
            onSubmit={handleCreateColumn}
            className="rounded-2xl border border-border bg-surface p-4 shadow-popover space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-xs font-bold text-text">Tambah Kolom Baru</div>
            <Input
              autoFocus
              placeholder="Misal: Review Klien..."
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
            />
            <div className="flex items-center gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-4 w-4 rounded-full transition-transform cursor-pointer ${
                    selectedColor === c ? 'scale-125 ring-2 ring-project-accent ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsAddingColumn(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="xs"
              >
                Buat Kolom
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingColumn(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-surface/30 p-3.5 text-xs font-semibold text-muted hover:border-project-accent hover:bg-surface hover:text-project-accent transition-[border-color,background-color,color,box-shadow] duration-150 cursor-pointer shadow-2xs hover:shadow-card-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kolom</span>
          </button>
        )}
      </div>

      {/* Pointer-Driven Floating Drag Ghost (ClickUp Style Tilt & Elevation) */}
      {dragState && dragState.isDragging && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${dragState.width}px`,
            transform: `translate3d(${dragState.currentX - dragState.offsetX}px, ${dragState.currentY - dragState.offsetY}px, 0) rotate(${dragState.tilt}deg) scale(1.03)`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'transform 60ms cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <KanbanCard
            card={dragState.card}
            isFloatingClone
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
};
