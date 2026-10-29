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
- [ ] T9 command (dep `cmdk`), combobox (single/multi, grouped, clear), autocomplete. Reuse pattern from `components/searchable-record-select.tsx`. (M)
- [ ] T10 choicebox, rating, form-star-rating, tags, color-picker. (M)
- [ ] T11 file-upload, dropzone, image-crop (dep `react-image-crop`; optional per Open Question #3). (M)
- [ ] **Checkpoint B: all form controls reviewed, existing templates still build**

## Phase 4: Feedback
- [ ] T12 progress, empty, banner, announcement, status. (M)

## Phase 5: Overlay
- [ ] T13 alert-dialog, sheet, drawer (dep `vaul`). (S)
- [ ] T14 hover-card, context-menu, glimpse (link preview card), dialog-stack. Depends on T13. (M)

## Phase 6: Navigation
- [ ] T15 breadcrumb, pagination, navigation-menu, menubar. (M)
- [ ] T16 stepper, scrollable-tabslist, collapsible, accordion. (M)
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
