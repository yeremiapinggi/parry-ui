"use client"

import { useMemo, useState } from "react"
import { ActivityIcon, CalendarClockIcon, CircleDollarSignIcon, RotateCcwIcon, TargetIcon, TrendingUpIcon } from "lucide-react"

import {
  addDays,
  buildPipelineOpportunities,
  calculatePipelineMetrics,
  dateInputValue,
  getOpportunityCloseAt,
  getOpportunityCreatedAt,
  getPresetWindow,
  getPreviousWindow,
  getSnapshotState,
  parseDateInput,
  PIPELINE_DEFINITIONS,
  PIPELINE_DEMO_ANCHOR_DATE,
  PIPELINE_LEAD_SOURCES,
  PIPELINE_OWNERS,
  startOfDay,
  type PipelineDefinition,
  type PipelineOpportunity,
  type ReportWindow,
} from "@/lib/pipeline-performance-data"
import { AgingAnalysis, ForecastSummary, PipelineFunnel, StagePerformanceTable } from "@/components/pipeline-performance-analysis"
import { OpportunityDrilldown, type OpportunityListMode } from "@/components/pipeline-performance-opportunities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type PipelineDemoState = "default" | "loading" | "unavailable" | "empty"
export type PipelinePerformanceWorkspaceProps = {
  demoState?: PipelineDemoState
  onRetry?: () => void
  pipelineDefinitions?: PipelineDefinition[]
  opportunities?: PipelineOpportunity[]
  defaultReportEnd?: Date
  dataLabel?: string
}
type PeriodPreset = "7" | "30" | "90" | "custom"
type MetricCardDefinition = {
  label: string
  value: string
  caption: string
  icon: typeof CircleDollarSignIcon
  current: number
  previous: number
  onClick: () => void
  testId: string
}

const demoOpportunities = buildPipelineOpportunities()
const thumbnailPipeline = PIPELINE_DEFINITIONS[0]
const thumbnailWindow = getPresetWindow(30)
const thumbnailMetrics = calculatePipelineMetrics({
  opportunities: demoOpportunities,
  pipeline: thumbnailPipeline,
  window: thumbnailWindow,
  previousWindow: getPreviousWindow(thumbnailWindow),
})
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export function PipelinePerformanceWorkspace({
  demoState = "default",
  onRetry,
  pipelineDefinitions = PIPELINE_DEFINITIONS,
  opportunities = demoOpportunities,
  defaultReportEnd,
  dataLabel = "Fictional demo data",
}: PipelinePerformanceWorkspaceProps) {
  const [anchorDate] = useState(() => startOfDay(defaultReportEnd ?? PIPELINE_DEMO_ANCHOR_DATE))
  const [preset, setPreset] = useState<PeriodPreset>("30")
  const [customStart, setCustomStart] = useState(dateInputValue(addDays(anchorDate, -29)))
  const [customEnd, setCustomEnd] = useState(dateInputValue(anchorDate))
  const [pipelineId, setPipelineId] = useState(() => pipelineDefinitions[0]?.id ?? PIPELINE_DEFINITIONS[0].id)
  const [owner, setOwner] = useState("all")
  const [leadSource, setLeadSource] = useState("all")
  const [compare, setCompare] = useState(false)
  const [agingThreshold, setAgingThreshold] = useState(14)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [opportunityMode, setOpportunityMode] = useState<OpportunityListMode>("open")
  const [showDrilldown, setShowDrilldown] = useState(false)

  const pipeline = pipelineDefinitions.find((definition) => definition.id === pipelineId) ?? pipelineDefinitions[0] ?? PIPELINE_DEFINITIONS[0]
  const metricLabels = pipeline.metricLabels ?? {}
  const compactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: pipeline.currency, maximumFractionDigits: 1, notation: "compact" })
  const window = useMemo<ReportWindow>(() => {
    if (preset === "custom") return { start: parseDateInput(customStart), end: parseDateInput(customEnd) }
    return getPresetWindow(Number(preset), anchorDate)
  }, [anchorDate, customEnd, customStart, preset])
  const validWindow = window.start <= window.end
  const previousWindow = useMemo(() => getPreviousWindow(window), [window])
  const dataset = useMemo(() => demoState === "empty" ? [] : opportunities, [demoState, opportunities])
  const metrics = useMemo(() => calculatePipelineMetrics({
    opportunities: dataset,
    pipeline,
    window,
    previousWindow,
    owner,
    leadSource,
    agingThreshold,
  }), [agingThreshold, dataset, leadSource, owner, pipeline, previousWindow, window])
  const previousMetrics = useMemo(() => calculatePipelineMetrics({
    opportunities: dataset,
    pipeline,
    window: previousWindow,
    previousWindow: getPreviousWindow(previousWindow),
    owner,
    leadSource,
    agingThreshold,
  }), [agingThreshold, dataset, leadSource, owner, pipeline, previousWindow])
  const periodLabel = validWindow ? `${dateFormatter.format(window.start)} – ${dateFormatter.format(window.end)}` : "Invalid date range"
  const periodEndLabel = validWindow ? dateFormatter.format(window.end) : "selected period end"

  const filteredOpportunities = useMemo(() => dataset.filter((opportunity) => (
    opportunity.pipelineId === pipeline.id
    && (owner === "all" || opportunity.owner === owner)
    && (leadSource === "all" || opportunity.leadSource === leadSource)
  )), [dataset, leadSource, owner, pipeline.id])
  const ownerOptions = Array.from(new Set([...PIPELINE_OWNERS, ...opportunities.map((opportunity) => opportunity.owner)]))
  const leadSourceOptions = Array.from(new Set([...PIPELINE_LEAD_SOURCES, ...opportunities.map((opportunity) => opportunity.leadSource)]))

  const drilldownRows = useMemo(() => {
    if (!validWindow) return []
    const snapshots = metrics.snapshots
    if (selectedStage === pipeline.wonStage || opportunityMode === "won") {
      return filteredOpportunities.flatMap((opportunity) => {
        const closedAt = getOpportunityCloseAt(opportunity, pipeline.wonStage)
        const snapshot = getSnapshotState(opportunity, window.end)
        return closedAt && closedAt >= window.start && closedAt <= window.end && snapshot ? [snapshot] : []
      })
    }
    if (selectedStage === pipeline.lostStage || opportunityMode === "lost") {
      return filteredOpportunities.flatMap((opportunity) => {
        const closedAt = getOpportunityCloseAt(opportunity, pipeline.lostStage)
        const snapshot = getSnapshotState(opportunity, window.end)
        return closedAt && closedAt >= window.start && closedAt <= window.end && snapshot ? [snapshot] : []
      })
    }
    if (opportunityMode === "closed") {
      return filteredOpportunities.flatMap((opportunity) => {
        const wonAt = getOpportunityCloseAt(opportunity, pipeline.wonStage)
        const lostAt = getOpportunityCloseAt(opportunity, pipeline.lostStage)
        const closedAt = wonAt ?? lostAt
        const snapshot = getSnapshotState(opportunity, window.end)
        return closedAt && closedAt >= window.start && closedAt <= window.end && snapshot ? [snapshot] : []
      })
    }
    if (opportunityMode === "new") {
      return filteredOpportunities.flatMap((opportunity) => {
        const createdAt = getOpportunityCreatedAt(opportunity)
        const snapshot = getSnapshotState(opportunity, window.end)
        return createdAt >= window.start && createdAt <= window.end && snapshot ? [snapshot] : []
      })
    }
    const sourceRows = opportunityMode === "stalled" ? metrics.stalledOpportunities : snapshots
    return selectedStage ? sourceRows.filter((snapshot) => snapshot.stage === selectedStage) : sourceRows
  }, [filteredOpportunities, metrics.snapshots, metrics.stalledOpportunities, opportunityMode, pipeline, selectedStage, validWindow, window.end, window.start])

  function resetFilters() {
    setPreset("30")
    setCustomStart(dateInputValue(addDays(anchorDate, -29)))
    setCustomEnd(dateInputValue(anchorDate))
    setPipelineId(pipelineDefinitions[0]?.id ?? PIPELINE_DEFINITIONS[0].id)
    setOwner("all")
    setLeadSource("all")
    setCompare(false)
    setAgingThreshold(14)
    setSelectedStage(null)
    setOpportunityMode("open")
    setShowDrilldown(false)
  }

  function selectStage(stage: string | null) {
    setSelectedStage(stage)
    setOpportunityMode("open")
    setShowDrilldown(true)
  }

  const metricCards: MetricCardDefinition[] = [
    {
      label: metricLabels.pipelineValue ?? "Total Pipeline Value",
      value: compactCurrency.format(metrics.totalPipelineValue),
      caption: `Open snapshot · ${periodEndLabel}`,
      icon: CircleDollarSignIcon,
      current: metrics.totalPipelineValue,
      previous: previousMetrics.totalPipelineValue,
      onClick: () => { setSelectedStage(null); setOpportunityMode("open"); setShowDrilldown(true) },
      testId: "pipeline-value-kpi",
    },
    {
      label: metricLabels.wonRevenue ?? "Won Revenue",
      value: compactCurrency.format(metrics.wonRevenue),
      caption: "Realized revenue · selected period",
      icon: TrendingUpIcon,
      current: metrics.wonRevenue,
      previous: previousMetrics.wonRevenue,
      onClick: () => { setSelectedStage(null); setOpportunityMode("won"); setShowDrilldown(true) },
      testId: "won-revenue-kpi",
    },
    {
      label: metricLabels.winRate ?? "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      caption: `${metrics.wonCount} ${pipeline.wonStage.toLowerCase()} / ${metrics.wonCount + metrics.lostCount} closed · selected period`,
      icon: TargetIcon,
      current: metrics.winRate,
      previous: previousMetrics.winRate,
      onClick: () => { setSelectedStage(null); setOpportunityMode("closed"); setShowDrilldown(true) },
      testId: "win-rate-kpi",
    },
    {
      label: metricLabels.weightedForecast ?? "Weighted Revenue Forecast",
      value: compactCurrency.format(metrics.weightedForecast),
      caption: `Open value × win probability · ${periodEndLabel}`,
      icon: ActivityIcon,
      current: metrics.weightedForecast,
      previous: previousMetrics.weightedForecast,
      onClick: () => { setSelectedStage(null); setOpportunityMode("open"); setShowDrilldown(true) },
      testId: "weighted-forecast-kpi",
    },
  ]

  const controls = (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:p-4" aria-label="Pipeline filters">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup type="single" value={preset} onValueChange={(value) => { if (value) setPreset(value as PeriodPreset) }} variant="outline" size="sm" aria-label="Reporting period">
            <ToggleGroupItem value="7">7D</ToggleGroupItem><ToggleGroupItem value="30">30D</ToggleGroupItem><ToggleGroupItem value="90">90D</ToggleGroupItem><ToggleGroupItem value="custom">Custom</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><CalendarClockIcon aria-hidden="true" className="size-3.5" />{periodLabel}</div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters}><RotateCcwIcon data-icon="inline-start" />Reset filters</Button>
      </div>
      {preset === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5"><Label htmlFor="pipeline-date-start">Start date</Label><Input id="pipeline-date-start" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="pipeline-date-end">End date</Label><Input id="pipeline-date-end" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></div>
        </div>
      )}
      {!validWindow && <p role="alert" className="text-sm text-destructive">Choose a start date on or before the end date.</p>}
      <div className="grid template-filter-grid gap-3 xl:items-end">
        <FilterSelect id="pipeline-filter" label="Pipeline" value={pipelineId} onValueChange={(value) => { setPipelineId(value); setSelectedStage(null); setShowDrilldown(false) }} options={pipelineDefinitions.map((item) => ({ value: item.id, label: item.name }))} />
        <FilterSelect id="pipeline-owner-filter" label="Owner" value={owner} onValueChange={setOwner} options={[{ value: "all", label: "All owners" }, ...ownerOptions.map((item) => ({ value: item, label: item }))]} />
        <FilterSelect id="pipeline-source-filter" label="Lead source" value={leadSource} onValueChange={setLeadSource} options={[{ value: "all", label: "All sources" }, ...leadSourceOptions.map((item) => ({ value: item, label: item }))]} />
        <div className="flex items-center gap-2 rounded-md border px-3 py-2.5 xl:mb-px">
          <Switch id="pipeline-compare-period" checked={compare} onCheckedChange={setCompare} />
          <Label htmlFor="pipeline-compare-period" className="cursor-pointer text-sm">Compare period</Label>
        </div>
      </div>
    </section>
  )

  if (!validWindow) {
    return <div className="flex flex-col gap-5">{controls}<p role="alert" className="text-sm text-destructive">The reporting range is invalid. Update the dates above.</p></div>
  }

  if (demoState === "loading") {
    return <div className="flex flex-col gap-5">{controls}<LoadingWorkspace /></div>
  }

  if (demoState === "unavailable") {
    return (
      <div className="flex flex-col gap-5">{controls}
        <Empty className="min-h-64 border bg-card">
          <EmptyHeader><EmptyMedia variant="icon"><CircleDollarSignIcon aria-hidden="true" /></EmptyMedia><EmptyTitle>Pipeline data unavailable</EmptyTitle><EmptyDescription>The data source could not be loaded. No metrics are being presented as zero or as live business data.</EmptyDescription></EmptyHeader>
          <EmptyContent><Button type="button" onClick={onRetry}>Retry demo data</Button></EmptyContent>
        </Empty>
      </div>
    )
  }

  if (demoState === "empty") {
    return (
      <div className="flex flex-col gap-5">{controls}
        <Empty className="min-h-64 border bg-card">
          <EmptyHeader><EmptyMedia variant="icon"><CircleDollarSignIcon aria-hidden="true" /></EmptyMedia><EmptyTitle>Empty pipeline</EmptyTitle><EmptyDescription>This pipeline currently contains no records. Update the data source to populate the workspace.</EmptyDescription></EmptyHeader>
        </Empty>
      </div>
    )
  }

  const compareLabel = compare ? "Compared with the immediately preceding equal-length period" : "Click a metric to inspect its underlying opportunities"

  return (
    <div className="template-preview-container flex min-w-0 flex-col gap-5" data-pipeline-workspace>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">Pipeline Performance</h2><Badge variant="secondary">{dataLabel}</Badge></div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">Investigate conversion, stage throughput, deal aging, and close-date forecasts across your pipeline.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" aria-hidden="true" />{pipeline.entityLabel}: {filteredOpportunities.length}</div>
      </header>

      {controls}

      {filteredOpportunities.length === 0 && (
        <div role="status" className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium">No matching data</p><p className="mt-1 text-xs text-muted-foreground">No records match the selected pipeline, owner, source, and date range. Adjust a filter or reset the workspace.</p></div>
          <Button type="button" size="sm" variant="outline" onClick={resetFilters}>Reset filters</Button>
        </div>
      )}

      <section className="flex flex-col gap-2" aria-labelledby="pipeline-overview-heading">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 id="pipeline-overview-heading" className="text-sm font-semibold">Overview</h3><p className="text-xs text-muted-foreground">{compareLabel}</p></div>
        <div className="grid template-kpi-grid gap-3">
          {metricCards.map((metric) => (
            <MetricCard key={metric.testId} metric={metric} compare={compare} />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
          <p className="text-xs text-muted-foreground"><span className="font-data font-semibold tabular-nums text-foreground">{metrics.newInflows}</span> new {pipeline.entityLabel} created during the selected period</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedStage(null); setOpportunityMode("new"); setShowDrilldown(true) }}>Review new inflows</Button>
        </div>
      </section>

      <section className="grid template-two-pane-grid min-w-0 gap-4" aria-label="Funnel and revenue forecast">
        <PipelineFunnel stages={metrics.stages} selectedStage={selectedStage} onSelectStage={selectStage} wonCount={metrics.wonCount} lostCount={metrics.lostCount} compare={compare} wonStage={pipeline.wonStage} lostStage={pipeline.lostStage} currencyCode={pipeline.currency} entityLabel={pipeline.entityLabel} />
        <ForecastSummary monthlyForecast={metrics.monthlyForecast} totalPipelineValue={metrics.totalPipelineValue} weightedForecast={metrics.weightedForecast} wonRevenue={metrics.wonRevenue} endDateLabel={periodEndLabel} currencyCode={pipeline.currency} pipelineValueLabel={metricLabels.pipelineValue ?? "Open pipeline value"} weightedForecastLabel={metricLabels.weightedForecast ?? "Weighted forecast"} wonRevenueLabel={metricLabels.wonRevenue ?? "Won Revenue"} />
      </section>

      <StagePerformanceTable stages={metrics.stages} selectedStage={selectedStage} onSelectStage={selectStage} compare={compare} currencyCode={pipeline.currency} averageValueLabel={metricLabels.averageDealValue ?? "Avg. deal"} entityLabel={pipeline.entityLabel} />

      <AgingAnalysis metrics={metrics} threshold={agingThreshold} entityLabel={pipeline.entityLabel} onThresholdChange={setAgingThreshold} onShowStalled={() => { setSelectedStage(null); setOpportunityMode("stalled"); setShowDrilldown(true) }} />

      {showDrilldown && (
        <OpportunityDrilldown rows={drilldownRows} mode={opportunityMode} selectedStage={selectedStage} periodLabel={periodLabel} onClearStage={() => { setSelectedStage(null); setOpportunityMode("open") }} currencyCode={pipeline.currency} wonStage={pipeline.wonStage} lostStage={pipeline.lostStage} entityLabel={pipeline.entityLabel} valueLabel={metricLabels.value ?? "Deal value"} pipelineDefinitions={pipelineDefinitions} />
      )}
    </div>
  )
}

function FilterSelect({ id, label, value, onValueChange, options }: { id: string; label: string; value: string; onValueChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(nextValue) => { if (nextValue) onValueChange(nextValue) }}>
        <SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
    </div>
  )
}

function MetricCard({ metric, compare }: { metric: MetricCardDefinition; compare: boolean }) {
  const Icon = metric.icon
  const comparison = getComparison(metric.current, metric.previous)
  return (
    <button type="button" onClick={metric.onClick} data-testid={metric.testId} aria-label={`View ${metric.label} opportunities`} className="group min-w-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full gap-2 py-3 transition-colors group-hover:bg-muted/30 sm:gap-3 sm:py-4">
        <CardHeader className="px-3 py-0 sm:px-4"><div className="flex items-center justify-between gap-2"><span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm"><Icon aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">{metric.label}</span></span><span aria-hidden="true" className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"><TrendingUpIcon className="size-3.5" /></span></div></CardHeader>
        <CardContent className="flex flex-col gap-1 px-3 py-0 sm:px-4">
          <span className="font-data text-lg font-semibold tabular-nums tracking-tight sm:text-2xl">{metric.value}</span>
          <span className="min-h-8 text-[10px] leading-relaxed text-muted-foreground sm:text-xs">{metric.caption}</span>
          {compare && <span className="w-fit rounded-full bg-muted px-2 py-0.5 font-data text-[10px] tabular-nums text-muted-foreground">{comparison ?? "No previous data"} vs prior</span>}
        </CardContent>
      </Card>
    </button>
  )
}

function getComparison(current: number, previous: number) {
  if (!previous) return null
  const delta = ((current - previous) / previous) * 100
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toFixed(1)}%`
}

function LoadingWorkspace() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading pipeline performance">
      <div className="grid template-kpi-grid gap-3">{Array.from({ length: 4 }, (_, index) => <Card key={index} className="gap-3 py-4"><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent className="flex flex-col gap-3"><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-full" /></CardContent></Card>)}</div>
      <div className="grid gap-4 xl:grid-cols-2"><Card className="gap-3 py-4"><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent className="flex flex-col gap-3">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)}</CardContent></Card><Card className="gap-3 py-4"><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-56 w-full" /></CardContent></Card></div>
      <p role="status" className="sr-only">Loading pipeline analytics.</p>
    </div>
  )
}

export function PipelinePerformanceThumbnail() {
  const compactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: thumbnailPipeline.currency, maximumFractionDigits: 1, notation: "compact" })
  const metricValues = [
    compactCurrency.format(thumbnailMetrics.totalPipelineValue),
    compactCurrency.format(thumbnailMetrics.wonRevenue),
    `${thumbnailMetrics.winRate.toFixed(1)}%`,
    compactCurrency.format(thumbnailMetrics.weightedForecast),
  ]
  const metricLabels = [
    thumbnailPipeline.metricLabels?.pipelineValue ?? "Pipeline",
    thumbnailPipeline.metricLabels?.wonRevenue ?? "Won",
    thumbnailPipeline.metricLabels?.winRate ?? "Win rate",
    thumbnailPipeline.metricLabels?.weightedForecast ?? "Weighted",
  ]
  const maxStageCount = Math.max(...thumbnailMetrics.stages.map((stage) => stage.opportunityCount), 1)

  return (
    <div aria-hidden="true" data-parry-theme className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-background p-3 text-foreground sm:gap-2.5 sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <div className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-heading text-[10px] font-semibold sm:text-xs">Pipeline Performance</span><span className="truncate text-[8px] text-muted-foreground sm:text-[9px]">{thumbnailPipeline.name} · fictional demo</span></div>
        <span className="shrink-0 rounded border bg-card px-1.5 py-1 text-[7px] text-muted-foreground sm:text-[8px]">30D</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {metricValues.map((value, index) => <div key={metricLabels[index]} className="min-w-0 rounded border bg-card p-1.5 sm:p-2"><span className="block truncate text-[6px] text-muted-foreground sm:text-[7px]">{metricLabels[index]}</span><span className="mt-1 block truncate font-data text-[9px] font-semibold tabular-nums sm:text-[11px]">{value}</span></div>)}
      </div>
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <div className="flex min-w-0 flex-[1.15] flex-col gap-1 rounded border bg-card p-2">
          <span className="mb-0.5 text-[8px] font-semibold sm:text-[9px]">Conversion Funnel</span>
          {thumbnailMetrics.stages.map((stage) => <div key={stage.stage} className="flex flex-col gap-0.5"><div className="flex justify-between gap-2 text-[6px] sm:text-[7px]"><span className="truncate">{stage.stage}</span><span className="font-data tabular-nums">{stage.opportunityCount}</span></div><span className="h-1.5 overflow-hidden rounded-sm bg-muted"><span className="block h-full rounded-sm bg-chart-2" style={{ width: `${Math.max(20, (stage.opportunityCount / maxStageCount) * 100)}%` }} /></span></div>)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 rounded border bg-card p-2">
          <span className="text-[8px] font-semibold sm:text-[9px]">Stage Performance</span>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-b pb-1 text-[6px] text-muted-foreground sm:text-[7px]"><span>Stage</span><span>Items</span><span>Conv.</span></div>
          {thumbnailMetrics.stages.slice(1, 5).map((stage) => <div key={stage.stage} className="grid grid-cols-[1fr_auto_auto] gap-x-2 border-b py-1 text-[6px] last:border-0 sm:text-[7px]"><span className="truncate">{stage.stage}</span><span className="font-data tabular-nums">{stage.opportunityCount}</span><span className="font-data tabular-nums">{stage.entriesInPeriod ? `${Math.round(stage.conversionRate)}%` : "—"}</span></div>)}
          <div className="mt-auto flex items-center justify-between rounded border bg-muted/30 p-1.5 text-[6px] sm:text-[7px]"><span className="text-muted-foreground">Aging review</span><span className="font-medium">{thumbnailMetrics.stalledOpportunities.length} candidates</span></div>
        </div>
      </div>
    </div>
  )
}
