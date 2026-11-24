# Yuumotion Design System (AppFlowy-Inspired)

This document establishes the UI/UX specifications for Yuumotion, modeled after AppFlowy's clean desktop and web interface.

## 1. Color Palette

### Surfaces
- Background: `#FFFFFF` (Light) / `#1C1C1E` (Dark)
- Sidebar / Header: `#F7F8FA` (Light) / `#141416` (Dark)
- Card Surface: `#FFFFFF` (Light) / `#252528` (Dark)
- Subtle Border: `#E5E7EB` (Light) / `#2E2E32` (Dark)

### Pastel Tag Colors (AppFlowy Signature)
- Purple: Background `#F3E8FF`, Text `#7E22CE`
- Blue: Background `#DBEAFE`, Text `#1D4ED8`
- Green: Background `#DCFCE7`, Text `#15803D`
- Yellow / Amber: Background `#FEF3C7`, Text `#B45309`
- Pink / Rose: Background `#FFE4E6`, Text `#BE123C`
- Gray / Neutral: Background `#F3F4F6`, Text `#4B5563`

## 2. Typography
- Font Family: `Inter`, system-ui, sans-serif
- Hierarchy:
  - Page / Board Title: 20px / 24px, Bold (`font-semibold`)
  - Column Header: 13px, Medium (`font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider`)
  - Card Title: 14px, Medium (`font-medium text-neutral-800 dark:text-neutral-200`)
  - Metadata / Badges: 12px, Regular (`text-xs font-medium rounded-md px-2 py-0.5`)

## 3. Component Specs

### Kanban Column
- Container: `w-72 flex-shrink-0 bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl p-3 flex flex-col`
- Header: Title with card counter pill, column color dot, and action menu.
- Card List: Droppable zone with vertical gap (`space-y-2.5`).
- Quick Add Button: `+ New` button at column footer.

### Kanban Card
- Container: `bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/80 dark:border-neutral-700/60 p-3 shadow-xs hover:shadow-md transition-shadow cursor-pointer`
- Content Layout:
  - Top: Tag badges
  - Middle: Card title & brief summary
  - Bottom: Due date indicator, task checklist progress pill, and assigned member avatars

### Card Detail Modal (AppFlowy Document View)
- Large dialog centered or right drawer (`max-w-3xl w-full`).
- Header: Status selector, priority dropdown, tags picker, due date picker.
- Body: Full-width rich text / markdown document space for project notes and checklist items.
