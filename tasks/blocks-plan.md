# Implementation Plan: Sociomile Page Blocks

## Overview
Four full-page, static, themeable compositions of the main Sociomile pages (Ticket inbox, Dashboard, Report,
Setting), built only from Parry UI components, plus a `/blocks` gallery that previews each block in four theme
presets and three viewport widths. Blocks are reference examples (like shadcn Blocks), not product code.

## How the spec maps onto this repo
The spec says `/design-system/...`; this repo has no such folder. Mapping:

| Spec | This repo |
|---|---|
| `/design-system/components(/ui)` | `components/ui/*` (import as `@/components/ui/*`), `cn` from `"cn"` |
| `/design-system/blocks/<id>/`, `_parts/`, `_data/`, `channel-meta.ts`, `block-frame.tsx` | `components/blocks/...` (same names) |
| `blocks/index.tsx` (gallery) | `app/blocks/page.tsx` + `components/blocks/registry.ts` (list of `meta` + component) |
| `/design-system/blocks/[id]` full screen | `app/blocks/[id]/page.tsx` (`params` is a Promise; `generateStaticParams` from the registry) |
| DS theme file | `app/globals.css` (tokens are **hex**, so presets are hex too, not HSL/OKLCH) |

## Architecture decisions
- **Themes = `[data-theme="classic|nightshift|lagoon|contrast"]` blocks in `app/globals.css`**, placed after
  `.dark` so they win at equal specificity. Each preset defines every token in `:root` (≈45, incl.
  `primary-hover`, `link`, `placeholder`, `destructive/success/warning/info` + `-soft`, `chart-1..5`, `sidebar-*`).
  `sync-theme.mjs` only reads `:root`/`.dark`, so the registry `parry-theme` item is unaffected.
  `check-contrast.mjs` is extended to run its pair list over the four presets (proves AA).
- **Preview = real `<iframe src="/blocks/<id>?theme=…">`**, scaled with CSS transform. Reasons: the responsive
  breakpoints (1280/1024/768) are media queries and only react to an iframe's width; Radix overlays portal to
  `<body>` and only pick up the theme if it sits on the iframe's `<html>`.
- **Full-screen route sets `data-theme` on `<html>`** (small client effect reading `?theme=`) and toggles `.dark`
  for `nightshift` so DS `dark:` variants match. `SiteHeader`/`SiteFooter` return `null` on `/blocks/<id>`
  (pathname check) instead of restructuring the root layout into route groups.
- **Header theme toggle** = DropdownMenu of the 4 presets, using the same setter as the route (writes
  `data-theme` + `?theme=`). No global state, no localStorage.
- **Interactivity is local `useState` only** (selection, filters, bulk select, sheet open). No data mutation beyond
  that, no API calls.
- **Guard script** `scripts/check-blocks.mjs` + `npm run check:blocks` (same pattern as `check:portal`): fails on hex
  / arbitrary color classes / palette colors (`text-blue-600`) in `components/blocks/**` except `channel-meta.ts`,
  and on imports outside the allowlist.

## Import allowlist (proposed)
`react`, `next/*`, `lucide-react`, `cn`, `@/components/ui/*`, `@/components/blocks/*`, **plus `recharts` in
`dashboard-01` only** — `components/ui/chart.tsx` is a recharts wrapper (`ChartContainer`, `ChartTooltip`), so the
bar/line primitives must come from recharts. This is the one spec conflict; see Open questions.

## DS gaps found while planning (to be confirmed per block)
| Gap | Plan |
|---|---|
| **No `Sidebar` primitive** (`components/ui/sidebar.tsx` absent) | `_parts/queue-rail.tsx` and the settings nav are composed from `<nav>` + `Button variant="ghost"` + `Badge` + `ScrollArea` + `Tooltip` (icon mode), styled with `bg-sidebar` / `text-sidebar-foreground` / `sidebar-accent` tokens |
| No chat bubble | `_parts/message-bubble.tsx` (inbound / outbound / system) |
| No removable filter chip | `_parts/filter-chips.tsx` from `Button`/`Badge` + `Popover` + `Command` — check `pill.tsx` first and reuse if it fits |
| Presence dot | reuse `Status` (`online`/`degraded`/`maintenance`/`offline` → Available/Busy/Break/Offline, label via children) |
| KPI tile with uppercase label + mono value | `_parts/kpi-tile.tsx` = thin wrapper over `Stat` |
| Sociomile logo asset | `Logo` with a lucide mark + "Sociomile" wordmark unless a real asset is supplied |

Already in the DS and to be reused: `Command`, `Kbd`, `Sheet`, `ToggleGroup`, `Empty`, `DataTable` (sorting +
pagination), `Skeleton`, `Switch`, `Dialog`, `DatePicker`, `Chart`, `Snippet` (for "View code"), `Avatar`, `ScrollArea`.

## Dependency graph
```
T1 theme presets ──┐
                   ├─> T2 full-screen route + AppHeader ──> T3 inbox rail+list ──> T4 conversation ──> T5 context ──> T6 responsive+keys
_data/channel-meta ┘                                                                                                           │
                                                                                                      CHECKPOINT A (user review)
                                                                                                                               │
                                                     T7 dashboard-01 ─┐                                                        │
                                                     T8 report-01    ─┼─ (independent of each other, all need T2) <────────────┘
                                                     T9 settings-01  ─┘
                                                                      └──> T10 gallery + BlockFrame ──> T11 acceptance pass
```
T7–T9 are parallelisable after Checkpoint A (no shared files except `registry.ts` and `_data`).

## Task list
Full acceptance criteria in `tasks/blocks-todo.md`. Each task ends with a commit.

### Phase 1 — Foundation
- **T1** Four theme presets + contrast check (S)
- **T2** Block route `/blocks/[id]`, registry, AppHeader shell, guard script (M)
### Checkpoint: Foundation
`/blocks/ticket-inbox-01?theme=<each>` shows the header in all 4 themes; `check:contrast`, `check:blocks`, tsc, lint green.

### Phase 2 — Ticket inbox (priority)
- **T3** Queue rail + ticket list (filters, bulk bar, rows, empty state) (M)
- **T4** Conversation pane (header, thread, composer, locked state) (M)
- **T5** Context panel (KPI grid, ticket facts, sentiment, classification, escalation) (S)
- **T6** Inbox responsive behaviour + keyboard model (M)
### Checkpoint A — STOP: show the user ticket-inbox-01 (screenshots ×4 themes ×3 widths) and wait for approval.
Review 2026-10-30: the conversation is not shown on the page. The inbox is rail + full-width list, and clicking a ticket
opens the conversation (with ticket details) as a full-screen Dialog. This replaces the spec's four-pane grid.
Review 2026-10-30 (2): the top AppHeader became `_parts/app-shell.tsx`, a floating-sidebar shell after a reference
screenshot: brand, search (/ or ⌘K), Workspace nav (Ticket, Dashboard, Report), General (Setting, Help & docs) and a
profile menu with agent status in a collapsible sidebar; top bar with collapse toggle, agent-status pill, notifications
and theme; page title + description + actions above the content. Every block uses `<AppShell active title …>`.
Review 2026-10-30 (3): sidebar removed again; its contents moved back into a top navbar (brand, Ticket/Dashboard/Report/
Setting with an underline on the active tab, search, agent-status pill, notifications, help, theme, avatar menu).
The page title area, queue column and ticket card stay.
Review 2026-10-30 (4): inbox hides the page header (`AppShell hideHeader`, title kept for screen readers). Search,
filter and sort are Notion-style icon tools (`_parts/view-toolbar.tsx`) right of the ticket count, with the
Conversation/Ticket toggle and Download Excel after them; adding a filter opens a chip row below with the value menu
open. Filters, sort and search act on the sample data. `_parts/filter-chips.tsx` was folded into the toolbar.
Review 2026-10-30 (5): count line set to text-sm; Conversation/Ticket toggle removed.
Review 2026-10-30 (6): ticket detail redesigned from a product brief (`ticket-detail.tsx` + header / timeline / composer /
sidebar). Header carries status, channel, assignee, sentiment, priority, created, age and SLA, with inline status, assign
and Close/Reopen and a grouped More menu. The timeline has filter tabs, day dividers, grouping, relative time (full on
hover), delivery ticks, inline notes and escalations, and jump to latest. The composer has Reply / Escalate / Note, is
compact until focused, and offers "/" quick replies, attachment chips, a counter near 2000 and split Send / Send & Close.
Closed and locked tickets dim the composer behind a banner. The sidebar covers Contact, Ticket details, Internal notes
(replacing "Ticket Note"), Customer history and Activity log. Shortcuts: Alt+1/2/3, Alt+C, Alt+A, Ctrl+Enter.
New DS gaps: no rich-text editor (escalation formatting buttons are visual only); a TooltipTrigger wrapped around a
ToggleGroupItem overwrites its data-state, so tooltips go on the item's label.
Review 2026-10-30 (7): header trimmed to ticket number, status and actions. Ticket info (sentiment, priority, created, age,
SLA, group) moved to an always-visible summary at the top of the sidebar; channel and account moved to a "via …" line
above the composer text box (the From picker when a channel has several accounts).
Review 2026-10-30 (8): assignment moved from the header into the sidebar ticket info (Alt+A opens the details Sheet
below 1280 first); composer gets an emoji picker (DS gap: no emoji picker, composed from Popover + Input + Buttons);
quick-reply popover redone: header with count, items with icon / title / two-line preview / slash code, keyboard footer.
Review 2026-10-30 (9): status selector moved from the header into the sidebar ticket info (header keeps Close/Reopen);
Custom fields is its own accordion section; quick-reply popover made compact (w-80, title + /code row, one-line
preview); Contact can add extra data (email, phone, WhatsApp, company, address, birthday, customer ID; session-local)
and no longer repeats an identity that equals the email or phone.

### Phase 3 — Remaining pages
- **T7** dashboard-01 (M) · **T8** report-01 (M) · **T9** settings-01 (S)
### Checkpoint: all blocks render via `/blocks/<id>?theme=…`

### Phase 4 — Gallery
- **T10** `/blocks` gallery + `BlockFrame` + "Blocks" link in site nav (M)
- **T11** Acceptance pass + final summary (files, DS components per block, DS gaps) (S)

## Risks and mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| next-themes re-applies `.dark` on `<html>` inside the iframe and fights the preset | Wrong `dark:` variants | Route effect owns the class while on `/blocks/<id>`; verify with nightshift + site in light mode and classic + site in dark |
| Contrast preset "2px border" has no token | Spec item not met | Scoped rule in globals.css (`[data-theme="contrast"]` bumps 1px borders to 2px); if it shifts layouts, keep colour-only and log as DS gap |
| 4 iframes on the gallery load 4 full pages | Slow gallery | `loading="lazy"` on iframes; acceptable for a docs page |
| `#1A73D9` / `#4C9CFF` / `#0F7C72` may fail AA for some pairs | Contrast checklist fails | Same approach as existing tokens: keep brand hex where it passes, darken only the failing text-bearing token, comment why |
| `ui/chart` needs recharts imports | Import rule violated | Allowlist `recharts` for dashboard-01 (pending user OK) |

## Open questions
1. **URL:** `/blocks` + `/blocks/[id]` (matches `/templates`, `/components`) instead of `/design-system/blocks/...`? Plan assumes `/blocks`.
2. **recharts** allowed in `dashboard-01` imports (required by the DS chart wrapper)?
3. **Sidebar gap:** OK to compose the rail from Button/Badge/ScrollArea, or should `shadcn add sidebar` be added to the DS first (that would be a new primitive, which the spec forbids inside blocks)?
4. Add "Blocks" to the site header nav and README registry list? Plan adds the nav link only.
