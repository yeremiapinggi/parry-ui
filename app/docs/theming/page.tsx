import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock, DocsToc } from "@/components/docs-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Theming · Parry UI" };

const toc = [
  { id: "tokens", label: "Color tokens" },
  { id: "semantic", label: "Semantic colors" },
  { id: "fonts", label: "Fonts & radius" },
  { id: "changing-colors", label: "Changing colors" },
  { id: "product-themes", label: "Product themes" },
];

const h2 = "scroll-mt-20 font-heading text-2xl font-bold tracking-tight";

const semantic = [
  { name: "success", className: "border-success/30 bg-success-soft text-success" },
  { name: "warning", className: "border-warning/30 bg-warning-soft text-warning" },
  { name: "info", className: "border-info/30 bg-info-soft text-info" },
  { name: "destructive", className: "border-destructive/30 bg-destructive-soft text-destructive" },
];

export default function ThemingPage() {
  return (
    <div className="grid gap-10 py-10 xl:grid-cols-[1fr_200px]">
      <article className="flex max-w-3xl min-w-0 flex-col gap-6 leading-7">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Theming</h1>
          <p className="text-lg text-muted-foreground">The Midnight + Frost Blue palette, fonts, and how to change them.</p>
        </header>

        <h2 id="tokens" className={h2}>Color tokens</h2>
        <p>
          The theme uses shadcn token names (<code className="font-mono text-sm">background</code>, <code className="font-mono text-sm">primary</code>,{" "}
          <code className="font-mono text-sm">muted</code>, and so on) with separate values for light and dark mode. Every value is listed on{" "}
          <Link href="/themes" className="text-link underline underline-offset-4">Themes</Link>.
        </p>
        <p>
          Primary is Midnight <code className="font-mono text-sm">#171C24</code> (inverted in dark mode), links use{" "}
          <code className="font-mono text-sm">#2563EB</code>, and Frost Blue <code className="font-mono text-sm">#5B8DEF</code> marks focus and active states. Brand colors
          are used as-is when they pass WCAG AA; those that fail are replaced with an accessible shade, for example the Focus Ring{" "}
          <code className="font-mono text-sm">#93C5FD</code> (1.8:1) is drawn with Frost Blue instead.
        </p>

        <h2 id="semantic" className={h2}>Semantic colors</h2>
        <p>
          On top of the shadcn tokens, the theme adds <code className="font-mono text-sm">success</code>, <code className="font-mono text-sm">warning</code>,{" "}
          <code className="font-mono text-sm">info</code>, and their <code className="font-mono text-sm">*-soft</code> pairs. Badge has no dedicated
          variants for them; use the token utilities. Alerts stay neutral like shadcn: <code className="font-mono text-sm">variant=&quot;success&quot;</code> is the
          default card with a <code className="font-mono text-sm">CircleCheck</code> icon, and only <code className="font-mono text-sm">destructive</code> is colored.
        </p>
        <div className="flex flex-wrap gap-2">
          {semantic.map(({ name, className }) => (
            <Badge key={name} className={className}>{name}</Badge>
          ))}
        </div>
        <CodeBlock>{`<Badge className="border-success/30 bg-success-soft text-success">success</Badge>
<Alert variant="success"><CircleCheckIcon /><AlertTitle>Saved</AlertTitle></Alert>`}</CodeBlock>

        <h2 id="fonts" className={h2}>Fonts &amp; radius</h2>
        <p>
          Text uses <strong>Plus Jakarta Sans</strong> and code uses <code className="font-mono text-sm">JetBrains Mono</code>, loaded from the{" "}
          <code className="font-mono text-sm">@fontsource-variable/*</code> packages so they work in both Next.js and Vite. The base radius is{" "}
          <code className="font-mono text-sm">0.5rem</code>.
        </p>

        <h2 id="changing-colors" className={h2}>Changing colors</h2>
        <p>In the Parry UI repo, <code className="font-mono text-sm">app/globals.css</code> is the single source of tokens:</p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>Edit the hex values in the <code className="font-mono text-sm">:root</code> (light) or <code className="font-mono text-sm">.dark</code> (dark) block.</li>
          <li>Run the contrast check; it fails if any pair is below WCAG AA.</li>
          <li>Rebuild the registry so <code className="font-mono text-sm">parry-theme</code> picks up the change.</li>
        </ol>
        <CodeBlock>{`npm run check:contrast
npm run registry:build`}</CodeBlock>
        <Alert>
          <AlertTitle>Don&apos;t edit registry.json by hand</AlertTitle>
          <AlertDescription>The parry-theme section of registry.json is overwritten by a script every time the registry is built.</AlertDescription>
        </Alert>

        <h2 id="product-themes" className={h2}>Product themes</h2>
        <p>
          Components can be previewed in the Cognivo, Sociomile, Ripple10, and Agentics themes with the switcher on{" "}
          <Link href="/components" className="text-link underline underline-offset-4">Components</Link> and{" "}
          <Link href="/themes" className="text-link underline underline-offset-4">Themes</Link>. Each product keeps its own primary color and
          font; only the previews change, never the Parry site around them.
        </p>
        <p>
          Product tokens live in <code className="font-mono text-sm">lib/products.json</code> and are checked by{" "}
          <code className="font-mono text-sm">npm run check:contrast</code>. Every product uses white text on its primary in both modes, so primaries that
          were below 4.5:1 with white are a slightly darker shade of the brand color (for example Sociomile <code className="font-mono text-sm">#4399D3</code> →{" "}
          <code className="font-mono text-sm">#367AA9</code>); focus rings and charts keep the original brand color.
        </p>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <DocsToc items={toc} />
        </div>
      </aside>
    </div>
  );
}
