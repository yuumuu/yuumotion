import React from 'react';
import { Board } from '../../types/board';
import { KanbanBoard } from '../KanbanBoard';
import { ToastContainer, toast } from '../ui';

interface SharedBoardViewProps {
  board: Board;
  onExitShare: () => void;
}

export const SharedBoardView: React.FC<SharedBoardViewProps> = ({ board, onExitShare }) => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-bar px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="Yuumotion" className="h-7 w-7 rounded-lg" />
          <span className="font-display text-sm font-bold">{board.title}</span>
          <span className="rounded-full bg-project-soft px-2 py-0.5 text-[10px] font-semibold text-project-solid">
            Tamu (Read-Only)
          </span>
        </div>
        <button
          type="button"
          onClick={onExitShare}
          className="text-xs font-medium text-project-solid hover:underline cursor-pointer"
        >
          Masuk ke Yuumotion
        </button>
      </header>
      <main className="flex-1 overflow-auto">
        <KanbanBoard
          board={board}
          searchQuery=""
          onCardClick={() => toast.info('Mode tamu hanya-baca.')}
          onAddCard={() => {}}
          onAddColumn={() => {}}
          onDeleteColumn={() => {}}
          onDropCard={() => {}}
        />
      </main>
      <ToastContainer />
    </div>
  );
};
