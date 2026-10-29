"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, CircleAlertIcon, Clock3Icon, TrendingUpIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { MonthlyForecast, PipelineMetrics, StageSummary } from "@/lib/pipeline-performance-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, notation: "compact" })
const exactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const forecastConfig = {
  openValue: { label: "Expected close value", color: "var(--chart-2)" },
  weightedValue: { label: "Weighted forecast", color: "var(--chart-4)" },
} satisfies ChartConfig

type PipelineFunnelProps = {
  stages: StageSummary[]
  selectedStage: string | null
  onSelectStage: (stage: string | null) => void
  wonCount: number
  lostCount: number
  compare: boolean
}

export function PipelineFunnel({ stages, selectedStage, onSelectStage, wonCount, lostCount, compare }: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((stage) => stage.opportunityCount), 1)

  return (
    <Card className="min-w-0 gap-0 py-0">
      <CardHeader className="gap-1 px-5 pt-5 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
            <CardDescription>Open opportunity snapshot at period end. Conversion follows stage entries during the selected window.</CardDescription>
          </div>
          <Badge variant="outline">{stages.reduce((sum, stage) => sum + stage.opportunityCount, 0)} open</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3 pb-4 sm:px-5">
        <div className="flex flex-col gap-2" role="group" aria-label="Pipeline stages. Select a stage to filter opportunities.">
          {stages.map((stage, index) => {
            const selected = selectedStage === stage.stage
            const barWidth = Math.max(34, (stage.opportunityCount / maxCount) * 100)
            return (
              <button
                key={stage.stage}
                type="button"
                aria-pressed={selected}
                aria-label={`${stage.stage}, ${stage.opportunityCount} open opportunities, ${stage.conversionRate.toFixed(0)} percent stage conversion, ${stage.dropOffRate.toFixed(0)} percent lost`}
                onClick={() => onSelectStage(selected ? null : stage.stage)}
                className={`group flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${selected ? "border-primary bg-muted/60" : "bg-background"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border bg-card font-mono text-[10px] text-muted-foreground">{index + 1}</span>
                    <span className="truncate text-sm font-semibold">{stage.stage}</span>
                  </span>
                  <span className="font-data text-sm font-semibold tabular-nums">{stage.opportunityCount} <span className="font-sans text-xs font-normal text-muted-foreground">· {currency.format(stage.totalValue)}</span></span>
                </div>
                <span className="block h-2.5 overflow-hidden rounded-sm bg-muted" aria-hidden="true">
                  <span className="block h-full rounded-sm bg-chart-2 transition-[width]" style={{ width: `${barWidth}%` }} />
                </span>
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{stage.conversionRate.toFixed(0)}% to next stage</span>
                  <span>{stage.dropOffRate.toFixed(0)}% lost after entry</span>
                  {compare && <span>Previous snapshot: {stage.previousOpportunityCount}</span>}
                  <span className="ml-auto font-data tabular-nums">{stage.entriesInPeriod} stage entries</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Closed in period</span>
          <span className="flex items-center gap-2">
            <button type="button" onClick={() => onSelectStage(selectedStage === "Won" ? null : "Won")} aria-pressed={selectedStage === "Won"} className="rounded-sm px-1.5 py-1 font-medium text-success hover:bg-success-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">Won {wonCount}</button>
            <button type="button" onClick={() => onSelectStage(selectedStage === "Lost" ? null : "Lost")} aria-pressed={selectedStage === "Lost"} className="rounded-sm px-1.5 py-1 font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">Lost {lostCount}</button>
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">Conversion = entrants who reached the next stage by period end ÷ stage entries in the reporting window. Drop-off = entrants explicitly marked Lost by period end ÷ those entries.</p>
      </CardContent>
    </Card>
  )
}

type SortKey = keyof Pick<StageSummary, "stage" | "opportunityCount" | "totalValue" | "averageDealValue" | "averageDaysInStage" | "conversionRate" | "dropOffRate">

export function StagePerformanceTable({ stages, selectedStage, onSelectStage, compare }: { stages: StageSummary[]; selectedStage: string | null; onSelectStage: (stage: string | null) => void; compare: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("opportunityCount")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")
  const sortedStages = useMemo(() => [...stages].sort((a, b) => {
    const left = a[sortKey]
    const right = b[sortKey]
    const result = typeof left === "string" && typeof right === "string" ? left.localeCompare(right) : Number(left) - Number(right)
    return direction === "asc" ? result : -result
  }), [direction, sortKey, stages])

  function sortBy(key: SortKey) {
    if (sortKey === key) setDirection((current) => current === "asc" ? "desc" : "asc")
    else { setSortKey(key); setDirection("desc") }
  }

  function heading(label: string, key: SortKey, align = "text-left") {
    const Icon = sortKey === key ? direction === "asc" ? ArrowUpIcon : ArrowDownIcon : ArrowUpDownIcon
    return <TableHead className={align}><button type="button" aria-label={`Sort by ${label}`} onClick={() => sortBy(key)} className="inline-flex items-center gap-1.5 rounded-sm font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{label}<Icon aria-hidden="true" className="size-3.5" /></button></TableHead>
  }

  return (
    <Card className="min-w-0 gap-0 py-0">
      <CardHeader className="gap-1 px-5 pt-5 pb-3">
        <CardTitle className="text-base">Stage Performance</CardTitle>
        <CardDescription>Snapshot metrics use the period end date; conversion and loss use transitions observed in the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader><TableRow>
              {heading("Stage", "stage")}{heading("Opportunities", "opportunityCount", "text-right")}{compare && <TableHead className="text-right">Prior snapshot</TableHead>}{heading("Total value", "totalValue", "text-right")}{heading("Avg. deal", "averageDealValue", "text-right")}{heading("Avg. days", "averageDaysInStage", "text-right")}{heading("Conversion", "conversionRate", "text-right")}{heading("Drop-off", "dropOffRate", "text-right")}
            </TableRow></TableHeader>
            <TableBody>
              {sortedStages.map((stage) => (
                <TableRow key={stage.stage} data-state={selectedStage === stage.stage ? "selected" : undefined}>
                  <TableCell><button type="button" aria-pressed={selectedStage === stage.stage} onClick={() => onSelectStage(selectedStage === stage.stage ? null : stage.stage)} className="rounded-sm font-medium hover:text-link focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{stage.stage}</button></TableCell>
                  <TableCell className="text-right font-data tabular-nums">{stage.opportunityCount}</TableCell>
                  {compare && <TableCell className="text-right font-data tabular-nums">{stage.previousOpportunityCount}</TableCell>}
                  <TableCell className="text-right font-data tabular-nums">{exactCurrency.format(stage.totalValue)}</TableCell>
                  <TableCell className="text-right font-data tabular-nums">{exactCurrency.format(stage.averageDealValue)}</TableCell>
                  <TableCell className="text-right font-data tabular-nums">{stage.averageDaysInStage.toFixed(1)}d</TableCell>
                  <TableCell className="text-right font-data tabular-nums">{stage.conversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-data tabular-nums">{stage.dropOffRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function AgingAnalysis({
  metrics,
  threshold,
  onThresholdChange,
  onShowStalled,
}: {
  metrics: PipelineMetrics
  threshold: number
  onThresholdChange: (threshold: number) => void
  onShowStalled: () => void
}) {
  const maxBucket = Math.max(...metrics.agingBuckets.map((bucket) => bucket.count), 1)
  return (
    <Card className="min-w-0 gap-0 py-0">
      <CardHeader className="gap-3 px-5 pt-5 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1"><CardTitle className="flex items-center gap-2 text-base"><Clock3Icon aria-hidden="true" className="size-4 text-muted-foreground" /> Deal Aging &amp; Bottlenecks</CardTitle><CardDescription>Age is measured in the current stage at the selected period-end snapshot.</CardDescription></div>
        <div className="flex items-center gap-2">
          <label htmlFor="pipeline-aging-threshold" className="text-xs text-muted-foreground">Attention threshold</label>
          <Select value={String(threshold)} onValueChange={(value) => onThresholdChange(Number(value))}>
            <SelectTrigger id="pipeline-aging-threshold" className="h-8 w-24" aria-label="Aging threshold"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem><SelectItem value="30">30 days</SelectItem></SelectGroup></SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 px-5 pb-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Average time in stage</p><p className="mt-1 font-data text-xl font-semibold tabular-nums">{metrics.averageDaysInStage.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">days</span></p></div>
            <div className="rounded-md border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Deals above threshold</p><p className="mt-1 font-data text-xl font-semibold tabular-nums">{metrics.stalledOpportunities.length} <span className="text-xs font-normal text-muted-foreground">of {metrics.snapshots.length}</span></p></div>
          </div>
          <div className="rounded-md border p-3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Aging distribution · open opportunities</p>
            <div className="flex flex-col gap-3">
              {metrics.agingBuckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0 text-muted-foreground">{bucket.label}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-sm bg-muted"><span className="block h-full rounded-sm bg-chart-2" style={{ width: `${(bucket.count / maxBucket) * 100}%` }} /></span>
                  <span className="w-6 text-right font-data tabular-nums">{bucket.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-md border bg-warning-soft/50 p-3">
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{metrics.highestAgingStage ? `${metrics.highestAgingStage.stage} has the highest average age` : "No active stage data"}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{metrics.highestAgingStage ? `${metrics.highestAgingStage.days.toFixed(1)} days on average. Age alone is a review signal, not an automatic risk classification.` : "No open opportunities match this pipeline and filter combination."}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-3 rounded-md border p-3">
            <div><p className="text-sm font-medium">Stalled-deal review</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Review opportunities unchanged for {threshold}+ days. The threshold is a triage aid; context and next steps determine whether a deal is actually stalled.</p></div>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onShowStalled} disabled={metrics.stalledOpportunities.length === 0}>View {metrics.stalledOpportunities.length} attention candidates</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ForecastSummary({
  monthlyForecast,
  totalPipelineValue,
  weightedForecast,
  wonRevenue,
  endDateLabel,
}: {
  monthlyForecast: MonthlyForecast[]
  totalPipelineValue: number
  weightedForecast: number
  wonRevenue: number
  endDateLabel: string
}) {
  return (
    <Card className="min-w-0 gap-0 py-0">
      <CardHeader className="gap-1 px-5 pt-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><TrendingUpIcon aria-hidden="true" className="size-4 text-muted-foreground" /> Revenue Forecast</CardTitle>
        <CardDescription>Open value and weighted forecast use the {endDateLabel} snapshot. Won revenue is realized within the reporting period.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 pb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Open pipeline value</p><p className="mt-1 font-data text-lg font-semibold tabular-nums">{currency.format(totalPipelineValue)}</p></div>
          <div className="rounded-md border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Weighted forecast</p><p className="mt-1 font-data text-lg font-semibold tabular-nums">{currency.format(weightedForecast)}</p></div>
          <div className="rounded-md border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Won revenue · realized</p><p className="mt-1 font-data text-lg font-semibold tabular-nums">{currency.format(wonRevenue)}</p></div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Expected close value by month · open value vs. probability-weighted</p>
          <ChartContainer config={forecastConfig} aria-label="Bar chart of expected close value and weighted revenue forecast by month" className="h-52 min-h-52 w-full aspect-auto">
            <BarChart data={monthlyForecast} accessibilityLayer margin={{ top: 8, right: 12, left: 2, bottom: 2 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis width={56} tickLine={false} axisLine={false} tickFormatter={(value) => currency.format(Number(value))} />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(value, name) => <span className="font-data tabular-nums">{exactCurrency.format(Number(value))} · {String(name)}</span>} />} />
              <Bar dataKey="openValue" fill="var(--color-openValue)" radius={[3, 3, 0, 0]} maxBarSize={30} />
              <Bar dataKey="weightedValue" fill="var(--color-weightedValue)" radius={[3, 3, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ChartContainer>
          <p className="mt-2 text-[11px] text-muted-foreground">Weighted Forecast = sum of open opportunity value × recorded win probability. Won revenue is excluded from the forecast.</p>
        </div>
      </CardContent>
    </Card>
  )
}
