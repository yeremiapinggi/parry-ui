import type { Metadata } from "next";
import Link from "next/link";
import { BellIcon, FolderIcon, LayoutDashboardIcon, SearchIcon, SettingsIcon, TriangleAlertIcon } from "lucide-react";

import { ProductSwitcher, ProductTokens } from "@/components/product-theme";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import registry from "@/registry.json";

export const metadata: Metadata = { title: "Themes · Parry UI" };

const theme = registry.items.find((i) => i.name === "parry-theme")!.cssVars!;
const light = theme.light as Record<string, string>;
const dark = theme.dark as Record<string, string>;
const colorTokens = Object.keys(light).filter((k) => light[k].startsWith("#"));

const nav = [
  { icon: LayoutDashboardIcon, label: "Dashboard", active: true },
  { icon: FolderIcon, label: "Projects" },
  { icon: SettingsIcon, label: "Settings" },
];

const bars = [40, 55, 48, 62, 58, 75, 90];

function Swatch({ hex }: { hex: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-5 shrink-0 rounded-md border" style={{ background: hex }} />
      <code className="font-mono text-xs">{hex}</code>
    </span>
  );
}

export default function ThemesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight">Themes</h1>
            <p className="text-sm text-muted-foreground">
              Parry ships one theme, <strong className="text-foreground">Midnight + Frost Blue</strong>, with light and dark modes.
              Pick a mode to see it in the preview.
            </p>
          </div>
          <ThemeSwitcher />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Product preview</p>
            <p className="text-sm text-muted-foreground">Only the preview changes; the Parry site keeps its own theme.</p>
            <ProductSwitcher className="w-full" />
          </div>
          <ProductTokens />
          <Card className="gap-3 py-4">
            <CardHeader>
              <CardTitle className="text-sm">Install the theme</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">npx shadcn@latest add @parry/parry-theme</pre>
              <Link href="/docs/theming" className="text-sm font-medium text-link hover:underline">Theming guide</Link>
            </CardContent>
          </Card>
        </aside>

        {/* Live preview built from registry components; it follows the site-wide theme. */}
        <section aria-label="Theme preview" className="product-scope overflow-hidden rounded-2xl border bg-background">
          <div className="grid min-h-[520px] md:grid-cols-[200px_1fr]">
            <div className="hidden flex-col gap-1 bg-sidebar p-4 text-sidebar-foreground md:flex">
              <p className="px-2 pb-4 font-heading font-extrabold text-sidebar-accent-foreground">Parry UI</p>
              {nav.map(({ icon: Icon, label, active }) => (
                <span
                  key={label}
                  className={
                    active
                      ? "relative flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-1.5 text-sm text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:-left-1 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
                      : "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-border hover:text-sidebar-accent-foreground"
                  }
                >
                  <Icon className="size-4" /> {label}
                </span>
              ))}
            </div>
            <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input aria-label="Search" placeholder="Search components…" className="pl-8" />
                </div>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <BellIcon />
                </Button>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Get started</p>
                  <p className="font-heading text-2xl font-bold">Build something exceptional</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Documentation</Button>
                  <Button>Get started</Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardDescription>Total Components</CardDescription>
                    <CardTitle className="text-3xl">19</CardTitle>
                    <CardAction>
                      <Badge className="border-success/30 bg-success-soft text-success">↑ 12%</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex h-14 items-end gap-1.5" aria-hidden>
                    {bars.map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-chart-2" style={{ height: `${h}%` }} />
                    ))}
                  </CardContent>
                </Card>
                <Alert>
                  <TriangleAlertIcon />
                  <AlertTitle>Quota almost used up</AlertTitle>
                  <AlertDescription>12% of this month&apos;s quota remains.</AlertDescription>
                </Alert>
              </div>
              <Card className="py-2">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Q4 Campaign</TableCell>
                        <TableCell className="text-right"><Badge className="border-info/30 bg-info-soft text-info">In progress</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Audience research</TableCell>
                        <TableCell className="text-right"><Badge variant="secondary">Done</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <section id="token" className="flex scroll-mt-20 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Color tokens</h2>
          <p className="text-sm text-muted-foreground">
            Values from <code className="font-mono">registry.json</code>, generated from <code className="font-mono">app/globals.css</code>.
          </p>
        </div>
        <Card className="py-2">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Light</TableHead>
                  <TableHead>Dark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorTokens.map((k) => (
                  <TableRow key={k}>
                    <TableCell><code className="font-mono text-xs">--{k}</code></TableCell>
                    <TableCell><Swatch hex={light[k]} /></TableCell>
                    <TableCell><Swatch hex={dark[k]} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
