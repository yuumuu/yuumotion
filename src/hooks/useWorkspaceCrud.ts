import React from 'react';
import {
  AuthUser,
  Board,
  Card,
  ChecklistItem,
  Column,
  NotionPage,
  Workspace,
  WorkspaceTemplateType
} from '../types/board';
import { INITIAL_BOARD } from '../lib/constants';
import { setActiveWorkspaceId } from '../lib/auth';
import { createSyncManager } from '../lib/sync';
import { BoardTemplate } from '../data/boardTemplates';
import { ActivityService } from '../services/activityService';
import { toast } from '../components/ui';

interface UseWorkspaceCrudParams {
  currentUser: AuthUser;
  canEdit: boolean;
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  activeWorkspace: Workspace;
  activeWorkspaceId: string;
  setActiveWorkspaceIdState: (id: string) => void;
  activeBoard: Board;
  activeTarget: { type: 'workspace' | 'board' | 'page'; id: string };
  setActiveTarget: React.Dispatch<React.SetStateAction<{ type: 'workspace' | 'board' | 'page'; id: string }>>;
  syncManagerRef: React.MutableRefObject<ReturnType<typeof createSyncManager> | null>;
  onSelectWorkspace: (wsId: string) => void;
}

export function useWorkspaceCrud({
  currentUser,
  canEdit,
  workspaces,
  setWorkspaces,
  activeWorkspace,
  activeWorkspaceId,
  setActiveWorkspaceIdState,
  activeBoard,
  activeTarget,
  setActiveTarget,
  syncManagerRef,
  onSelectWorkspace
}: UseWorkspaceCrudParams) {
  const handleCreateWorkspace = (
    name: string,
    icon: string,
    template: WorkspaceTemplateType = 'full'
  ) => {
    const wsId = `ws-${Date.now()}`;
    const starterBoardId = `board-${Date.now()}`;
    const starterPageId = `page-${Date.now() + 1}`;
    const includeBoard = template === 'board' || template === 'full';
    const includeDocs = template === 'docs' || template === 'full';

    const newWs: Workspace = {
      id: wsId,
      name,
      icon,
      ownerId: currentUser.id,
      currentRole: 'owner',
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          color: currentUser.color,
          role: 'owner',
          joinedAt: Date.now(),
          title: currentUser.title,
          bio: currentUser.bio,
          timezone: currentUser.timezone,
          avatarUrl: currentUser.avatarUrl,
          avatarEmoji: currentUser.avatarEmoji,
          presenceStatus: currentUser.presenceStatus
        }
      ],
      boards: includeBoard
        ? [
            {
              ...INITIAL_BOARD,
              id: starterBoardId,
              workspaceId: wsId,
              title: `${name} Roadmap`,
              updatedAt: Date.now()
            }
          ]
        : [],
      pages: includeDocs
        ? [
            {
              id: starterPageId,
              workspaceId: wsId,
              title: `Panduan ${name}`,
              icon: '📝',
              coverImage:
                'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
              contentHtml: `<h1>Selamat datang di ${name}</h1><p>Mulai tulis catatan, spesifikasi PRD, atau dokumentasi tim di sini. Ketik <code>/</code> untuk membuka menu blok cepat.</p>`,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]
        : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceIdState(wsId);
    setActiveWorkspaceId(wsId, currentUser);
    if (includeBoard) {
      setActiveTarget({ type: 'board', id: starterBoardId });
    } else if (includeDocs) {
      setActiveTarget({ type: 'page', id: starterPageId });
    }
    toast.success(`Workspace "${name}" berhasil dibuat.`);
  };

  const handleUpdateActiveWorkspace = (updated: Workspace) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleDeleteWorkspace = (wsId: string) => {
    const nextWs = workspaces.filter((w) => w.id !== wsId);
    setWorkspaces(nextWs);
    if (nextWs.length > 0) {
      onSelectWorkspace(nextWs[0].id);
    } else {
      setActiveWorkspaceIdState('');
    }
    toast.info('Workspace telah dihapus.');
  };

  const handleAddPage = (
    parentId?: string,
    initial?: { title: string; contentHtml: string; icon?: string }
  ) => {
    if (!canEdit) return;

    const newPage: NotionPage = {
      id: `page-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      parentId,
      title: initial?.title || (parentId ? 'Sub-halaman Baru' : 'Untitled Document'),
      icon: initial?.icon || '📄',
      contentHtml: initial?.contentHtml || '<p></p>',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, pages: [...ws.pages, newPage] } : ws
      )
    );
    setActiveTarget({ type: 'page', id: newPage.id });

    syncManagerRef.current?.broadcast({
      type: 'PAGE_UPSERT',
      page: newPage,
      senderId: currentUser.id
    });
    toast.success('Halaman dokumen baru berhasil dibuat.');
  };

  const handleUpdatePage = (updated: NotionPage) => {
    if (!canEdit) return;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              pages: ws.pages.map((p) => (p.id === updated.id ? updated : p))
            }
          : ws
      )
    );

    syncManagerRef.current?.broadcast({
      type: 'PAGE_UPSERT',
      page: updated,
      senderId: currentUser.id
    });
  };

  const handleRenamePage = (pageId: string, newTitle: string) => {
    if (!canEdit) return;
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              pages: ws.pages.map((p) =>
                p.id === pageId ? { ...p, title: newTitle, updatedAt: Date.now() } : p
              )
            }
          : ws
      )
    );
    toast.success('Nama dokumen diperbarui.');
  };

  const handleDeletePage = (pageId: string) => {
    if (!canEdit) return;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? { ...ws, pages: ws.pages.filter((p) => p.id !== pageId) }
          : ws
      )
    );

    if (activeTarget.type === 'page' && activeTarget.id === pageId) {
      const remainingPages = activeWorkspace.pages.filter((p) => p.id !== pageId);
      if (remainingPages.length > 0) {
        setActiveTarget({ type: 'page', id: remainingPages[0].id });
      } else if (activeWorkspace.boards.length > 0) {
        setActiveTarget({ type: 'board', id: activeWorkspace.boards[0].id });
      }
    }

    syncManagerRef.current?.broadcast({
      type: 'PAGE_DELETE',
      pageId,
      senderId: currentUser.id,
      updatedAt: Date.now()
    });
    toast.info('Halaman dokumen telah dihapus.');
  };

  const handleAddBoard = (title: string) => {
    if (!canEdit) return;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      title,
      columns: INITIAL_BOARD.columns.map((c) => ({ ...c, updatedAt: Date.now() })),
      cards: {},
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, boards: [...ws.boards, newBoard] } : ws
      )
    );
    setActiveTarget({ type: 'board', id: newBoard.id });
    toast.success(`Board "${title}" berhasil dibuat.`);
  };

  const handleRenameBoard = (boardId: string, newTitle: string) => {
    if (!canEdit) return;
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              boards: ws.boards.map((b) =>
                b.id === boardId ? { ...b, title: newTitle, updatedAt: Date.now() } : b
              )
            }
          : ws
      )
    );
    toast.success('Nama papan diperbarui.');
  };

  const handleDeleteBoard = (boardId: string) => {
    if (!canEdit) return;

    const remainingBoards = activeWorkspace.boards.filter((b) => b.id !== boardId);
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId ? { ...ws, boards: remainingBoards } : ws
      )
    );

    if (activeTarget.type === 'board' && activeTarget.id === boardId) {
      if (remainingBoards.length > 0) {
        setActiveTarget({ type: 'board', id: remainingBoards[0].id });
      } else if (activeWorkspace.pages.length > 0) {
        setActiveTarget({ type: 'page', id: activeWorkspace.pages[0].id });
      }
    }
    toast.success('Papan Kanban berhasil dihapus.');
  };

  const handleUpdateActiveBoard = (updater: (prevBoard: Board) => Board) => {
    if (!canEdit) return;

    setWorkspaces((prevWs) =>
      prevWs.map((ws) => {
        if (ws.id !== activeWorkspaceId) return ws;
        const nextBoards = ws.boards.map((b) => (b.id === activeBoard.id ? updater(b) : b));
        return { ...ws, boards: nextBoards };
      })
    );
  };

  const createCardWithOptionalDate = (columnId: string, title: string, dueDate?: string) => {
    if (!canEdit) return;

    const newCard: Card = {
      id: `card-${Date.now()}`,
      columnId,
      title,
      description: '',
      tags: [],
      priority: dueDate ? 'medium' : 'low',
      dueDate,
      checklist: [],
      attachments: [],
      order: Object.values(activeBoard.cards).filter((c) => c.columnId === columnId).length,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [newCard.id]: newCard }
    }));

    syncManagerRef.current?.broadcast({
      type: 'CARD_UPSERT',
      card: newCard,
      senderId: currentUser.id
    });
    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId: activeBoard.id,
      cardId: newCard.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'card.created',
      summary: `menambahkan kartu "${title}"`
    });
    toast.success(`Kartu "${title}" berhasil ditambahkan.`);
  };

  const handleAddCard = (columnId: string, title: string) => {
    createCardWithOptionalDate(columnId, title);
  };

  const handleAddCardOnDate = (columnId: string, title: string, dueDate: string) => {
    createCardWithOptionalDate(columnId, title, dueDate);
  };

  const handleUpdateCard = (updated: Card) => {
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => ({
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
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => {
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
    toast.info('Kartu telah dihapus.');
  };

  const handleConvertChecklistToCard = (sourceCardId: string, item: ChecklistItem) => {
    if (!canEdit) return;
    const sourceCard = activeBoard.cards[sourceCardId];
    if (!sourceCard) return;

    const newCardId = `card-${Date.now()}`;
    const newCard: Card = {
      id: newCardId,
      columnId: sourceCard.columnId,
      title: item.text,
      description: '',
      tags: [],
      priority: 'medium',
      dueDate: item.dueDate,
      assignees: item.assigneeId ? [item.assigneeId] : undefined,
      checklist: [],
      attachments: [],
      order: Object.values(activeBoard.cards).filter((c) => c.columnId === sourceCard.columnId).length,
      updatedAt: Date.now()
    };

    const updatedSource: Card = {
      ...sourceCard,
      checklist: sourceCard.checklist.filter((c) => c.id !== item.id),
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: {
        ...prev.cards,
        [sourceCardId]: updatedSource,
        [newCardId]: newCard
      }
    }));

    syncManagerRef.current?.broadcast({ type: 'CARD_UPSERT', card: updatedSource, senderId: currentUser.id });
    syncManagerRef.current?.broadcast({ type: 'CARD_UPSERT', card: newCard, senderId: currentUser.id });
    toast.success(`Sub-tugas "${item.text}" dijadikan kartu baru.`);
  };

  const handleDropCard = (cardId: string, targetColumnId: string) => {
    if (!canEdit) return;

    const card = activeBoard.cards[cardId];
    if (!card || card.columnId === targetColumnId) return;

    const targetOrder = Object.values(activeBoard.cards).filter((c) => c.columnId === targetColumnId).length;
    const updatedCard: Card = {
      ...card,
      columnId: targetColumnId,
      order: targetOrder,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      cards: { ...prev.cards, [cardId]: updatedCard }
    }));

    const targetCol = activeBoard.columns.find((c) => c.id === targetColumnId);
    const isDoneCol = Boolean(
      targetCol &&
        (targetCol.title.toLowerCase().includes('done') ||
          targetCol.title.toLowerCase().includes('selesai') ||
          targetCol.title.toLowerCase().includes('completed'))
    );

    if (isDoneCol && card.recurrence && activeBoard.columns[0]) {
      const firstColId = activeBoard.columns[0].id;
      const baseDate = card.dueDate ? new Date(card.dueDate) : new Date();
      const nextDate = new Date(baseDate);
      if (card.recurrence.frequency === 'daily') {
        nextDate.setDate(baseDate.getDate() + card.recurrence.interval);
      } else if (card.recurrence.frequency === 'weekly') {
        nextDate.setDate(baseDate.getDate() + card.recurrence.interval * 7);
      } else {
        nextDate.setMonth(baseDate.getMonth() + card.recurrence.interval);
      }
      const nextDueStr = nextDate.toISOString().slice(0, 10);
      const recurringCard: Card = {
        ...card,
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        columnId: firstColId,
        dueDate: nextDueStr,
        checklist: card.checklist.map((item) => ({ ...item, completed: false })),
        order: Object.values(activeBoard.cards).filter((c) => c.columnId === firstColId).length,
        updatedAt: Date.now()
      };
      handleUpdateActiveBoard((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        cards: { ...prev.cards, [recurringCard.id]: recurringCard }
      }));
      toast.success(`Tugas berulang dibuat untuk ${nextDueStr}.`);
    }

    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId: activeBoard.id,
      cardId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'card.moved',
      summary: `memindahkan kartu "${card.title}" ke ${targetCol?.title || 'kolom baru'}`
    });

    syncManagerRef.current?.broadcast({
      type: 'CARD_MOVE',
      cardId,
      targetColumnId,
      targetOrder,
      senderId: currentUser.id,
      updatedAt: updatedCard.updatedAt
    });
    toast.info('Kartu dipindahkan.');
  };

  const handleCreateBoardFromTemplate = (template: BoardTemplate) => {
    if (!canEdit) return;
    const boardId = `board-${Date.now()}`;
    const columns: Column[] = template.columns.map((col, idx) => ({
      id: `col-${Date.now()}-${idx}`,
      title: col.title,
      color: col.color,
      order: idx,
      wipLimit: col.wipLimit,
      updatedAt: Date.now()
    }));

    const cards: Record<string, Card> = {};
    template.sampleCards.forEach((sc, idx) => {
      const targetCol = columns[sc.columnIndex] || columns[0];
      if (!targetCol) return;
      const cid = `card-${Date.now()}-${idx}`;
      cards[cid] = {
        id: cid,
        columnId: targetCol.id,
        title: sc.title,
        description: sc.description,
        tags: [],
        priority: sc.priority,
        checklist: [],
        attachments: [],
        order: idx,
        updatedAt: Date.now()
      };
    });

    const newBoard: Board = {
      id: boardId,
      workspaceId: activeWorkspace.id,
      title: template.name,
      columns,
      cards,
      updatedAt: Date.now()
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspace.id ? { ...ws, boards: [...ws.boards, newBoard] } : ws
      )
    );
    setActiveTarget({ type: 'board', id: boardId });
    ActivityService.record({
      workspaceId: activeWorkspace.id,
      boardId,
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'board.created',
      summary: `membuat papan "${template.name}" dari template`
    });
    toast.success(`Papan "${template.name}" berhasil dibuat.`);
  };

  const handleAddColumn = (title: string, color: string) => {
    if (!canEdit) return;

    const newCol: Column = {
      id: `col-${Date.now()}`,
      title,
      color,
      order: activeBoard.columns.length,
      updatedAt: Date.now()
    };

    handleUpdateActiveBoard((prev) => ({
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
    if (!canEdit) return;

    handleUpdateActiveBoard((prev) => {
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

  const handleReorderColumns = (columnId: string, targetIndex: number) => {
    if (!canEdit) return;
    handleUpdateActiveBoard((prev) => {
      const sorted = [...prev.columns].sort((a, b) => a.order - b.order);
      const col = sorted.find((c) => c.id === columnId);
      if (!col) return prev;
      const without = sorted.filter((c) => c.id !== columnId);
      without.splice(targetIndex, 0, col);
      return {
        ...prev,
        updatedAt: Date.now(),
        columns: without.map((c, idx) => ({ ...c, order: idx, updatedAt: Date.now() }))
      };
    });
  };

  const handleUpdateWipLimit = (columnId: string, wipLimit?: number) => {
    if (!canEdit) return;
    handleUpdateActiveBoard((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      columns: prev.columns.map((c) =>
        c.id === columnId ? { ...c, wipLimit, updatedAt: Date.now() } : c
      )
    }));
  };

  const handleRenameCard = (cardId: string, newTitle: string) => {
    if (!canEdit) return;
    const card = activeBoard.cards[cardId];
    if (!card) return;
    handleUpdateCard({ ...card, title: newTitle, updatedAt: Date.now() });
  };

  const handleExport = () => {
    const exportData = {
      workspace: activeWorkspace,
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yuumotion-workspace-${activeWorkspace.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed?.workspace?.boards) {
          handleUpdateActiveWorkspace({ ...parsed.workspace, updatedAt: Date.now() });
        } else if (parsed?.columns && parsed?.cards) {
          handleUpdateActiveBoard(() => ({ ...parsed, updatedAt: Date.now() }));
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return {
    handleCreateWorkspace,
    handleUpdateActiveWorkspace,
    handleDeleteWorkspace,
    handleAddPage,
    handleUpdatePage,
    handleRenamePage,
    handleDeletePage,
    handleAddBoard,
    handleRenameBoard,
    handleDeleteBoard,
    handleUpdateActiveBoard,
    handleAddCard,
    handleAddCardOnDate,
    handleUpdateCard,
    handleDeleteCard,
    handleConvertChecklistToCard,
    handleDropCard,
    handleCreateBoardFromTemplate,
    handleAddColumn,
    handleDeleteColumn,
    handleReorderColumns,
    handleUpdateWipLimit,
    handleRenameCard,
    handleExport,
    handleImport
  };
}
