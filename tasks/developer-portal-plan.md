# Implementation Plan: Developer Portal template

## Overview
Add a "Developer Portal" page template to the Parry UI templates catalog. It follows the reference screenshot (X Developer
Console): a left sidebar with grouped navigation, a top bar, and a content area. Inside the portal a developer can:
1. create **apps** and pick an auth method per app: **OAuth 2.0 client** (client ID/secret, redirect URIs) or **API keys**;
2. set **scopes** per app or per key, limited to the Ivosights applications listed (`lib/products.json`: Cognivo, Sociomile,
   Ripple10, Agentics) with read and write levels;
3. manage **webhooks** that subscribe to real-time events (endpoint, event types, signing secret, test delivery);
4. see **usage analytics** for the API (requests, errors, latency, by app and product);
5. read **request logs** (filter, search, detail drawer).

Like every other template, all of this is demo-only: fictional data in React state, simulated actions, and no network calls.

## Decisions (proposed, to confirm at Checkpoint A)
- **One template, one gallery card, slug `developer-portal`**, category `"Integration"` (already exists). The portal is a
  single console, so the sidebar switches sections through local `useState` rather than routes. One live preview shows the whole
  thing, which is closest to the reference. (The alternative, five templates like auth, would split one app across five gallery
  cards.)
- **Sidebar sections:** Overview · Apps · Webhooks · Usage · Logs. The reference's Billing, Agent, Streaming rules and Chat bots
  groups are dropped because they aren't in the objective.
- **Shell** = a plain bordered `div` built on the existing `--sidebar*` tokens. No new `components/ui/sidebar`; the conversation
  workspace already builds its panes this way. The sidebar collapses to a `Select` / top tab row below `lg`.
- **Scopes model:** `{ product: "cognivo" | "sociomile" | "ripple10" | "agentics", access: "read" | "write" }[]`. The editor is
  a product × access matrix of `Checkbox` items, and write implies read. A key's scopes must be a subset of its app's scopes, and
  the form enforces this.
- **Secrets:** a client secret or API key is shown **once** in full right after creation or rotation, with a copy button (`navigator.clipboard`).
  After that it shows only a masked prefix (`pk_live_…a1b2`). Rotate and revoke actions need a confirmation dialog.
- **Webhook events** are a fixed fictional list per product (e.g. `sociomile.ticket.created`, `ripple10.mention.created`).
  "Send test event" simulates a delivery and adds a row to that webhook's recent-deliveries list (status, latency).
- **Usage charts** reuse `components/ui/chart` + recharts. The existing `ActivityTrendChart` is tied to analytics-dashboard
  types, so the portal gets its own small area/bar charts, following that file's pattern.
- **Logs** = `Table` + a method/status/app filter + search. Clicking a row opens a `Dialog` with fictional request and response
  JSON. Fictional log rows are generated deterministically in `lib/developer-portal-data.ts`; there is no `Math.random` at render, which avoids hydration mismatch.

## Reused, not built
`Button`, `Input`, `Label`, `Select`, `Checkbox`, `Switch` (webhook enabled), `Tabs` (app detail: Overview / Auth / Scopes),
`Table`, `Dialog`, `DropdownMenu` (row actions), `Badge`, `Card`, `Alert`, `Tooltip`, `Separator`, `Skeleton`, `chart`,
`sonner` toast, `DocsToc`, the doc page structure from `app/templates/integration-connection/page.tsx`, the masked-secret and
confirm-dialog patterns from `components/integration-connection.tsx`, and the gallery `onDirtyChange` unsaved-changes guard.

## Files
```
lib/developer-portal-data.ts          types, products/scopes, seed apps/keys/webhooks, deterministic usage + log generators
components/developer-portal.tsx       DeveloperPortal shell (sidebar, top bar, section state) + Overview section
components/developer-portal-apps.tsx  apps list, create/edit dialog, app detail (OAuth / API keys / scopes)
components/developer-portal-webhooks.tsx
components/developer-portal-usage.tsx
components/developer-portal-logs.tsx
components/developer-portal-thumbnail.tsx
app/templates/developer-portal/page.tsx
components/templates-gallery.tsx      entry + thumbnail/preview branches
```

## Dependency graph
```
lib/developer-portal-data.ts (types + seeds)                      T1
   └── DeveloperPortal shell + Overview + doc page + gallery entry  T1
         ├── Apps: create app, OAuth / API key, scopes              T2 → T3
         ├── Webhooks                                               T4  (needs app list from T2 for "owning app")
         ├── Usage analytics                                        T5  (needs data generators only)
         └── Logs                                                   T6  (needs data generators only)
```
T4, T5 and T6 are independent of each other once T2 lands, but they all edit the same shell file to register their section.
Build them in sequence.

## Tasks (vertical slices)

### Phase 1: Shell
**T1. Shell + Overview, visible in the gallery**
- Data file with types and seeds (3 apps matching the reference's names, e.g. `sociomile-demo`, `IvoDevJNE`, `IvosightsDev`).
- `DeveloperPortal`: sidebar (logo, grouped nav, workspace footer), top bar (workspace name, Documentation ↗, theme toggle),
  and placeholder bodies for sections that aren't built yet.
- Overview: greeting, 3 stat cards (Requests 30d, Error rate, Active apps), usage mini-chart, apps list card with "Manage apps".
- Doc page, gallery entry and thumbnail.

Acceptance:
- [ ] `/templates/developer-portal` renders the shell at ≥1024px. At 375px the nav becomes a top selector and nothing scrolls horizontally.
- [ ] The active nav item has `aria-current="page"`; keyboard Tab order is sidebar → content.
- [ ] Clicking an app in the Overview list (or "Manage apps") switches to Apps.
- [ ] Light and dark both read correctly.
- [ ] The gallery card appears under Integration and its preview dialog shows the live portal.

### Checkpoint A
The user reviews the shell against the reference and confirms the decisions above before the sections are built.

### Phase 2: Apps and access
**T2. Apps: create, list, edit, delete**
- Apps table: name, ID, environment (Development/Production), auth method, scope count, created date.
- Create/edit dialog: name (required, unique), description, environment, auth method (OAuth 2.0 / API key) and initial scopes.
- On create with OAuth, show the client ID plus a one-time client secret. Delete needs confirmation. The unsaved-changes guard is wired to the gallery.

Acceptance:
- [ ] Empty name, a duplicate name, or zero scopes shows an inline error on the field.
- [ ] A new app appears in the Apps table and the Overview list.
- [ ] The secret is visible once with Copy, and masked after the dialog closes.
- [ ] An empty state with a "Create your first app" action appears when no apps remain.

**T3. App detail: OAuth credentials, API keys, scopes**
- Detail view (back to list) with `Tabs`: Overview · Authentication · Scopes.
- OAuth: client ID, masked secret + Rotate, redirect URIs (add/remove, https or localhost only), grant types (read-only display).
- API keys: list (name, masked prefix, scopes, last used, expiry). Create key (name, scopes ⊆ app scopes, expiry 30/90/none),
  reveal-once, revoke.
- Scopes tab: the product × access matrix with an explanation of each scope. Removing an app scope also trims keys that used it, after a warning.

Acceptance:
- [ ] A key cannot be created with a scope the app lacks. The option is disabled and has a tooltip explaining why.
- [ ] Rotating the secret invalidates the old masked value and reveals the new one once.
- [ ] Revoking a key marks it Revoked, keeps it in the list, and leaves no actions on it.
- [ ] An invalid redirect URI is rejected with a message.

### Checkpoint B
The user reviews the app, auth and scopes flows. This is the core of the objective.

### Phase 3: Webhooks, usage, logs
**T4. Webhooks**
- List: URL, owning app, subscribed event count, Enabled `Switch`, last delivery status.
- Create/edit: HTTPS URL, owning app, event checklist grouped by product (only products in the app's scopes), signing secret
  (reveal-once, rotate).
- Detail: recent deliveries (time, event, status code, latency). "Send test event" adds a simulated delivery, and a URL containing `fail`
  simulates a 500 so the error state can be shown.

Acceptance:
- [ ] Rejects non-HTTPS URLs and an empty event set.
- [ ] A disabled webhook shows Paused, and test send is disabled with a reason.
- [ ] Both success and failure deliveries render with readable labels, not color alone.

**T5. Usage analytics**
- Filters: range (7/30/90 days), app, product.
- Stat cards: total requests, error rate, p95 latency, webhook deliveries. Then a requests-over-time area chart (2xx vs 4xx/5xx)
  and a requests-by-endpoint/product bar or table.
- Rate-limit indicator per app (used / quota).

Acceptance:
- [ ] Changing a filter updates every card and chart from the same filtered data.
- [ ] A filter combination with no data shows an empty state, not an empty chart.
- [ ] Charts have an accessible summary (table toggle or `aria-label` with totals).

**T6. Logs**
- `Table` of requests: time, method, path, status, latency, app, key/client. Filters: status class, method, app. Search by path or request ID.
- Row → `Dialog` with request headers (Authorization masked), query, body, and response JSON in a `font-mono` block.
- Pagination (25/page) over about 200 generated rows. A "Live tail" toggle prepends a fake row every few seconds while it is on, and pauses
  when the section unmounts.

Acceptance:
- [ ] Filters and search combine. A no-results state includes a "Clear filters" action.
- [ ] The Authorization header is never shown in full.
- [ ] Live tail stops on toggle off and on unmount, with no leaked interval.

### Checkpoint C (final)
- [ ] All sections are reachable from the sidebar. Overview's links into Apps, Usage and Logs work.
- [ ] Doc page sections (Overview, Live Preview, Anatomy, Features & Variants, Interaction States, Usage Guidelines, Components Used)
      describe the final behavior.
- [ ] `npm run lint`, `npm run build`, `npm run check:contrast` pass.
- [ ] Preview checked at desktop and 375px, light and dark.
- [ ] The user reviews.

Verify for every task: `npm run lint`, `npm run build`, then the preview at `/templates/developer-portal` and `/templates`.

## Out of scope
A real OAuth server or consent screen, real key hashing or storage, a backend, real webhook delivery or retries, billing/credits
(present in the reference but not the objective), notifications, team/member management, registry (`public/r`) items, and i18n
(the reference's language switcher).

## Risks
- **File size.** The integration-connection template is about 36K in one file. Splitting by section keeps each file reviewable.
- **Gallery ternaries** get one more branch. Follow the existing pattern and don't refactor here.
- **Live preview height.** A full console inside the gallery dialog may feel cramped. The shell should fill its container
  (`h-[min(800px,80vh)]`) and scroll the content pane, not the page.
- **Scope trimming** when an app loses a scope is the trickiest logic. Keep it in one pure function in the data file and cover it
  with an assert-based self-check.
