import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock, DocsToc } from "@/components/docs-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Getting started · Parry UI" };

const toc = [
  { id: "siapkan-project", label: "1. Siapkan project" },
  { id: "daftarkan-registry", label: "2. Daftarkan registry" },
  { id: "pasang-theme", label: "3. Pasang theme & komponen" },
  { id: "rapikan-template", label: "4. Rapikan template" },
  { id: "provider", label: "5. Provider" },
];

const h2 = "scroll-mt-20 font-heading text-2xl font-bold tracking-tight";

export default function GettingStartedPage() {
  return (
    <div className="grid gap-10 py-10 xl:grid-cols-[1fr_200px]">
      <article className="flex max-w-3xl min-w-0 flex-col gap-6 leading-7">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight">Getting started</h1>
          <p className="text-lg text-muted-foreground">
            Pasang theme dan komponen Parry UI di project Next.js atau Vite lewat shadcn CLI.
          </p>
        </header>

        <Alert>
          <AlertTitle>Registry, bukan paket npm</AlertTitle>
          <AlertDescription>
            Komponen disalin ke project Anda sehingga bisa diubah. Theme dipasang sekali, komponen ditambahkan sesuai kebutuhan.
          </AlertDescription>
        </Alert>

        <h2 id="siapkan-project" className={h2}>1. Siapkan project</h2>
        <p>Buat project baru dengan template shadcn dan primitive Radix:</p>
        <CodeBlock title="Next.js">npx shadcn@latest init -t next -b radix -p nova</CodeBlock>
        <CodeBlock title="Vite">npx shadcn@latest init -t vite -b radix -p nova</CodeBlock>
        <p>
          Untuk project yang sudah ada, jalankan <code className="font-mono text-sm">npx shadcn@latest init -b radix -p nova</code> di root project.
        </p>

        <h2 id="daftarkan-registry" className={h2}>2. Daftarkan registry</h2>
        <p>
          Tambahkan namespace <code className="font-mono text-sm">@parry</code> ke <code className="font-mono text-sm">components.json</code>.
          Ganti <code className="font-mono text-sm">REGISTRY_URL</code> dengan alamat deploy repo ini (lokal: <code className="font-mono text-sm">http://localhost:3001</code>).
        </p>
        <CodeBlock title="components.json">{`{
  "registries": {
    "@parry": "REGISTRY_URL/r/{name}.json"
  }
}`}</CodeBlock>

        <h2 id="pasang-theme" className={h2}>3. Pasang theme &amp; komponen</h2>
        <p>Pasang theme sekali, sebelum komponen apa pun:</p>
        <CodeBlock>npx shadcn@latest add @parry/parry-theme</CodeBlock>
        <p>
          Lalu tambahkan komponen yang dibutuhkan. Daftar lengkapnya ada di <Link href="/components" className="text-primary underline underline-offset-4">Components</Link>.
        </p>
        <CodeBlock>npx shadcn@latest add @parry/button @parry/input @parry/card</CodeBlock>

        <h2 id="rapikan-template" className={h2}>4. Rapikan template</h2>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Next.js:</strong> hapus import <code className="font-mono text-sm">Geist</code> dari <code className="font-mono text-sm">next/font/google</code> di{" "}
            <code className="font-mono text-sm">app/layout.tsx</code>. Font sekarang datang dari theme.
          </li>
          <li>
            <strong>Vite:</strong> hapus <code className="font-mono text-sm">@import &quot;@fontsource-variable/geist&quot;</code> di{" "}
            <code className="font-mono text-sm">src/index.css</code> dan uninstall paketnya.
          </li>
        </ul>

        <h2 id="provider" className={h2}>5. Provider</h2>
        <p>
          Dark mode memakai class <code className="font-mono text-sm">.dark</code> di <code className="font-mono text-sm">&lt;html&gt;</code>. Di Next.js pakai{" "}
          <code className="font-mono text-sm">next-themes</code>; template Vite sudah membawa <code className="font-mono text-sm">theme-provider.tsx</code>.
          Jika memakai tooltip atau toast, pasang provider-nya sekali di root:
        </p>
        <CodeBlock title="app/layout.tsx">{`<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <TooltipProvider>{children}</TooltipProvider>
  <Toaster />
</ThemeProvider>`}</CodeBlock>
        <p>
          Berikutnya: <Link href="/docs/theming" className="text-primary underline underline-offset-4">Theming</Link>.
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
