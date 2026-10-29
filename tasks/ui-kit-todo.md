# Todo: Melengkapi komponen dari checklist shadcnblocks

See `tasks/ui-kit-plan.md` for decisions, the Definition of Done (DoD) and open questions.

Every task below has the same acceptance criteria and verification unless noted:
- **Acceptance:** each listed component meets the DoD (file in `components/ui/`, registry item, preview on
  `/components`, theme tokens only) and its rows in sheet **Detail Varian** are updated per the granularity rule.
- **Verify:** `npm run lint` · `npm run build` · `npm run registry:build` · preview `/components` at desktop and 375px,
  light and dark · Ringkasan sheet shows the new Selesai count.
- **Files:** `components/ui/<name>.tsx`, `registry.json`, `app/components/page.tsx` and/or
  `components/component-catalog-previews.tsx`, `package.json` when a dependency is added.

## Phase 0: Setup
- [ ] T0 Spike sheet write: set Status of one row (e.g. `button-001`) via the Drive connector, confirm Ringkasan recalculates and the Status dropdown is intact; revert. Record the granularity rule the user picks. (XS)
- [x] T0 Sheet write spike: `update_values` on one Status cell keeps the dropdown and Ringkasan recalculates (COUNTIFS on column H). Rule chosen: variants covered by the preview = Selesai, the rest = Review + Catatan, PIC `Claude`.
- [x] T1a Registry: `chart`, `popover`, `radio-group`, `toggle`, `toggle-group` added and built to `public/r/` (registry:build also re-synced `parry-theme` with the DM Sans `font-data` token already in `app/globals.css`).
- [x] T1b Sheet backfill: 650 rows of the 24 existing components set (50 Selesai, 600 Review). Ringkasan total 50/2197. Toggle, Label, Skeleton, Avatar and Card have 0 Selesai because no preview matches a listed variant (`toggle` is not on `/components` at all).
- [ ] **Checkpoint 0: user approves granularity rule and the T1 sheet update**

## Phase 1: Foundations & Theming
- [x] T2 aspect-ratio, scroll-area, resizable (`shadcn add`; dep `react-resizable-panels`). Sheet: 3/7, 4/8, 4/9 Selesai. (S)
  - Note: pnpm isn't installed here and `shadcn add` calls pnpm (pnpm-lock.yaml exists). Run it with a `pnpm` shim to `corepack pnpm`, then `npm install --package-lock-only` and `npm ci` to keep both lockfiles and an npm-layout `node_modules`. The shim also needs `npm_config_strict_dep_builds=false` (pnpm 12 fails on ignored build scripts). Stop the dev server first, and clear `.next/dev` after `npm ci`, or Turbopack keeps resolving the old `node_modules`.
- [x] T3 theme-toggle (icon / labeled / outline × default/outline/ghost), theme-switcher (light/dark/system, settings row) — refactor `components/theme-mode-picker.tsx` into these, keep its callers working. (S)

## Phase 2: Actions
- [x] T4 kbd (platform-aware combos), button-group (split button, toolbar), spinner (also used for Button loading). (S)
- [x] T5 border-button (animated border variants), social-button, login-button (provider SVG icons), github-stars (count, tooltip; static data, no API call). Depends on T4. (M)
- [ ] **Checkpoint A: Foundations + Actions reviewed by user**

## Phase 3: Form & Input
- [x] T6 field, input-group. shadcn's `form` item is now empty (forms are built from Field), so no `form` component or react-hook-form/zod deps; Form rows set to Review with that note. Sheet: Field 2/43, Input Group 6/39. Install with `yes n |` so shadcn doesn't overwrite the themed button/input/textarea. (M)
- [x] T7 input-otp (dep `input-otp`), slider (single + range). (S)
- [x] T8 calendar, date-picker, mini-calendar (dep `react-day-picker`, `date-fns`). Previews use a fixed demo date: with `cacheComponents`, prerender fails on `new Date()`/`Date.now()` in render. Sheet: 3/16, 1/8, 3/5. (M)
- [x] T9 command (dep `cmdk`), combobox (single, grouped, reselect clears), autocomplete (free text + suggestions). Multi-select combobox not built yet. Sheet: 1/21, 4/42, 4/15. (M)
- [x] T10 choicebox, rating (form-star-rating = rating inside Field, no separate file), tags-input, color-picker (native color input + swatches + hex). Sheet: 2/5, 5/15, 2/7, 2/6, 2/4. (M)
- [x] T11 file-upload, dropzone (no deps; validates type/size for dropped files too). Sheet: 4/45, 3/5. (M)
- [ ] T11b image-crop (dep `react-image-crop`) — deferred until Open Question #3 is answered; sheet rows stay Belum with a note.
- [ ] **Checkpoint B: all form controls reviewed, existing templates still build**

## Phase 4: Feedback
- [x] T12 progress (fixed: shadcn's version didn't pass `value` to Radix, so `aria-valuenow` was missing), empty, banner, announcement, status. Sheet: 4/20, 2/22, 3/4, 3/6, 4/5. (M)

## Phase 5: Overlay
- [x] T13 alert-dialog, sheet, drawer (dep `vaul`). Keyboard open, initial focus and Escape-return-focus checked. Sheet: 2/39, 2/31, 1/22. (S)
- [x] T14 hover-card, context-menu, glimpse (HoverCard link preview, no fetching), dialog-stack (Dialog stepping through child panels, `trigger` prop). Sheet: 1/20, 5/27, 3/5, 1/4. (M)

## Phase 6: Navigation
- [x] T15 breadcrumb, pagination, navigation-menu, menubar (new "Navigation" group on /components). Sheet: 2/14, 6/19, 1/20, 1/10. (M)
- [x] T16 stepper (custom, clickable completed steps), scrollable-tabs-list (TabsList in ScrollArea), collapsible, accordion. Also fixed /components labels for names with 2+ hyphens. Sheet: 6/26, 1/1, 2/23, 1/21. (M)
- [ ] **Checkpoint C: feedback, overlay, navigation reviewed (keyboard + focus checked on overlays)**

## Phase 7: Data Display
- [ ] T17 avatar-group, avatar-stack, pill, item, list. (M)
- [ ] T18 stat, counter, price, relative-time, ticker, sparkline (recharts already installed). (M)
- [ ] T19 data-table (dep `@tanstack/react-table`), data-toolbar, filter-panel — extract from `advanced-filterable-table-preview.tsx` / `advanced-filter-builder.tsx` instead of rewriting. Depends on T9, T13. (L → split if it exceeds 5 files)
- [ ] T20 list-panel, tree, timeline, comparison. (M)
- [ ] T21 contribution-graph, gantt, kanban (Gantt/Kanban optional per Open Question #3). (L)

## Phase 8: Layout
- [ ] T22 bento-tile, deck, carousel (dep `embla-carousel-react`), marquee, reel. (M)
- [ ] **Checkpoint D: data display + layout reviewed, bundle size checked in `npm run build` output**

## Phase 9: Media & Dev (heavy, optional per Open Question #3)
- [ ] T23 code-block, snippet, sandbox, editor. (L)
- [ ] T24 qr-code, credit-card, logo, emoji-picker. (M)
- [ ] T25 image-zoom, video-player. (S)
- [ ] **Checkpoint E: 111/111 components present or explicitly marked out of scope in the sheet; README component list updated**
