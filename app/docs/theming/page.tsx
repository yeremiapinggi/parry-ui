import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock, DocsToc } from "@/components/docs-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Theming · Parry UI" };

const toc = [
  { id: "token", label: "Token warna" },
  { id: "semantic", label: "Warna semantic" },
  { id: "font", label: "Font & radius" },
  { id: "mengubah", label: "Mengubah warna" },
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
          <p className="text-lg text-muted-foreground">Palet Midnight + Frost Blue, font, dan cara mengubahnya.</p>
        </header>

        <h2 id="token" className={h2}>Token warna</h2>
        <p>
          Theme memakai nama token shadcn (<code className="font-mono text-sm">background</code>, <code className="font-mono text-sm">primary</code>,{" "}
          <code className="font-mono text-sm">muted</code>, dst.) dengan nilai berbeda untuk mode terang dan gelap. Semua nilainya bisa dilihat di{" "}
          <Link href="/themes" className="text-primary underline underline-offset-4">Themes</Link>.
        </p>
        <p>
          Warna brand dipakai apa adanya bila lolos WCAG AA. Yang gagal diganti shade yang lebih gelap untuk teks, misalnya primary{" "}
          <code className="font-mono text-sm">#3366E0</code> menggantikan Frost Blue <code className="font-mono text-sm">#5B8DEF</code> di mode terang.
        </p>

        <h2 id="semantic" className={h2}>Warna semantic</h2>
        <p>
          Selain token shadcn, theme menambahkan <code className="font-mono text-sm">success</code>, <code className="font-mono text-sm">warning</code>,{" "}
          <code className="font-mono text-sm">info</code>, dan pasangan <code className="font-mono text-sm">*-soft</code>. Alert dan Badge tidak punya variant
          khusus; pakai utility token:
        </p>
        <div className="flex flex-wrap gap-2">
          {semantic.map(({ name, className }) => (
            <Badge key={name} className={className}>{name}</Badge>
          ))}
        </div>
        <CodeBlock>{`<Badge className="border-success/30 bg-success-soft text-success">success</Badge>
<Alert className="border-warning/30 bg-warning-soft text-warning">…</Alert>`}</CodeBlock>

        <h2 id="font" className={h2}>Font &amp; radius</h2>
        <p>
          Teks memakai <strong>Plus Jakarta Sans</strong> dan kode memakai <code className="font-mono text-sm">JetBrains Mono</code>, dimuat lewat paket{" "}
          <code className="font-mono text-sm">@fontsource-variable/*</code> sehingga jalan di Next.js maupun Vite. Radius dasar{" "}
          <code className="font-mono text-sm">0.5rem</code>.
        </p>

        <h2 id="mengubah" className={h2}>Mengubah warna</h2>
        <p>Di repo Parry UI, <code className="font-mono text-sm">app/globals.css</code> adalah satu-satunya sumber token:</p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>Edit nilai hex di blok <code className="font-mono text-sm">:root</code> (terang) atau <code className="font-mono text-sm">.dark</code> (gelap).</li>
          <li>Jalankan pengecekan kontras; perintah gagal bila ada pasangan di bawah WCAG AA.</li>
          <li>Build ulang registry agar <code className="font-mono text-sm">parry-theme</code> ikut berubah.</li>
        </ol>
        <CodeBlock>{`npm run check:contrast
npm run registry:build`}</CodeBlock>
        <Alert>
          <AlertTitle>Jangan edit registry.json secara manual</AlertTitle>
          <AlertDescription>Bagian parry-theme di registry.json ditimpa oleh script setiap kali registry di-build.</AlertDescription>
        </Alert>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <DocsToc items={toc} />
        </div>
      </aside>
    </div>
  );
}
