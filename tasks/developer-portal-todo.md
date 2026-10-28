# Todo: Developer Portal template

See `tasks/developer-portal-plan.md` for decisions and the acceptance criteria.

## Phase 1: Shell
- [x] T1a `lib/developer-portal-data.ts`: types, product scopes, seed apps, deterministic daily usage (keys, webhooks and logs are added by T3, T4 and T6)
- [x] T1b `components/developer-portal.tsx`: shell (sidebar, top bar, section state, mobile nav) + Overview section
- [x] T1c `app/templates/developer-portal/page.tsx` doc page (integration-connection section structure)
- [x] T1d Gallery: `developer-portal` entry (Integration), thumbnail, preview branch (unsaved-changes guard deferred to T2, the first section with a form)
- [x] T1e Verify: lint, build, preview at desktop and 375px, light and dark
- [x] **Checkpoint A: user reviews the shell and confirms the decisions**

## Phase 2: Apps and access
- [x] T2 Apps: list, create/edit dialog (OAuth / API key, scopes), reveal-once secret, delete, empty state, verify
- [ ] T3 App detail: OAuth credentials + rotate + redirect URIs, API keys (create ⊆ app scopes, reveal-once, revoke), scopes matrix + trim warning, self-check for scope trimming, verify
- [ ] **Checkpoint B: user reviews apps, auth and scopes**

## Phase 3: Webhooks, usage, logs
- [ ] T4 Webhooks: list, create/edit (HTTPS, events by scoped product, signing secret), test delivery success/fail, verify
- [ ] T5 Usage: range/app/product filters, stat cards, requests chart, by-endpoint breakdown, rate-limit meter, empty state, verify
- [ ] T6 Logs: table, filters + search, pagination, detail dialog with masked auth, live tail with cleanup, verify

## Final
- [ ] Doc page content matches the final behavior
- [ ] `npm run lint`, `npm run build`, `npm run check:contrast` pass
- [ ] **Checkpoint C: user review**
