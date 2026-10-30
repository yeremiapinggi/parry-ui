# Sociomile page blocks — summary

Gallery: `/blocks` · full screen: `/blocks/<id>?theme=classic|nightshift|lagoon|contrast`.
Plan and review log: `tasks/blocks-plan.md` · checklist: `tasks/blocks-todo.md`.

## Acceptance (2026-10-30)
| Check | Result |
|---|---|
| No hex / arbitrary / palette colours in `components/blocks/**` except `channel-meta.ts` | `npm run check:blocks` → 40 files, 0 problems; grep clean |
| Imports only DS, React, Next, lucide-react (+ `cn`) | Only extra: `recharts` in `dashboard-01` (DS Chart wraps it; agreed in plan) |
| 4 blocks × 4 themes render, no unreadable text or hard-coded white | Checked in browser; `npm run check:contrast` → 0 failures (block presets included) |
| Ticket inbox at 1440 / 1024 / 390 without horizontal page scroll | scrollWidth = innerWidth at all three |
| Keyboard | Tab order navbar → rail → list; ↑/↓ moves ticket focus; `/` opens search; composer reached inside the ticket dialog; Esc in inline edits cancels only the edit |
| tsc, lint, build | `tsc --noEmit` ok · `npm run lint` exit 0 · `npm run build` ok (all four block routes prerendered) |

The inbox layout changed at review: conversations open in a full-screen dialog instead of the spec's four-pane grid,
and the shell is a top navbar with a page title area (see the review log in the plan).

## Files
- Theme presets: `app/globals.css` (`[data-theme=…]` ×4), `scripts/check-contrast.mjs` (checks them)
- Routes: `app/blocks/page.tsx` (gallery), `app/blocks/[id]/page.tsx` (full screen); `components/site-header.tsx`, `components/site-footer.tsx` (hide on block pages, Blocks nav link)
- Guard: `scripts/check-blocks.mjs` (`npm run check:blocks`)
- `components/blocks/`: `registry.ts`, `channel-meta.ts`, `block-frame.tsx`, `blocks-gallery.tsx`
- `_data/`: `tickets.ts`, `team.ts`, `channels.ts`, `kpis.ts`, `notifications.ts`, `dashboard.ts`, `reports.ts`
- `_parts/`: `app-shell.tsx`, `agent-status.tsx`, `presence-dot.tsx`, `channel-icon.tsx`, `queue-rail.tsx`, `view-toolbar.tsx`, `ticket-row.tsx`, `message-bubble.tsx`, `kpi-tile.tsx`, `block-themes.ts`, `block-theme-root.tsx`, `time.ts`
- `ticket-inbox-01/`: `page.tsx`, `components/{inbox, ticket-list, ticket-actions, ticket-detail, ticket-header, ticket-timeline, ticket-composer, ticket-sidebar, ticket-meta, emoji-picker}`
- `dashboard-01/`, `report-01/`, `settings-01/`: `page.tsx` + one component each

## DS components used
| Block | Components |
|---|---|
| Shell & parts | avatar, badge, button, card, checkbox, command, dropdown-menu, input-group, kbd, label, popover, select, separator, stat, tooltip |
| ticket-inbox-01 | accordion, alert, avatar, badge, button, button-group, checkbox, command, dialog, dropdown-menu, empty, input, kbd, label, pagination, pill, popover, scroll-area, select, separator, sheet, textarea, timeline, toggle, toggle-group, tooltip |
| dashboard-01 | avatar, card, chart, progress, select, table |
| report-01 | badge, button, card, data-table, data-toolbar, empty, select, skeleton |
| settings-01 | badge, button, card, dialog, empty, input, label, select, switch, toggle-group |
| Gallery | card, popover, select, snippet, tabs, toggle-group |

## DS gaps (composed in `_parts` or worked around)
1. **No Sidebar** — queue rail and settings nav composed from Button / Badge / ScrollArea.
2. **No chat bubble** — `_parts/message-bubble.tsx` (inbound, outbound, system, note, escalation).
3. **No removable filter / view toolbar** — `_parts/view-toolbar.tsx` (Notion-style filter, sort, search).
4. **No brand channel icons** (lucide v1 has none) — generic glyph on brand colour in `channel-meta.ts`.
5. **Status has no dot-only variant** — `_parts/presence-dot.tsx`.
6. **Stat delta assumes up = good** — `KpiTile` renders its own trend with `goodWhen`.
7. **No emoji picker** — composed from Popover + Input + Buttons.
8. **No rich-text editor** — escalation formatting buttons are visual only.
9. **CommandDialog doesn't render a `Command` root** — callers add it.
10. **AccordionContent freezes its height at open and adds `mb-4` to `<p>`** — overridden in the sidebar Section.
11. **ScrollArea root has no `overflow-hidden`** — its scrollbar layer leaks height into a parent scroller; added where panes fill the window.
12. **TooltipTrigger on a ToggleGroupItem overwrites its `data-state`** — tooltip placed on the item's label.
13. **DatePicker is single-date only** — date ranges use preset Selects.

## Known limits
- Sample data only; changes (status, notes, contacts, channels) last for the session and the list doesn't reflect detail edits.
- Dashboard filters and the report date filter don't change figures (report filters do filter rows).
- `.dark` (site theme) has muted-foreground on accent at 4.49:1; block presets pass.
