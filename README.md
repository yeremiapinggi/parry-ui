# Parry UI

The Ivosights design system, built on [shadcn/ui](https://ui.shadcn.com) (Radix primitives, `radix-nova` style) with the
**Midnight + Frost Blue** palette, **DM Sans** and **JetBrains Mono** fonts, and light/dark modes.

Parry UI is a **shadcn registry**: components are copied into your project with the `shadcn` CLI instead of being installed
as an npm package. The same registry works in **Next.js** and **Vite**.

> `REGISTRY_URL` below is the address this repo is deployed to. To try it locally, run `npm run dev` in this repo and use
> `http://localhost:3001` (the port follows the `next dev` output).

## Using Parry UI in your project

### 1. Set up the project with shadcn (Radix)

New project:

```bash
npx shadcn@latest init -t next -b radix -p nova
```

Use `-t vite` instead of `-t next` for Vite. For an existing project, run `npx shadcn@latest init -b radix -p nova` in the
project root.

### 2. Register the Parry registry

Add this to `components.json`:

```json
{
  "registries": {
    "@parry": "REGISTRY_URL/r/{name}.json"
  }
}
```

### 3. Install the theme, then components

```bash
npx shadcn@latest add @parry/parry-theme
```

```bash
npx shadcn@latest add @parry/button @parry/input @parry/card
```

`parry-theme` writes the color, font, and radius tokens to your global CSS file and installs the `@fontsource-variable/*`
font packages. Install the theme **once**, before any component.

### 4. Clean up the template

- **Next.js:** remove the `Geist`/`Geist_Mono` imports from `next/font/google` in `app/layout.tsx`, along with their class
  variables. Fonts now come from the theme.
- **Vite:** remove `@import "@fontsource-variable/geist";` from `src/index.css` and run `npm uninstall @fontsource-variable/geist`.

### 5. Providers in the root layout

Dark mode uses the `.dark` class on `<html>`.

- **Next.js:** use `next-themes`, e.g. `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`, and add
  `suppressHydrationWarning` to `<html>`.
- **Vite:** the `shadcn init -t vite` template already ships `components/theme-provider.tsx`.

If you use `tooltip` or `sonner`, wrap the app in `<TooltipProvider>` and render `<Toaster />` once. `sonner` reads the
theme from `next-themes`.

## Registry contents

| Item | Contents |
|------|----------|
| `parry-theme` | Light/dark tokens, fonts, radius |
| Form | `button`, `input`, `label`, `textarea`, `select`, `checkbox`, `switch` |
| Feedback & overlay | `alert`, `badge`, `dialog`, `dropdown-menu`, `tooltip`, `sonner` |
| Layout & data | `card`, `tabs`, `table`, `separator`, `avatar`, `skeleton` |

On top of the built-in shadcn tokens, the theme adds the semantic colors `success`, `warning`, `info` and their `*-soft`
pairs (plus `destructive-soft`), and `primary-hover`, `link`, and `placeholder`. Alert and Badge have no dedicated variants for these; use the token utilities:

```tsx
<Alert className="border-success/30 bg-success-soft text-success">…</Alert>
<Badge className="border-warning/30 bg-warning-soft text-warning">warning</Badge>
```

## Product preview themes

The site can preview components in the Cognivo, Sociomile, Ripple10, and Agentics themes (switcher on `/components` and
`/themes`). Only elements with the `product-scope` class, plus overlays opened from them, change; the Parry shell keeps its own
theme. Product tokens live in `lib/products.json` (light and dark values per token, plus the font) and are covered by
`npm run check:contrast`. Brand colors are kept in light mode; where white text failed AA (Sociomile, Ripple10) the
foreground is dark, and dark-mode primaries are lightened where the brand color disappears on Midnight (Cognivo, Agentics).

These are preview themes for the docs site, not registry items yet.

## Developing this repo

```bash
npm install
npm run dev            # site (/, /docs, /components, /themes) at http://localhost:3001 or the port shown
```

| Command | What it does |
|---------|--------------|
| `npm run registry:build` | Copies the tokens from `app/globals.css` into `registry.json`, then builds `public/r/*.json` |
| `npm run check:contrast` | Checks WCAG AA contrast for every light/dark token pair; fails (exit 1) if any is below the minimum |
| `npm run build` / `npm run lint` | Builds and lints the site |

**Changing colors:** edit `:root` / `.dark` in `app/globals.css` (hex format), run `npm run check:contrast`, then
`npm run registry:build`. Don't edit the `parry-theme` section of `registry.json` by hand; the script overwrites it.

**Adding a component:** run `npx shadcn@latest add <name>` in this repo, register it as a `registry:ui` item in
`registry.json` (fill `dependencies` from the file's imports), add its preview to `app/components/page.tsx`, then run
`npm run registry:build`. Components stay as close to the shadcn output as possible so upstream updates are easy to diff. The only Parry changes
are color/state classes required by the brand spec:

| Component | Parry change |
|-----------|--------------|
| `button` | Primary hover uses `--primary-hover`; outline is white (`bg-card`); link uses `--link` |
| `input`, `textarea`, `select` | White field (`bg-card`, no dark fill), `--placeholder` text, `bg-muted` when disabled |
| `tabs` | Active tab uses `bg-accent` + `text-foreground`; line indicator uses `--ring`; inactive text `muted-foreground` |
| `table` | Header row `bg-muted/50`, row hover `bg-muted` |

When re-adding a component from shadcn, re-apply these changes.

**Dev server note:** don't run `npm run build` while `npm run dev` is running, since both use the `.next` folder. If the
page looks stale, stop the dev server, delete `.next`, and start it again.
