import Link from "next/link";
import { ArrowRightIcon, ArrowUpIcon, PlusIcon, SparklesIcon } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const bars = [40, 55, 48, 62, 58, 75, 90];

const install = [
  ["Siapkan project", "npx shadcn@latest init -t next -b radix -p nova"],
  ["Pasang theme", "npx shadcn@latest add @parry/parry-theme"],
  ["Pasang komponen", "npx shadcn@latest add @parry/button @parry/card"],
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,var(--accent),var(--background)_70%)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-extrabold">
          <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            P
          </span>
          Parry UI
        </Link>
        <nav aria-label="Utama" className="hidden items-center gap-6 text-sm sm:flex">
          <Link href="/components" className="text-muted-foreground hover:text-foreground">Components</Link>
          <Link href="/components#warna" className="text-muted-foreground hover:text-foreground">Tokens</Link>
          <Link href="#install" className="text-muted-foreground hover:text-foreground">Install</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="rounded-full">
            <Link href="#install">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 pt-16 pb-20 text-center xl:min-h-[780px] lg:pt-24">
          <h1 className="font-heading font-extrabold tracking-tighter text-primary text-[clamp(4.5rem,17vw,11rem)] leading-[0.85]">
            parry
            <span className="sr-only"> UI</span>
          </h1>
          <p className="max-w-2xl text-balance text-3xl leading-tight tracking-tight sm:text-5xl">
            Design system Ivosights yang <span className="font-bold">siap pakai di Next.js dan Vite</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
              <Link href="#install">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base">
              <Link href="/components">Browse components</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Dibangun di atas{" "}
            <a href="https://ui.shadcn.com" className="underline underline-offset-4 hover:text-foreground">shadcn/ui</a>,
            Radix, dan Tailwind v4
          </p>

          {/* Demo cards: a grid below the hero on smaller screens, floating beside it from xl up (where the side gutters fit them). */}
          <div className="grid w-full gap-4 text-left sm:grid-cols-2 xl:block">
            <Badge className="hidden border-success/30 bg-success-soft text-success xl:absolute xl:top-[300px] xl:left-0 xl:inline-flex">
              <SparklesIcon data-icon="inline-start" /> WCAG AA
            </Badge>

            <Card className="xl:absolute xl:top-[330px] xl:left-4 xl:w-64 xl:-rotate-2">
              <CardHeader>
                <CardDescription>Komponen di registry</CardDescription>
                <CardTitle className="text-3xl">20</CardTitle>
                <CardAction>
                  <Badge className="border-success/30 bg-success-soft text-success">↑ 6 baru</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex h-14 items-end gap-1.5" aria-hidden>
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-chart-2" style={{ height: `${h}%` }} />
                ))}
              </CardContent>
            </Card>

            <Card className="xl:absolute xl:top-[560px] xl:left-10 xl:w-64">
              <CardContent className="flex flex-col gap-3">
                <Label htmlFor="ask" className="text-muted-foreground">Ada yang bisa dibantu?</Label>
                <Input id="ask" placeholder="Cari komponen atau token…" />
                <div className="flex justify-between">
                  <Button variant="outline" size="icon" className="rounded-full" aria-label="Lampirkan">
                    <PlusIcon />
                  </Button>
                  <Button size="icon" className="rounded-full" aria-label="Kirim">
                    <ArrowUpIcon />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:absolute xl:top-[310px] xl:right-4 xl:w-64 xl:rotate-2">
              <CardHeader>
                <CardTitle>Preferensi</CardTitle>
                <CardDescription>Komponen form asli dari registry.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="hero-dark">Mode gelap</Label>
                  <Switch id="hero-dark" defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="hero-notif">Notifikasi email</Label>
                  <Switch id="hero-notif" />
                </div>
              </CardContent>
            </Card>

            <Card className="xl:absolute xl:top-[540px] xl:right-10 xl:w-64">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Jordan Doe</p>
                    <p className="text-xs text-muted-foreground">Product Designer</p>
                  </div>
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <Button variant="outline" className="w-full">Undang ke tim</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="install" className="mx-auto flex w-full max-w-3xl scroll-mt-8 flex-col gap-6 px-4 pb-24">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight">Mulai dalam tiga langkah</h2>
            <p className="text-muted-foreground">
              Daftarkan registry <code className="font-mono text-sm">@parry</code> di <code className="font-mono text-sm">components.json</code>,
              lalu pasang theme dan komponen dengan shadcn CLI.
            </p>
          </div>
          <ol className="flex flex-col gap-3">
            {install.map(([title, cmd], i) => (
              <li key={title}>
                <Card className="gap-2 py-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {i + 1}. {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">{cmd}</pre>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
          <Button asChild variant="link" className="self-center">
            <Link href="/components">
              Lihat semua komponen <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
