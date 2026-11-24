# Design

## Visual Theme & Register
- **Theme**: Linear High-Precision, Zinc Deep Industrial adaptive theme with crisp 1px borders.
- **Dark Palette**:
  - Background: `#09090B` (zinc-950)
  - Card / Panel Surface: `#18181B` (zinc-900)
  - Nav Bar & Headers: `#121215`
  - Borders: 1px `#27272A` (zinc-800)
  - Hover: `#222226`
  - Text: `#F4F4F5` (zinc-100), Muted: `#A1A1AA` (zinc-400)
- **Light Palette**:
  - Background: `#FAFAFA` (zinc-50)
  - Card / Panel Surface: `#FFFFFF`
  - Nav Bar & Headers: `#F4F4F5`
  - Borders: 1px `#E4E4E7` (zinc-200)
  - Hover: `#F4F4F5`
  - Text: `#09090B` (zinc-950), Muted: `#71717A` (zinc-500)
- **Neon Status Indicators**:
  - Urgent: Neon Rose (`#F43F5E`)
  - High: Vivid Amber (`#F59E0B`)
  - Medium: Electric Blue (`#3B82F6`)
  - Done: Neon Emerald (`#10B981`)
  - Primary Accent: Violet Listrik (`#7C3AED` light, `#8B5CF6` dark)

## Typography
- **Font Stack**: System sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Code / Shortcuts**: Monospaced font (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`).

## Surfaces & Borders
- **Border Radius**: `rounded-xl` (12px) untuk kartu, kolom kanban, dan modal dialog; `rounded-lg` (8px) untuk tombol dan input kontrol.
- **Borders**: 1px solid tegas di seluruh panel dan kartu untuk ketajaman visual maksimal.

## Component System
- Reusable UI kit in `src/components/ui/`: `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Badge`, `Kbd`, `Separator`, `Dialog`, `Tabs`, `Toast`, `TagPicker`, `AttachmentCard`.
