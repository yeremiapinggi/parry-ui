import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock, DocsToc } from "@/components/docs-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Getting started · Parry UI" };

const toc = [
  { id: "set-up-project", label: "1. Set up a project" },
  { id: "register-registry", label: "2. Register the registry" },
  { id: "install-theme", label: "3. Install theme & components" },
  { id: "clean-up-template", label: "4. Clean up the template" },
  { id: "providers", label: "5. Providers" },
];

const h2 = "scroll-mt-20 font-heading text-2xl font-bold tracking-tight";

export default function GettingStartedPage() {
  return (
    <div className="grid gap-10 py-10 xl:grid-cols-[1fr_200px]">
      <article className="flex max-w-3xl min-w-0 flex-col gap-6 leading-7">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Getting started</h1>
          <p className="text-lg text-muted-foreground">
            Install the Parry UI theme and components in a Next.js or Vite project with the shadcn CLI.
          </p>
        </header>

        <Alert>
          <AlertTitle>A registry, not an npm package</AlertTitle>
          <AlertDescription>
            Components are copied into your project so you can change them. Install the theme once, then add components as you need them.
          </AlertDescription>
        </Alert>

        <h2 id="set-up-project" className={h2}>1. Set up a project</h2>
        <p>Create a new project with the shadcn template and Radix primitives:</p>
        <CodeBlock title="Next.js">npx shadcn@latest init -t next -b radix -p nova</CodeBlock>
        <CodeBlock title="Vite">npx shadcn@latest init -t vite -b radix -p nova</CodeBlock>
        <p>
          For an existing project, run <code className="font-mono text-sm">npx shadcn@latest init -b radix -p nova</code> in the project root.
        </p>

        <h2 id="register-registry" className={h2}>2. Register the registry</h2>
        <p>
          Add the <code className="font-mono text-sm">@parry</code> namespace to <code className="font-mono text-sm">components.json</code>.
          Replace <code className="font-mono text-sm">REGISTRY_URL</code> with the address this repo is deployed to (locally:{" "}
          <code className="font-mono text-sm">http://localhost:3001</code>).
        </p>
        <CodeBlock title="components.json">{`{
  "registries": {
    "@parry": "REGISTRY_URL/r/{name}.json"
  }
}`}</CodeBlock>

        <h2 id="install-theme" className={h2}>3. Install theme &amp; components</h2>
        <p>Install the theme once, before any component:</p>
        <CodeBlock>npx shadcn@latest add @parry/parry-theme</CodeBlock>
        <p>
          Then add the components you need. The full list is on{" "}
          <Link href="/components" className="text-primary underline underline-offset-4">Components</Link>.
        </p>
        <CodeBlock>npx shadcn@latest add @parry/button @parry/input @parry/card</CodeBlock>

        <h2 id="clean-up-template" className={h2}>4. Clean up the template</h2>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Next.js:</strong> remove the <code className="font-mono text-sm">Geist</code> imports from{" "}
            <code className="font-mono text-sm">next/font/google</code> in <code className="font-mono text-sm">app/layout.tsx</code>. Fonts now come from the theme.
          </li>
          <li>
            <strong>Vite:</strong> remove <code className="font-mono text-sm">@import &quot;@fontsource-variable/geist&quot;</code> from{" "}
            <code className="font-mono text-sm">src/index.css</code> and uninstall the package.
          </li>
        </ul>

        <h2 id="providers" className={h2}>5. Providers</h2>
        <p>
          Dark mode uses the <code className="font-mono text-sm">.dark</code> class on <code className="font-mono text-sm">&lt;html&gt;</code>. In Next.js use{" "}
          <code className="font-mono text-sm">next-themes</code>; the Vite template already ships <code className="font-mono text-sm">theme-provider.tsx</code>.
          If you use tooltips or toasts, mount their providers once at the root:
        </p>
        <CodeBlock title="app/layout.tsx">{`<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <TooltipProvider>{children}</TooltipProvider>
  <Toaster />
</ThemeProvider>`}</CodeBlock>
        <p>
          Next: <Link href="/docs/theming" className="text-primary underline underline-offset-4">Theming</Link>.
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
