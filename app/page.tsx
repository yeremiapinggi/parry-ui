import Link from "next/link";
import { ArrowRightIcon, ArrowUpIcon, BlocksIcon, LayersIcon, PlusIcon, ShieldCheckIcon, SparklesIcon, ZapIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const bars = [40, 55, 48, 62, 58, 75, 90];

const features = [
  { icon: ZapIcon, title: "Fast to install", text: "The theme and components come in through the shadcn CLI from the @parry registry, with no extra npm package.", href: "/docs", cta: "Installation" },
  { icon: ShieldCheckIcon, title: "Accessible", text: "Every color pair is checked automatically against WCAG AA in both light and dark mode.", href: "/docs/theming", cta: "About tokens" },
  { icon: SparklesIcon, title: "Consistent", text: "A single token source in globals.css is copied into the registry, so the showcase and your project always match.", href: "/themes", cta: "View theme" },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,var(--info-soft),var(--background)_70%)]">
      <main className="flex flex-col">
        <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 pt-16 pb-20 text-center xl:min-h-[780px] lg:pt-24">
          <h1 className="font-heading font-extrabold tracking-tighter text-primary text-[clamp(4.5rem,17vw,11rem)] leading-[0.85]">
            parry
            <span className="sr-only"> UI</span>
          </h1>
          <p className="max-w-2xl text-balance text-3xl leading-tight tracking-tight sm:text-5xl">
            The Ivosights UI Kit, <span className="font-bold">ready for Next.js and Vite</span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
              <Link href="/docs">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8 text-base">
              <Link href="/components">Browse components</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Built on{" "}
            <a href="https://ui.shadcn.com" className="underline underline-offset-4 hover:text-foreground">shadcn/ui</a>,
            Radix, and Tailwind v4
          </p>

          {/* Demo cards: a grid below the hero on smaller screens, floating beside it from xl up (where the side gutters fit them). */}
          <div className="grid w-full gap-4 text-left sm:grid-cols-2 xl:block">
            <Badge className="hidden border-success/30 bg-success-soft text-success xl:absolute xl:top-[300px] xl:left-0 xl:inline-flex">
              <SparklesIcon data-icon="inline-start" /> WCAG AA
            </Badge>

            <Card className="xl:absolute xl:top-[330px] xl:left-4 xl:w-64 xl:-rotate-2">
              <CardHeader>
                <CardDescription>Registry components</CardDescription>
                <CardTitle className="text-3xl">20</CardTitle>
                <CardAction>
                  <Badge className="border-success/30 bg-success-soft text-success">↑ 6 new</Badge>
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
                <Label htmlFor="ask" className="text-muted-foreground">How can I help?</Label>
                <Input id="ask" placeholder="Search components or tokens…" />
                <div className="flex justify-between">
                  <Button variant="outline" size="icon" className="rounded-full" aria-label="Attach">
                    <PlusIcon />
                  </Button>
                  <Button size="icon" className="rounded-full" aria-label="Send">
                    <ArrowUpIcon />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:absolute xl:top-[310px] xl:right-4 xl:w-64 xl:rotate-2">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Real form components from the registry.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="hero-dark">Dark mode</Label>
                  <Switch id="hero-dark" defaultChecked />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="hero-notif">Email notifications</Label>
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
                <Button variant="outline" className="w-full">Invite to team</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.2fr_1.2fr]">
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Start anywhere.
                <br />
                Change anything.
                <br />
                Ship faster.
              </h2>
              <p className="text-muted-foreground">
                Components are copied into your project with the shadcn CLI, so you can still adapt them to your product.
              </p>
            </div>

            <Link href="/components" className="group rounded-2xl bg-muted p-6 transition-colors hover:bg-accent">
              <p className="font-heading text-xl font-semibold">19 ready-to-use components</p>
              <p className="mt-1 text-sm text-muted-foreground">Forms, feedback, overlays, layout, and data.</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-link">
                Browse components <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <div className="mt-6 flex flex-wrap items-center gap-2" aria-hidden>
                <Badge>default</Badge>
                <Badge variant="secondary">secondary</Badge>
                <Badge className="border-success/30 bg-success-soft text-success">success</Badge>
                <Badge className="border-info/30 bg-info-soft text-info">info</Badge>
                {/* Static look-alike: a real <button> must not sit inside this link. */}
                <span className={buttonVariants({ size: "sm" })}>Button</span>
              </div>
            </Link>

            <Link href="/docs" className="group rounded-2xl bg-muted p-6 transition-colors hover:bg-accent">
              <p className="font-heading text-xl font-semibold">One theme, two frameworks</p>
              <p className="mt-1 text-sm text-muted-foreground">Installed with the same commands in Next.js and Vite.</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-link">
                Read the guide <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <pre className="mt-6 overflow-x-auto rounded-lg bg-sidebar p-4 font-mono text-xs text-sidebar-foreground" aria-hidden>
                npx shadcn@latest add @parry/parry-theme
              </pre>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-24 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-bold tracking-tight">Built for Ivosights products</h2>
            <p className="text-muted-foreground">
              One source of tokens, measured contrast, and components kept close to shadcn so upstream updates stay easy to adopt.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, text, href, cta }) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-info-soft text-info">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
                <Link href={href} className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-link hover:underline">
                  {cta} <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_center,var(--info-soft),var(--muted)_75%)] px-6 py-20 text-center">
            <LayersIcon aria-hidden className="absolute -top-6 -left-6 size-40 -rotate-12 text-primary/10" />
            <BlocksIcon aria-hidden className="absolute -right-8 -bottom-8 size-48 rotate-12 text-primary/10" />
            <h2 className="max-w-xl font-heading text-4xl font-bold tracking-tight text-balance">
              Discover the full <span className="text-link">Ivosights</span> UI Kit
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Install the theme once, then add components one at a time as you need them.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/docs">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link href="/themes">View theme</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
