"use client"

import { useMemo, useState } from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon, ActivityIcon, BoxesIcon, CircleCheckIcon, GaugeIcon, Layers3Icon, PlusIcon, WaypointsIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, XAxis, YAxis } from "recharts"

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

function getPeriods(days: number, appId = "all") {
  const dates = Array.from(new Set(usageFacts.map((fact) => fact.date)))
  const currentDates = dates.slice(-days)
  const previousDates = dates.slice(-days * 2, -days)
  const appFilter = (fact: UsageFact) => appId === "all" || fact.appId === appId
  const current = usageFacts.filter((fact) => currentDates.includes(fact.date) && appFilter(fact))
  const previous = usageFacts.filter((fact) => previousDates.includes(fact.date) && appFilter(fact))
  return { current, previous, currentDates, previousDates }
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
  const trend = useMemo(() => buildTrend(rows.current, rows.previous, rows.currentDates, rows.previousDates), [rows])
  const interval = Math.max(0, Math.ceil(trend.length / 7) - 1)
  return (
    <ChartContainer config={chartConfig} aria-label={`Requests over time for the last ${days} days`} className={`${className} w-full aspect-auto`}>
      <ComposedChart data={trend} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 2 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} interval={interval} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompactNumber} width={48} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" formatter={(value, name) => <span className="font-mono tabular-nums">{formatCompactNumber(Number(value))} {name === "previous" ? "previous" : "requests"}</span>} />} />
        <Line dataKey="current" type="monotone" stroke="var(--color-current)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive={false} />
        <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="6 5" dot={false} activeDot={{ r: 3, stroke: "var(--background)", strokeWidth: 2 }} isAnimationActive={false} />
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

export function DeveloperPortalOverview({ apps, onCreateApp, onOpenApp, onNavigate }: AnalyticsProps) {
  const [days, setDays] = useState(30)
  const periods = useMemo(() => getPeriods(days), [days])
  const fixedMetricPeriods = useMemo(() => getPeriods(30), [])
  const current = useMemo(() => summarize(fixedMetricPeriods.current), [fixedMetricPeriods.current])
  const previous = useMemo(() => summarize(fixedMetricPeriods.previous), [fixedMetricPeriods.previous])
  const requestChange = previous.requests ? ((current.requests - previous.requests) / previous.requests) * 100 : 0
  const errorChange = previous.errorRate ? ((current.errorRate - previous.errorRate) / previous.errorRate) * 100 : 0
  const visibleApps = apps.slice(0, 4)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Developer workspace</p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Good morning, Alya</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Manage your applications, monitor API activity, and keep integrations healthy.</p>
        </div>
        <Button onClick={onCreateApp} className="shrink-0"><PlusIcon data-icon="inline-start" />Create app</Button>
      </header>

      <section aria-label="Developer workspace metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Requests (30 days)" value={formatCompactNumber(current.requests)} detail="Compared with the previous period" icon={ActivityIcon} trend={requestChange} />
        <MetricCard title="Error rate" value={`${current.errorRate.toFixed(2)}%`} detail={`${formatCompactNumber(current.errors)} unsuccessful requests`} icon={GaugeIcon} trend={errorChange} trendIsGood={false} />
        <MetricCard title="Active apps" value={apps.length.toString()} detail="All environments" icon={BoxesIcon} />
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.9fr)]">
        <Card className="gap-0 py-0">
          <CardHeader className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
            <div><CardTitle className="text-base">API usage</CardTitle><CardDescription className="mt-1">Request volume compared with the previous period.</CardDescription></div>
            <div className="flex flex-wrap items-center gap-2"><RangeSelect value={days} onChange={setDays} /><Button variant="outline" size="sm" onClick={() => onNavigate("usage")}>View usage</Button></div>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-5"><RequestsTrend rows={periods} days={days} className="h-64 min-h-64" /></CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5"><div><CardTitle className="text-base">Applications</CardTitle><CardDescription className="mt-1">Credentials and environments</CardDescription></div><Button variant="ghost" size="sm" onClick={() => onNavigate("apps")}>Manage apps</Button></CardHeader>
          <CardContent className="px-2 pb-2 sm:px-3">
            {visibleApps.length ? <div className="flex flex-col">{visibleApps.map((app) => <button key={app.id} type="button" onClick={() => onOpenApp(app)} className="flex min-w-0 items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-info"><Layers3Icon className="size-4" aria-hidden="true" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="truncate text-sm font-medium">{app.name}</span><span className="truncate font-mono text-[11px] text-muted-foreground">{app.id}</span></span>
              <Badge variant="outline" className={app.environment === "Production" ? "shrink-0 border-success/30 bg-success-soft text-success" : "shrink-0 border-info/30 bg-info-soft text-info"}>{app.environment}</Badge>
            </button>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-3 text-center"><p className="text-sm font-medium">No applications yet</p><p className="text-xs text-muted-foreground">Create your first app to start exploring the workspace.</p><Button size="sm" variant="outline" onClick={onCreateApp}>Create app</Button></div>}
          </CardContent>
          {apps.length > visibleApps.length ? <div className="border-t px-5 py-3 text-xs text-muted-foreground">Showing {visibleApps.length} of {apps.length} apps</div> : null}
        </Card>
      </div>

      <Card className="gap-0 border-info/20 bg-info-soft/30 py-0"><CardContent className="flex items-start gap-3 px-4 py-3.5"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-info/10 text-info"><WaypointsIcon className="size-4" /></span><div className="flex min-w-0 flex-col gap-1"><p className="text-sm font-medium">Demo workspace</p><p className="text-xs leading-relaxed text-muted-foreground">Usage, applications, credentials, and delivery activity are simulated locally. No real API keys or external services are connected.</p></div><CircleCheckIcon className="ml-auto mt-1 size-4 shrink-0 text-info" aria-hidden="true" /></CardContent></Card>
    </div>
  )
}

export function DeveloperPortalUsage({ apps }: { apps: DeveloperApp[] }) {
  const [days, setDays] = useState(30)
  const [appId, setAppId] = useState("all")
  const periods = useMemo(() => getPeriods(days, appId), [days, appId])
  const summary = useMemo(() => summarize(periods.current), [periods.current])
  const appBreakdown = useMemo(() => aggregateBy(periods.current, (row) => apps.find((app) => app.id === row.appId)?.name ?? "Deleted app"), [apps, periods.current])
  const endpointBreakdown = useMemo(() => aggregateBy(periods.current, (row) => row.endpoint), [periods.current])

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
      <StatusDistribution rows={periods.current} />
      {!periods.current.length ? <Card className="flex min-h-48 flex-col items-center justify-center gap-2 text-center"><CardTitle className="text-base">No usage for this filter</CardTitle><CardDescription>Choose another application to view requests in this range.</CardDescription></Card> : null}
    </div>
  )
}
