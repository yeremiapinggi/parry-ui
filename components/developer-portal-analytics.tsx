"use client"

import { useMemo, useState } from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon, ActivityIcon, BoxesIcon, CircleCheckIcon, GaugeIcon, Layers3Icon, PlusIcon, WaypointsIcon } from "lucide-react"
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, XAxis, YAxis } from "recharts"

import { formatCompactNumber, type DeveloperApp, type UsageFact, usageFacts } from "@/lib/developer-portal-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AnalyticsProps = {
  apps: DeveloperApp[]
  onCreateApp: () => void
  onOpenApp: (app: DeveloperApp) => void
  onNavigate: (page: "apps" | "usage") => void
}

const chartConfig = {
  current: { label: "Current period", color: "var(--chart-2)" },
  previous: { label: "Previous period", color: "var(--chart-5)" },
  requests: { label: "Requests", color: "var(--chart-2)" },
} satisfies ChartConfig

const statusColors = ["var(--chart-2)", "var(--chart-4)", "var(--chart-5)"]
const endpointMethods: Record<string, "GET" | "POST"> = {
  "/v1/sociomile/tickets": "GET",
  "/v1/ripple10/mentions": "GET",
  "/v1/cognivo/insights": "POST",
  "/v1/agentics/runs": "POST",
}

function summarizeEndpoints(rows: UsageFact[]) {
  const totalRequests = rows.reduce((sum, row) => sum + row.requests, 0)
  const totals = new Map<string, { requests: number; errors: number }>()
  rows.forEach((row) => {
    const current = totals.get(row.endpoint) ?? { requests: 0, errors: 0 }
    current.requests += row.requests
    current.errors += row.clientErrors + row.serverErrors
    totals.set(row.endpoint, current)
  })
  return Array.from(totals, ([endpoint, value]) => ({
    endpoint,
    method: endpointMethods[endpoint] ?? "GET",
    ...value,
    share: totalRequests ? (value.requests / totalRequests) * 100 : 0,
  })).sort((a, b) => b.requests - a.requests)
}

function getPeriods(days: number, appId = "all") {
  const dates = Array.from(new Set(usageFacts.map((fact) => fact.date)))
  const currentDates = dates.slice(-days)
  const previousDates = dates.slice(-days * 2, -days)
  const appFilter = (fact: UsageFact) => appId === "all" || fact.appId === appId
  const current = usageFacts.filter((fact) => currentDates.includes(fact.date) && appFilter(fact))
  const previous = usageFacts.filter((fact) => previousDates.includes(fact.date) && appFilter(fact))
  return { currentRows: current, previousRows: previous, currentDates, previousDates }
}

function summarize(rows: UsageFact[]) {
  const requests = rows.reduce((sum, row) => sum + row.requests, 0)
  const success = rows.reduce((sum, row) => sum + row.success, 0)
  const clientErrors = rows.reduce((sum, row) => sum + row.clientErrors, 0)
  const serverErrors = rows.reduce((sum, row) => sum + row.serverErrors, 0)
  const errors = clientErrors + serverErrors
  return {
    requests,
    success,
    errors,
    successRate: requests ? (success / requests) * 100 : 0,
    errorRate: requests ? (errors / requests) * 100 : 0,
    clientErrors,
    serverErrors,
  }
}

function aggregateBy<T extends string>(rows: UsageFact[], key: (row: UsageFact) => T) {
  const totals = new Map<T, number>()
  rows.forEach((row) => totals.set(key(row), (totals.get(key(row)) ?? 0) + row.requests))
  return Array.from(totals, ([name, requests]) => ({ name, requests })).sort((a, b) => b.requests - a.requests)
}

function buildTrend(current: UsageFact[], previous: UsageFact[], currentDates: string[], previousDates: string[]) {
  return currentDates.map((date, index) => {
    const currentTotal = current.filter((fact) => fact.date === date).reduce((sum, fact) => sum + fact.requests, 0)
    const previousDate = previousDates[index]
    const previousTotal = previousDate ? previous.filter((fact) => fact.date === previousDate).reduce((sum, fact) => sum + fact.requests, 0) : 0
    return {
      label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)),
      current: currentTotal,
      previous: previousTotal,
    }
  })
}

function MetricCard({ title, value, detail, icon: Icon, trend, trendIsGood = true }: {
  title: string
  value: string
  detail: string
  icon: typeof ActivityIcon
  trend?: number
  trendIsGood?: boolean
}) {
  const positive = trend !== undefined && (trendIsGood ? trend >= 0 : trend < 0)
  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-0 sm:px-5 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="font-medium">{title}</CardDescription>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info-soft text-info"><Icon className="size-4" aria-hidden="true" /></span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="font-data text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
          {trend !== undefined ? <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums ${positive ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>{positive ? <ArrowUpRightIcon className="size-3.5" /> : <ArrowDownRightIcon className="size-3.5" />}{Math.abs(trend).toFixed(1)}%</span> : null}
        </div>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

function RequestsTrend({ rows, days, className = "h-64 min-h-64" }: { rows: ReturnType<typeof getPeriods>; days: number; className?: string }) {
  const trend = useMemo(() => buildTrend(rows.currentRows, rows.previousRows, rows.currentDates, rows.previousDates), [rows])
  return (
    <ChartContainer config={chartConfig} aria-label={`Requests over time for the last ${days} days`} className={`${className} w-full aspect-auto`}>
      <ComposedChart data={trend} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id="portalUsageFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-current)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-current)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} interval="preserveStartEnd" minTickGap={20} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} width={48} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" formatter={(value, name) => <span className="font-mono tabular-nums">{formatCompactNumber(Number(value))} {name === "previous" ? "previous" : "requests"}</span>} />} />
        <Area dataKey="current" type="monotone" stroke="none" fill="url(#portalUsageFill)" isAnimationActive={false} />
        <Line dataKey="current" type="monotone" stroke="var(--color-current)" strokeWidth={2.5} strokeLinecap="round" dot={false} activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive={false} />
        <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="5 5" strokeLinecap="round" dot={false} activeDot={{ r: 3, stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive={false} />
      </ComposedChart>
    </ChartContainer>
  )
}

function BreakdownChart({ title, description, data, labelKey = "name" }: { title: string; description: string; data: { name: string; requests: number }[]; labelKey?: string }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-4 py-4 sm:px-5"><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent className="px-3 pb-4 sm:px-4">
        {data.length ? <ChartContainer config={chartConfig} aria-label={title} className="h-56 min-h-56 w-full aspect-auto">
          <BarChart data={data} layout="vertical" accessibilityLayer margin={{ top: 3, right: 12, left: 0, bottom: 3 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} />
            <YAxis type="category" dataKey={labelKey} width={112} tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(value) => <span className="font-mono tabular-nums">{Number(value).toLocaleString()} requests</span>} />} />
            <Bar dataKey="requests" fill="var(--color-requests)" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} />
          </BarChart>
        </ChartContainer> : <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">No requests for this application in the selected period.</p>}
      </CardContent>
    </Card>
  )
}

function StatusDistribution({ rows }: { rows: UsageFact[] }) {
  const values = [
    { name: "2xx success", requests: rows.reduce((sum, row) => sum + row.success, 0) },
    { name: "4xx client errors", requests: rows.reduce((sum, row) => sum + row.clientErrors, 0) },
    { name: "5xx server errors", requests: rows.reduce((sum, row) => sum + row.serverErrors, 0) },
  ]
  const total = values.reduce((sum, item) => sum + item.requests, 0)
  const config = {
    success: { label: "2xx success", color: "var(--chart-2)" },
    client: { label: "4xx client errors", color: "var(--chart-4)" },
    server: { label: "5xx server errors", color: "var(--chart-5)" },
  } satisfies ChartConfig
  const chartData = values.map((item, index) => ({ ...item, fill: statusColors[index], key: ["success", "client", "server"][index] }))

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-4 py-4 sm:px-5"><CardTitle className="text-base">HTTP Status Distribution</CardTitle><CardDescription>Responses grouped by status family.</CardDescription></CardHeader>
      <CardContent className="flex flex-col items-center gap-3 px-4 pb-4">
        <ChartContainer config={config} aria-label="HTTP status code distribution" className="h-48 min-h-48 w-full max-w-64 aspect-auto">
          <PieChart accessibilityLayer><ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} /><Pie data={chartData} dataKey="requests" nameKey="name" innerRadius={55} outerRadius={76} paddingAngle={2} stroke="var(--background)" isAnimationActive={false}>{chartData.map((item) => <Cell key={item.key} fill={item.fill} />)}</Pie></PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">{values.map((item, index) => <div key={item.name} className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: statusColors[index] }} /><span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-[11px] text-muted-foreground">{item.name}</span><span className="font-mono text-sm font-medium tabular-nums">{formatCompactNumber(item.requests)}</span></span>{total ? <span className="text-[10px] tabular-nums text-muted-foreground">{((item.requests / total) * 100).toFixed(1)}%</span> : null}</div>)}</div>
      </CardContent>
    </Card>
  )
}

function RangeSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <Select value={String(value)} onValueChange={(next) => onChange(Number(next))}><SelectTrigger className="w-36" aria-label="Date range"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
}

function DailyQuotaCard({ app, requestsToday, dailyLimit }: { app: DeveloperApp; requestsToday: number; dailyLimit: number }) {
  const percentUsed = Math.min((requestsToday / dailyLimit) * 100, 100)
  const progressColor = percentUsed >= 90 ? "bg-destructive" : percentUsed >= 75 ? "bg-warning" : "bg-info"

  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1"><span className="truncate text-sm font-semibold">{app.name}</span><span className="truncate font-mono text-[11px] text-muted-foreground">{app.id}</span></div>
          <Badge variant="outline" className={app.environment === "Production" ? "shrink-0 border-success/30 bg-success-soft text-success" : "shrink-0 border-info/30 bg-info-soft text-info"}>{app.environment}</Badge>
        </div>
        <div className="flex items-baseline justify-between gap-3"><span className="font-mono text-xs font-semibold tabular-nums">{requestsToday.toLocaleString("en-US")} <span className="font-sans font-normal text-muted-foreground">/ {dailyLimit.toLocaleString("en-US")} per day</span></span><span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">{percentUsed.toFixed(1)}%</span></div>
        <div role="progressbar" aria-label={`${app.name} daily request quota`} aria-valuemin={0} aria-valuemax={dailyLimit} aria-valuenow={Math.min(requestsToday, dailyLimit)} className="h-2 overflow-hidden rounded-full bg-muted"><span aria-hidden="true" className={`block h-full rounded-full transition-[width] ${progressColor}`} style={{ width: `${percentUsed}%` }} /></div>
        <p className="text-xs text-muted-foreground">{Math.max(dailyLimit - requestsToday, 0).toLocaleString("en-US")} requests remaining today</p>
      </CardContent>
    </Card>
  )
}

export function DeveloperPortalOverview({ apps, onCreateApp, onOpenApp, onNavigate }: AnalyticsProps) {
  const [days, setDays] = useState(30)
  const activeAppIds = useMemo(() => new Set(apps.map((app) => app.id)), [apps])
  const periods = useMemo(() => {
    const result = getPeriods(days)
    return {
      ...result,
      currentRows: result.currentRows.filter((row) => activeAppIds.has(row.appId)),
      previousRows: result.previousRows.filter((row) => activeAppIds.has(row.appId)),
    }
  }, [activeAppIds, days])
  const fixedMetricPeriods = useMemo(() => {
    const result = getPeriods(30)
    return {
      ...result,
      currentRows: result.currentRows.filter((row) => activeAppIds.has(row.appId)),
      previousRows: result.previousRows.filter((row) => activeAppIds.has(row.appId)),
    }
  }, [activeAppIds])
  const current = useMemo(() => summarize(fixedMetricPeriods.currentRows), [fixedMetricPeriods.currentRows])
  const previous = useMemo(() => summarize(fixedMetricPeriods.previousRows), [fixedMetricPeriods.previousRows])
  const endpointSummary = useMemo(() => summarizeEndpoints(fixedMetricPeriods.currentRows), [fixedMetricPeriods.currentRows])
  const requestChange = previous.requests ? ((current.requests - previous.requests) / previous.requests) * 100 : 0
  const errorChange = previous.errorRate ? ((current.errorRate - previous.errorRate) / previous.errorRate) * 100 : 0
  const today = usageFacts[usageFacts.length - 1]?.date
  const quotas = useMemo(() => apps.map((app) => ({
    app,
    dailyLimit: app.environment === "Production" ? 50000 : 10000,
    requestsToday: today ? usageFacts.filter((fact) => fact.date === today && fact.appId === app.id).reduce((sum, fact) => sum + fact.requests, 0) : 0,
  })), [apps, today])
  const visibleApps = apps.slice(0, 4)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Developer workspace</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">IvosightsDev workspace</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Monitor Sociomile, Ripple10, Cognivo, and Agentics API activity in one place.</p>
        </div>
        <Button onClick={onCreateApp} className="shrink-0"><PlusIcon data-icon="inline-start" />Create app</Button>
      </header>

      <section aria-label="Developer workspace metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Requests (30 days)" value={formatCompactNumber(current.requests)} detail="Compared with the previous 30 days" icon={ActivityIcon} trend={requestChange} />
        <MetricCard title="Error rate" value={`${current.errorRate.toFixed(2)}%`} detail={`${formatCompactNumber(current.errors)} 4xx and 5xx responses`} icon={GaugeIcon} trend={errorChange} trendIsGood={false} />
        <MetricCard title="Active apps" value={apps.length.toString()} detail="Across production and development" icon={BoxesIcon} />
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.9fr)]">
        <Card className="gap-0 py-0 shadow-sm">
          <CardHeader className="flex flex-col gap-3 px-4 pt-4 pb-1 sm:px-5 sm:pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="text-base">API usage</CardTitle><CardDescription className="mt-1">Daily request volume against the previous period.</CardDescription></div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" />Current</span><span className="flex items-center gap-1.5"><span className="w-3 border-t-2 border-dashed border-chart-5" />Previous</span></div></div>
            <div className="flex flex-wrap items-center gap-2"><RangeSelect value={days} onChange={setDays} /><Button variant="outline" size="sm" onClick={() => onNavigate("usage")}>View usage</Button></div>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-5"><RequestsTrend rows={periods} days={days} className="h-64 min-h-64" /></CardContent>
        </Card>

        <Card className="gap-0 py-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5"><div><CardTitle className="text-base">Applications</CardTitle><CardDescription className="mt-1">Apps, environments, and credentials</CardDescription></div><Button variant="ghost" size="sm" onClick={() => onNavigate("apps")}>Manage</Button></CardHeader>
          <CardContent className="px-2 pb-2 sm:px-3">
            {visibleApps.length ? <div className="flex flex-col">{visibleApps.map((app) => <button key={app.id} type="button" onClick={() => onOpenApp(app)} className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-info"><Layers3Icon className="size-4" aria-hidden="true" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="truncate text-sm font-medium">{app.name}</span><span className="truncate font-mono text-[11px] text-muted-foreground">{app.id}</span></span>
              <Badge variant="outline" className={app.environment === "Production" ? "shrink-0 border-success/30 bg-success-soft text-success" : "shrink-0 border-info/30 bg-info-soft text-info"}>{app.environment}</Badge>
            </button>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-3 text-center"><p className="text-sm font-medium">No applications yet</p><p className="text-xs text-muted-foreground">Create your first app to start exploring the workspace.</p><Button size="sm" variant="outline" onClick={onCreateApp}>Create app</Button></div>}
          </CardContent>
          {apps.length > visibleApps.length ? <div className="border-t px-5 py-3 text-xs text-muted-foreground">Showing {visibleApps.length} of {apps.length} apps</div> : null}
        </Card>
      </div>

      <Card className="gap-0 py-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5"><div><CardTitle className="text-base">Requests by endpoint</CardTitle><CardDescription className="mt-1">30-day volume and response health by API route.</CardDescription></div><Button variant="ghost" size="sm" onClick={() => onNavigate("usage")}>View usage</Button></CardHeader>
        <CardContent className="px-0 pb-2 sm:px-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/40"><TableHead className="min-w-64">Endpoint</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Requests</TableHead><TableHead className="text-right">Errors</TableHead><TableHead className="pr-5 text-right">Share</TableHead></TableRow></TableHeader>
              <TableBody>{endpointSummary.map((row) => <TableRow key={row.endpoint}><TableCell className="font-mono text-xs font-medium">{row.endpoint}</TableCell><TableCell><Badge variant="secondary" className="font-mono text-[10px] tracking-wide">{row.method}</Badge></TableCell><TableCell className="text-right font-mono text-xs tabular-nums">{row.requests.toLocaleString("en-US")}</TableCell><TableCell className={`text-right font-mono text-xs tabular-nums ${row.errors ? "text-destructive" : "text-muted-foreground"}`}>{row.errors.toLocaleString("en-US")}</TableCell><TableCell className="pr-5 text-right font-mono text-xs tabular-nums">{row.share.toFixed(1)}%</TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
          {!endpointSummary.length ? <p className="px-5 py-6 text-center text-sm text-muted-foreground">No endpoint requests for the active applications.</p> : null}
        </CardContent>
      </Card>

      <section aria-labelledby="rate-limits-heading" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="rate-limits-heading" className="font-heading text-lg font-semibold tracking-tight">Rate limits</h2><p className="text-sm text-muted-foreground">Daily request usage by application and environment.</p></div><span className="font-mono text-xs text-muted-foreground">Resets at 00:00 UTC</span></div>
        {quotas.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{quotas.map(({ app, requestsToday, dailyLimit }) => <DailyQuotaCard key={app.id} app={app} requestsToday={requestsToday} dailyLimit={dailyLimit} />)}</div> : <Card className="flex min-h-28 items-center justify-center py-6 text-sm text-muted-foreground">Create an application to view its daily quota.</Card>}
      </section>

      <Card className="gap-0 border-info/20 bg-info-soft/30 py-0"><CardContent className="flex items-start gap-3 px-4 py-3.5"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-info/10 text-info"><WaypointsIcon className="size-4" /></span><div className="flex min-w-0 flex-col gap-1"><p className="text-sm font-medium">Demo workspace</p><p className="text-xs leading-relaxed text-muted-foreground">Ivosights app data, API traffic, credentials, and webhook deliveries are simulated locally. No live API keys or external services are connected.</p></div><CircleCheckIcon className="ml-auto mt-1 size-4 shrink-0 text-info" aria-hidden="true" /></CardContent></Card>
    </div>
  )
}

export function DeveloperPortalUsage({ apps }: { apps: DeveloperApp[] }) {
  const [days, setDays] = useState(30)
  const [appId, setAppId] = useState("all")
  const periods = useMemo(() => getPeriods(days, appId), [days, appId])
  const summary = useMemo(() => summarize(periods.currentRows), [periods.currentRows])
  const appBreakdown = useMemo(() => aggregateBy(periods.currentRows, (row) => apps.find((app) => app.id === row.appId)?.name ?? "Deleted app"), [apps, periods.currentRows])
  const endpointBreakdown = useMemo(() => aggregateBy(periods.currentRows, (row) => row.endpoint), [periods.currentRows])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Observability</p><h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">API usage</h1><p className="text-sm leading-relaxed text-muted-foreground">Explore request volume and outcomes across your applications.</p></div>
        <div className="flex flex-wrap items-center gap-2"><RangeSelect value={days} onChange={setDays} /><Select value={appId} onValueChange={setAppId}><SelectTrigger className="w-44" aria-label="Filter usage by application"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All applications</SelectItem>{apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}</SelectContent></Select></div>
      </header>

      <section aria-label="Usage metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total requests" value={formatCompactNumber(summary.requests)} detail={`Across ${days} days`} icon={ActivityIcon} />
        <MetricCard title="Success rate" value={`${summary.successRate.toFixed(2)}%`} detail={`${formatCompactNumber(summary.success)} successful responses`} icon={CircleCheckIcon} />
        <MetricCard title="Error rate" value={`${summary.errorRate.toFixed(2)}%`} detail={`${formatCompactNumber(summary.errors)} errors in range`} icon={GaugeIcon} trendIsGood={false} />
        <MetricCard title="Applications" value={appId === "all" ? String(apps.length) : "1"} detail={appId === "all" ? "Included in this report" : "Selected application"} icon={BoxesIcon} />
      </section>

      <Card className="gap-0 py-0"><CardHeader className="px-4 pt-4 pb-1 sm:px-5 sm:pt-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle className="text-base">Requests over time</CardTitle><CardDescription className="mt-1">Daily requests and the matching previous period.</CardDescription></div><div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" />Current</span><span className="flex items-center gap-1.5"><span className="w-3 border-t-2 border-dashed border-chart-5" />Previous</span></div></div></CardHeader><CardContent className="px-3 pb-4 sm:px-5"><RequestsTrend rows={periods} days={days} className="h-72 min-h-72" /></CardContent></Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2"><BreakdownChart title="Requests by application" description="Top applications for the selected date range." data={appBreakdown} /><BreakdownChart title="Requests by endpoint" description="Endpoint volume for the selected date range." data={endpointBreakdown} /></div>
      <StatusDistribution rows={periods.currentRows} />
      {!periods.currentRows.length ? <Card className="flex min-h-48 flex-col items-center justify-center gap-2 text-center"><CardTitle className="text-base">No usage for this filter</CardTitle><CardDescription>Choose another application to view requests in this range.</CardDescription></Card> : null}
    </div>
  )
}
