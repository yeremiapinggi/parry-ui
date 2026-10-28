"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  AppWindowIcon,
  ArrowUpRightIcon,
  ChartNoAxesColumnIcon,
  ChevronRightIcon,
  CodeXmlIcon,
  LayoutDashboardIcon,
  PlusIcon,
  ScrollTextIcon,
  WebhookIcon,
} from "lucide-react"

import { AppsSection, type AppsIntent } from "@/components/developer-portal-apps"
import { SEED_APPS, USAGE_DAYS, summarizeUsage, type PortalApp } from "@/lib/developer-portal-data"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PortalSection = "overview" | "apps" | "webhooks" | "usage" | "logs"

const navGroups: { label?: string; items: { id: PortalSection; label: string; Icon: ComponentType<{ className?: string }> }[] }[] = [
  { items: [{ id: "overview", label: "Overview", Icon: LayoutDashboardIcon }] },
  { label: "Access", items: [{ id: "apps", label: "Apps", Icon: AppWindowIcon }] },
  { label: "Realtime", items: [{ id: "webhooks", label: "Webhooks", Icon: WebhookIcon }] },
  {
    label: "Monitoring",
    items: [
      { id: "usage", label: "Usage", Icon: ChartNoAxesColumnIcon },
      { id: "logs", label: "Logs", Icon: ScrollTextIcon },
    ],
  },
]

const navItems = navGroups.flatMap((group) => group.items)

const usageConfig = {
  success: { label: "Successful", color: "var(--chart-2)" },
  errors: { label: "Errors", color: "var(--destructive)" },
} satisfies ChartConfig

const numberFormat = new Intl.NumberFormat("en-US")

export function DeveloperPortal({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const [section, setSection] = useState<PortalSection>("overview")
  const [apps, setApps] = useState<PortalApp[]>(SEED_APPS)
  const [appsIntent, setAppsIntent] = useState<AppsIntent>(null)

  function navigate(next: PortalSection, intent: AppsIntent = null) {
    setAppsIntent(intent)
    setSection(next)
  }
  const activeLabel = navItems.find((item) => item.id === section)?.label

  return (
    <div className="flex h-[760px] max-h-[85vh] min-h-[560px] overflow-hidden rounded-xl border bg-background text-foreground">
      <aside aria-label="Developer portal" className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
            <CodeXmlIcon className="size-4" />
          </span>
          <span className="font-heading text-sm leading-tight font-semibold text-sidebar-accent-foreground">Developer<br />Portal</span>
        </div>
        <nav aria-label="Portal sections" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4">
          {navGroups.map((group, index) => (
            <div key={group.label ?? index} className="flex flex-col gap-0.5">
              {group.label && <span className="px-3 pb-1 text-xs text-sidebar-foreground/60">{group.label}</span>}
              {group.items.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={section === id ? "page" : undefined}
                  onClick={() => navigate(id)}
                  className="flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-border hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring aria-[current=page]:border-sidebar-primary aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground"
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-sidebar-border px-5 py-4 text-sm">
          <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">I</span>
          <span className="truncate">Ivosights Dev</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6">
          <span className="hidden truncate text-sm font-medium lg:block">IvosightsDev workspace</span>
          <div className="lg:hidden">
            <Select value={section} onValueChange={(value) => navigate(value as PortalSection)}>
              <SelectTrigger aria-label="Portal section" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {navItems.map(({ id, label }) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/docs" aria-label="Documentation"><span className="hidden sm:inline">Documentation</span> <ArrowUpRightIcon data-icon="inline-end" /></Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {section === "overview" ? (
            <OverviewSection apps={apps} onNavigate={navigate} />
          ) : section === "apps" ? (
            <AppsSection apps={apps} setApps={setApps} intent={appsIntent} onDirtyChange={onDirtyChange} />
          ) : (
            // shortcut: placeholder until T2–T6 build each section
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <h2 className="font-heading text-lg font-semibold">{activeLabel}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">This section is not built yet in the preview.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function OverviewSection({ apps, onNavigate }: { apps: PortalApp[]; onNavigate: (section: PortalSection, intent?: AppsIntent) => void }) {
  const days = USAGE_DAYS.slice(-30)
  const usage = summarizeUsage(days)
  const stats = [
    { label: "Requests (30 days)", value: numberFormat.format(usage.requests) },
    { label: "Error rate", value: `${(usage.errorRate * 100).toFixed(2)}%` },
    { label: "Active apps", value: String(apps.length) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Hello, Ivosights Dev</h2>
          <p className="text-sm text-muted-foreground">Build on Ivosights products with OAuth apps, API keys, and webhooks.</p>
        </div>
        <Button onClick={() => onNavigate("apps", { create: true })}><PlusIcon data-icon="inline-start" />Create app</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label} className="gap-1 py-4">
            <CardHeader className="px-5"><CardDescription>{label}</CardDescription></CardHeader>
            <CardContent className="px-5"><p className="font-data text-3xl font-semibold tabular-nums">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="gap-3">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">API usage</CardTitle>
              <CardDescription>Requests per day, last 30 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("usage")}>View usage <ChevronRightIcon data-icon="inline-end" /></Button>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={usageConfig}
              aria-label={`Stacked area chart of daily API requests: ${numberFormat.format(usage.requests)} requests and ${numberFormat.format(usage.errors)} errors in the last 30 days`}
              className="aspect-auto h-64 w-full"
            >
              <AreaChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={28} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis width={44} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="success" stackId="requests" type="monotone" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                <Area dataKey="errors" stackId="requests" type="monotone" stroke="var(--color-errors)" fill="var(--color-errors)" fillOpacity={0.25} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Apps</CardTitle>
            <Button variant="link" size="sm" className="px-0 text-link" onClick={() => onNavigate("apps")}>Manage apps</Button>
          </CardHeader>
          <CardContent className="flex flex-col px-3">
            {apps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onNavigate("apps", { appId: app.id })}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><AppWindowIcon className="size-4" /></span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{app.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
                </span>
                <Badge variant={app.environment === "Production" ? "default" : "secondary"}>{app.environment}</Badge>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
