import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Board, Card, Column, UserPresence } from './types/board';
import { INITIAL_BOARD, generateLocalUser } from './lib/constants';
import { createSyncManager } from './lib/sync';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CardDetailModal } from './components/CardDetailModal';

export const App: React.FC = () => {
  const [roomId, setRoomId] = useState('general');
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const currentUser = useMemo(() => generateLocalUser(), []);
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});

  const [board, setBoard] = useState<Board>(() => {
    const saved = localStorage.getItem(`yuumotion_board_${roomId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to initial board if persisted state cannot be decoded
      }
    }
    return INITIAL_BOARD;
  });

  const syncManagerRef = useRef<ReturnType<typeof createSyncManager> | null>(null);

  useEffect(() => {
    const manager = createSyncManager(roomId, currentUser);
    syncManagerRef.current = manager;

    const unsubscribe = manager.subscribe((event) => {
      if (event.senderId === currentUser.id) return;

      if (event.type === 'PRESENCE_PING') {
        setPresenceMap((prev) => ({
          ...prev,
          [event.user.id]: event.user
        }));
        return;
      }

      setBoard((prev) => {
        if (event.type === 'CARD_UPSERT') {
          const existing = prev.cards[event.card.id];
          if (existing && existing.updatedAt > event.card.updatedAt) {
            return prev;
          }
          return {
            ...prev,
            updatedAt: Date.now(),
            cards: {
              ...prev.cards,
              [event.card.id]: event.card
            }
          };
        }

        if (event.type === 'CARD_DELETE') {
          const nextCards = { ...prev.cards };
          delete nextCards[event.cardId];
          return {
            ...prev,
            updatedAt: Date.now(),
            cards: nextCards
          };
        }

        if (event.type === 'CARD_MOVE') {
          const card = prev.cards[event.cardId];
          if (!card) return prev;
          return {
            ...prev,
            updatedAt: Date.now(),
            cards: {
              ...prev.cards,
              [event.cardId]: {
                ...card,
                columnId: event.targetColumnId,
                order: event.targetOrder,
                updatedAt: event.updatedAt
              }
            }
          };
        }

        if (event.type === 'COLUMN_UPSERT') {
          const existingIdx = prev.columns.findIndex((c) => c.id === event.column.id);
          const nextCols = existingIdx >= 0
            ? prev.columns.map((c) => (c.id === event.column.id ? event.column : c))
            : [...prev.columns, event.column];
          return {
            ...prev,
            updatedAt: Date.now(),
            columns: nextCols
          };
        }

        if (event.type === 'COLUMN_DELETE') {
          const nextCols = prev.columns.filter((c) => c.id !== event.columnId);
          const nextCards: Record<string, Card> = {};
          Object.values(prev.cards).forEach((c) => {
            if (c.columnId !== event.columnId) {
              nextCards[c.id] = c;
            }
          });
          return {
            ...prev,
            updatedAt: Date.now(),
            columns: nextCols,
            cards: nextCards
          };
        }

        if (event.type === 'BOARD_RESET') {
          return event.board;
        }

        return prev;
      });
    });

    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    localStorage.setItem(`yuumotion_board_${roomId}`, JSON.stringify(board));
  }, [board, roomId]);

  useEffect(() => {
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      setPresenceMap((prev) => {
        const next: Record<string, UserPresence> = {};
        Object.entries(prev).forEach(([id, user]) => {
          if (now - user.lastActive < 10000) {
            next[id] = user;
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(pruneInterval);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleAddCard = (columnId: string, title: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      columnId,
      title,
      description: '',
      tags: [],
      priority: 'low',
      checklist: [],
      order: Object.values(board.cards).filter((c) => c.columnId === columnId).length,
      updatedAt: Date.now()
    };

    setBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [newCard.id]: newCard }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: newCard,
      senderId: currentUser.id
    });
  };

  const handleUpdateCard = (updated: Card) => {
    setBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [updated.id]: updated }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: updated,
      senderId: currentUser.id
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setBoard((prev) => {
      const next = { ...prev.cards };
      delete next[cardId];
      return { ...prev, updatedAt: Date.now(), cards: next };
    });

    syncManagerRef.current?.broadcast({
      type: 'CARD_DELETE',
      cardId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
  };

  const handleDropCard = (cardId: string, targetColumnId: string) => {
    const card = board.cards[cardId];
    if (!card || card.columnId === targetColumnId) return;

    const targetOrder = Object.values(board.cards).filter((c) => c.columnId === targetColumnId).length;
    const updatedCard: Card = {
      ...card,
      columnId: targetColumnId,
      order: targetOrder,
      updatedAt: Date.now()
    };

    setBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [cardId]: updatedCard }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_MOVE',
      cardId,
      targetColumnId,
      targetOrder,
      senderId: currentUser.id,
      updatedAt: updatedCard.updatedAt
    });
  };

  const handleAddColumn = (title: string, color: string) => {
    const newCol: Column = {
      id: `col-${Date.now()}`,
      title,
      color,
      order: board.columns.length,
      updatedAt: Date.now()
    };

    setBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      columns: [...prev.columns, newCol]
    }));

    syncManagerRef.current?.broadcast({
      type: 'COLUMN_UPSERT',
      column: newCol,
      senderId: currentUser.id
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    setBoard((prev) => {
      const nextCols = prev.columns.filter((c) => c.id !== columnId);
      const nextCards: Record<string, Card> = {};
      Object.values(prev.cards).forEach((c) => {
        if (c.columnId !== columnId) nextCards[c.id] = c;
      });
      return { ...prev, updatedAt: Date.now(), columns: nextCols, cards: nextCards };
    });

    syncManagerRef.current?.broadcast({
      type: 'COLUMN_DELETE',
      columnId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yuumotion-${board.title.toLowerCase().replace(/\s+/g, '-')}-${roomId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.columns && parsed.cards) {
          const nextBoard = { ...parsed, updatedAt: Date.now() };
          setBoard(nextBoard);
          syncManagerRef.current?.broadcast({
            type: 'BOARD_RESET',
            board: nextBoard,
            senderId: currentUser.id
          });
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeUsersList = useMemo(() => {
    const others = Object.values(presenceMap).filter((u) => u.id !== currentUser.id);
    return [currentUser, ...others];
  }, [presenceMap, currentUser]);

  const selectedCard = selectedCardId ? board.cards[selectedCardId] : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-appflowy-bg font-sans text-appflowy-text dark:bg-appflowy-darkBg dark:text-appflowy-darkText">
      <Header
        board={board}
        currentRoom={roomId}
        onRoomChange={setRoomId}
        onlineUsers={activeUsersList}
        currentUser={currentUser}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 overflow-hidden">
        <KanbanBoard
          board={board}
          searchQuery={searchQuery}
          onCardClick={(card) => setSelectedCardId(card.id)}
          onAddCard={handleAddCard}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onDropCard={handleDropCard}
        />
      </main>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          columns={board.columns}
          onClose={() => setSelectedCardId(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
};
