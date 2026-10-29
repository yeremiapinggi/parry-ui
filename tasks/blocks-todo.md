# Todo: Sociomile Page Blocks

Plan: `tasks/blocks-plan.md`. Commit after each task. Paths are relative to the repo root.

## Task 1: Four theme presets + contrast check
**Description:** Add `classic`, `nightshift`, `lagoon`, `contrast` as `[data-theme="…"]` blocks in `app/globals.css`, each defining every token `:root` defines. Extend the contrast script to check them.

**Acceptance criteria:**
- [x] Each preset sets all `:root` tokens (same key set — scripted diff, not eyeballed), using the spec's key hexes: classic bg `#F1F3F6` card `#FFFFFF` primary `#1A73D9` sidebar `#FFFFFF`; nightshift bg `#0D1117` card `#151B23` primary `#4C9CFF` sidebar `#0A0E13` fg `#E2E8EF`; lagoon bg `#EDF3F2` card `#FFFFFF` primary `#0F7C72` sidebar `#0E3B3A` sidebar-fg `#E5F2F0` radius 14px; contrast bg `#FFFFFF` fg `#000000` primary `#0046B8` border `#000000` radius 4px
- [x] Contrast preset borders render 2px (scoped rule), or the fallback is logged as a DS gap
- [x] Any brand hex darkened for AA carries a one-line comment, as existing tokens do
- [x] `:root` / `.dark` unchanged; `npm run registry:build` output for `parry-theme` unchanged

**Verification:**
- [x] `npm run check:contrast` passes for `:root`, `.dark` and all 4 presets
- [x] `git diff registry.json` empty after `node scripts/sync-theme.mjs`

**Dependencies:** None
**Files:** `app/globals.css`, `scripts/check-contrast.mjs`
**Scope:** S

## Task 2: Block route, registry, AppHeader shell, guard script
**Description:** Full-screen route `/blocks/[id]?theme=` rendering a block with site chrome hidden; shared data + channel map; the AppHeader used by every block; the hex/import guard.

**Acceptance criteria:**
- [x] `app/blocks/[id]/page.tsx` with `generateStaticParams` from `components/blocks/registry.ts`; unknown id → `notFound()`
- [x] `?theme=` sets `data-theme` on `<html>` (default `classic`), `.dark` only for nightshift; portaled overlays follow the theme
- [x] `SiteHeader` / `SiteFooter` render nothing on `/blocks/<id>`
- [x] `components/blocks/_data/{tickets,team,channels,kpis,notifications}.ts` typed; obviously sample (Indonesian names, `#3xx` numbers)
- [x] `components/blocks/channel-meta.ts`: id → label, lucide icon, brand colour (the only file with hex)
- [x] `_parts/app-header.tsx` (now `_parts/app-shell.tsx`: top navbar + page title area, after review 2026-10-30): logo · nav Ticket/Dashboard/Report/Setting (active from prop) · search Input with `/` Kbd hint opening a `CommandDialog` with the 9 "Search by" scopes · `AgentStatus` DropdownMenu (Available/Busy/Break/Offline with dot) · Notifications Popover · Help menu (Contact Us, Manual Book) · theme preset menu · Avatar menu (Setting, Change Password, Logout)
- [x] Every icon-only button has `aria-label`; `/` focuses search from anywhere except text fields
- [x] `scripts/check-blocks.mjs` + `npm run check:blocks`: fails on hex, `[#`, `rgb(`, palette colour classes, and non-allowlisted imports under `components/blocks/**` (except `channel-meta.ts`)
- [x] ticket-inbox-01 stub exports `meta = { id, title, description, category: "Main pages" }` and renders the header

**Verification:**
- [x] Browser: `/blocks/ticket-inbox-01?theme=` each of 4 → header readable, menus open in theme, no site chrome
- [x] `npm run check:blocks`, `npx tsc --noEmit`, `npm run lint` pass
- [x] Guard self-check: temporarily add `text-blue-600` to a block → script fails

**Dependencies:** Task 1
**Files:** `app/blocks/[id]/page.tsx`, `components/blocks/{registry.ts,channel-meta.ts,_data/*,_parts/app-header.tsx,_parts/agent-status.tsx,ticket-inbox-01/page.tsx}`, `components/site-header.tsx`, `components/site-footer.tsx`, `scripts/check-blocks.mjs`, `package.json`
**Scope:** M

### Checkpoint: Foundation
- [x] Header works in 4 themes; all checks green; commit

## Task 3: Inbox — queue rail + ticket list
**Description:** Left two panes of ticket-inbox-01.

**Acceptance criteria:**
- [x] `_parts/queue-rail.tsx` (composed, sidebar tokens): Views with tabular-number Badges (My tickets, Unreplied, Progress active, Pending, Escalated, Out SLA, Bookmark, Closed, All); Channels with + action, icon, count, disconnected one muted; "Team Yp Corp" with online/total and agents' presence dot + load
- [x] List header: view title + ToggleGroup Conversation | Ticket
- [x] `_parts/filter-chips.tsx`: removable chips (Date range, Assignee, Sort, Sentiment, Channel type, Lock), "+ Add filter" Popover listing removed ones; no custom filters
- [x] Bulk bar: "Select all · N shown" ↔ grouped actions (Assign / Status / Sentiment / More with the spec's items) when ≥1 selected
- [x] `_parts/ticket-row.tsx`: ~64px, checkbox · name · mono `#380` · relative time; truncated preview; badges channel, source account, state (Replied/Unreplied/Pending/`Out SLA · 2h` destructive), reply count; kebab menu = bulk actions; selected = `bg-accent` + left primary bar; row is a button
- [x] Selecting a view with 0 tickets shows `Empty`

**Verification:**
- [x] Browser 1440: select/unselect rows, remove + re-add a chip, switch to an empty view
- [x] `check:blocks`, tsc, lint pass

**Dependencies:** Task 2
**Files:** `components/blocks/ticket-inbox-01/{page.tsx,components/ticket-list.tsx,components/bulk-bar.tsx}`, `components/blocks/_parts/{queue-rail,filter-chips,ticket-row}.tsx`
**Scope:** M

## Task 4: Inbox — conversation pane
**Acceptance criteria:**
- [x] Header: Avatar, name, "Webchat · Pingot Chat · opened 24 Sep 2026, 17:04"; Assign (outline), Pending (outline), Close ticket (primary)
- [x] Thread in ScrollArea: day separator, inbound `bg-muted`, outbound `bg-primary text-primary-foreground` with agent + time, centred system events — via `_parts/message-bubble.tsx`
- [x] Composer Card: Textarea, attach, emoji (lucide icon, no emoji glyph), Note/Template switch, Send primary
- [x] Locked-by-other-agent ticket disables the composer with a visible reason
- [x] Thread follows the selected ticket from Task 3

**Verification:** Browser: switch tickets incl. a locked one; `check:blocks`, tsc, lint
**Dependencies:** Task 3
**Files:** `components/blocks/ticket-inbox-01/components/{conversation,composer}.tsx`, `components/blocks/_parts/message-bubble.tsx`
**Scope:** M

## Task 5: Inbox — context panel
**Acceptance criteria:**
- [x] "Team today" 2×2 `KpiTile` (wrapper over `Stat`): ART 11s, TR 2, ARR 100%, Target 0 — uppercase muted label, mono tabular value
- [x] "Ticket #380" key/value: Assignee, Group, Lock, Age (follows selection)
- [x] Sentiment ToggleGroup Positive/Neutral/Negative
- [x] Selects: Caller case (Customer, Dealer, KTB), Warranty (Active, Expired), Category, Sub category 1–3; Escalation: Group escalation + Email group — all labelled

**Verification:** Browser 1440 four panes at 232 / 360 / 1fr / 280; `check:blocks`, tsc, lint
**Dependencies:** Task 4
**Files:** `components/blocks/ticket-inbox-01/components/context-panel.tsx`, `components/blocks/_parts/kpi-tile.tsx`
**Scope:** S

## Task 6: Inbox — responsive + keyboard
**Acceptance criteria:**
- [x] Page = rail + full-width list; a ticket opens as a full-screen Dialog (conversation + details from 1280, details in a `Sheet` below) — changed at Checkpoint A review (2026-10-30) · 768–1023: rail icon-only with Tooltips · <768: rail in a Sheet
- [x] No horizontal page scroll at 1440, 1024, 390
- [x] Tab order header → rail → list → composer; ↑/↓ moves ticket selection within the list; `/` focuses search; focus ring visible everywhere

**Verification:**
- [x] Browser `resize_window` 1440 / 1024 / 390: `document.documentElement.scrollWidth <= innerWidth`
- [x] Keyboard walk recorded in the checkpoint notes
- [x] `check:blocks`, tsc, lint

**Dependencies:** Task 5
**Files:** `components/blocks/ticket-inbox-01/**`, `components/blocks/_parts/queue-rail.tsx`
**Scope:** M

### Checkpoint A — STOP for user review
- [x] Screenshots: 4 themes × 1440, plus 1024 and 390 in classic
- [ ] Interim DS gaps list
- [ ] Wait for user approval before Task 7

## Task 7: dashboard-01
**Acceptance criteria:**
- [ ] AppHeader active = Dashboard; filter bar (DatePicker range + channel Select)
- [ ] KPI row: ART, TR, ARR, Target, Open tickets, Out SLA (`KpiTile`)
- [ ] DS `Chart`: tickets per channel (bar), response-time trend (line), sentiment split (stacked bar); colours from `chart-*` tokens only
- [ ] Agent table (agent, status, handled, ART, ARR) with DS `Table`
- [ ] `meta` exported and registered

**Verification:** Browser 4 themes at 1440 + 390; `check:blocks`, tsc, lint
**Dependencies:** Checkpoint A
**Files:** `components/blocks/dashboard-01/**`, `components/blocks/_data/kpis.ts`, `components/blocks/registry.ts`
**Scope:** M

## Task 8: report-01
**Acceptance criteria:**
- [ ] AppHeader active = Report; left list of report types (Ticket report, Agent performance, Channel report, SLA report, Sentiment) as buttons
- [ ] Filter bar: date, group, channel, agent; "Download Excel" button
- [ ] `DataTable` with sorting + pagination; empty state (`Empty`) and loading state (`Skeleton`) reachable from the UI
- [ ] `meta` exported and registered

**Verification:** Browser: sort, page, trigger empty + loading; 4 themes; `check:blocks`, tsc, lint
**Dependencies:** Checkpoint A
**Files:** `components/blocks/report-01/**`, `components/blocks/registry.ts`
**Scope:** M

## Task 9: settings-01
**Acceptance criteria:**
- [ ] AppHeader active = Setting; settings nav (General, User, Account, Channel active, Team & Group, SLA, Custom fields) — composed like the rail
- [ ] Channel cards: icon, name, connected account, status Badge, Switch (labelled), "Manage" button
- [ ] "Add channel" `Dialog`
- [ ] `meta` exported and registered

**Verification:** Browser 4 themes at 1440 + 390; `check:blocks`, tsc, lint
**Dependencies:** Checkpoint A
**Files:** `components/blocks/settings-01/**`, `components/blocks/registry.ts`
**Scope:** S

### Checkpoint: all four blocks render at `/blocks/<id>?theme=…`

## Task 10: Gallery + BlockFrame
**Acceptance criteria:**
- [ ] `app/blocks/page.tsx`: title "Blocks", category Tabs (Main pages), grid of `BlockFrame` from the registry
- [ ] `components/blocks/block-frame.tsx`: title, description, theme Select (4 presets), viewport ToggleGroup (Desktop 1440 / Tablet 1024 / Mobile 390), "Open full page" link, "View code" showing the file path (`Snippet`)
- [ ] Preview is an `<iframe loading="lazy">` at the chosen width, scaled to fit the card; has a `title`
- [ ] "Blocks" added to `siteNav`

**Verification:** Browser: each control changes the preview; theme switch reaches popovers inside the iframe; tsc, lint
**Dependencies:** Tasks 7–9
**Files:** `app/blocks/page.tsx`, `components/blocks/block-frame.tsx`, `components/site-header.tsx`
**Scope:** M

## Task 11: Acceptance pass + summary
**Acceptance criteria:**
- [ ] `npm run check:blocks` output pasted (zero hex/arbitrary colours, zero disallowed imports)
- [ ] 4 blocks × 4 themes screenshot matrix: no unreadable text, no hard-coded white surfaces
- [ ] Inbox 1440 / 1024 / 390 without horizontal scroll; keyboard walk passes
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run check:contrast`, `npm run build` pass
- [ ] Summary: files created, DS components used per block, final DS gaps

**Dependencies:** Task 10
**Scope:** S
