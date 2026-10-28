"use client"

import { useMemo, useState } from "react"
import { ActivityIcon, ArrowDownIcon, ArrowUpIcon, CircleCheckIcon, InfoIcon, RotateCcwIcon, TimerIcon, UsersRoundIcon, type LucideIcon } from "lucide-react"

import {
  ANALYTICS_END_DATE,
  addDaysToISO,
  aggregateAnalytics,
  buildTrendSeries,
  getAnalyticsDays,
  getInclusiveDateCount,
  getPresetDateRange,
} from "@/lib/analytics-dashboard-data"
import { ActivityByChannelChart, ActivityDistributionChart, ActivityTrendChart, TopSegmentsList } from "@/components/analytics-dashboard-charts"
import { AnalyticsBreakdownTable } from "@/components/analytics-dashboard-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type AnalyticsDemoState = "default" | "loading" | "empty"
type DatePreset = "7" | "30" | "90" | "custom"

const metricHelp = {
  activity: "Total tracked events across this range. Higher volume is directional, so interpret it alongside completion and response outcomes.",
  uniqueUsers: "Distinct fictional user IDs seen at least once in this range. Users are deduplicated across days; reach is directional rather than an outcome by itself.",
  completionRate: "Completed events divided by all tracked events in this range. A higher rate means more activity reached a successful outcome.",
  averageResponse: "Activity-weighted average response time across channels in this range. Lower values represent faster service.",
} as const

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function formatMetricChange(current: number, previous: number) {
  if (previous === 0) return null
  const percent = ((current - previous) / previous) * 100
  const prefix = percent > 0 ? "+" : ""
  return { value: `${prefix}${percent.toFixed(1)}%`, delta: percent }
}

function MetricCard({
  label,
  value,
  help,
  caption,
  icon: Icon,
  comparison,
  compareEnabled = false,
  outcomeDirection = "neutral",
  compact = false,
}: {
  label: string
  value: string
  help: string
  caption: string
  icon: LucideIcon
  comparison?: { value: string; delta: number } | null
  compareEnabled?: boolean
  outcomeDirection?: "higher" | "lower" | "neutral"
  compact?: boolean
}) {
  const isImproving = comparison
    ? outcomeDirection === "higher" ? comparison.delta > 0 : outcomeDirection === "lower" && comparison.delta < 0
    : false
  const isWorsening = comparison
    ? outcomeDirection === "higher" ? comparison.delta < 0 : outcomeDirection === "lower" && comparison.delta > 0
    : false
  const trendTone = isImproving ? "text-success" : isWorsening ? "text-destructive" : "text-muted-foreground"
  const trendBackground = isImproving ? "bg-success-soft" : isWorsening ? "bg-destructive-soft" : "bg-muted"
  const DirectionIcon = comparison?.delta === 0 ? null : comparison ? comparison.delta > 0 ? ArrowUpIcon : ArrowDownIcon : null

  return (
    <Card className={compact ? "gap-2 py-2" : "gap-0 border-border/80 py-0 shadow-sm"}>
      <CardHeader className={compact ? "px-3 pt-2 pb-0" : "px-5 pt-5 pb-0"}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={compact ? "grid size-6 shrink-0 place-items-center rounded-md bg-info-soft text-info" : "grid size-9 shrink-0 place-items-center rounded-lg bg-info-soft text-info"}>
              <Icon aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
            </span>
            <p className={compact ? "truncate text-[9px] font-medium text-muted-foreground" : "truncate text-sm font-medium text-muted-foreground"}>{label}</p>
          </div>
          {!compact && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={`About ${label}`} className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                  <InfoIcon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{help}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "flex flex-col gap-1 px-3 pt-1 pb-2" : "flex flex-col gap-2.5 px-5 pt-4 pb-5"}>
        <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
          <p className={compact ? "font-data text-base font-semibold tabular-nums" : "font-data text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl"}>{value}</p>
          {!compact && compareEnabled && comparison && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tabular-nums ${trendTone} ${trendBackground}`}>
              {DirectionIcon ? <DirectionIcon aria-hidden="true" className="size-3.5" /> : <span aria-hidden="true" className="font-mono">−</span>}
              {comparison.value}
            </span>
          )}
          {!compact && compareEnabled && !comparison && (
            <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">No comparison</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {compact ? (
            <p className="text-[8px] leading-relaxed text-muted-foreground">{caption}</p>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-muted-foreground">{caption}</p>
              {compareEnabled && comparison && <span className="text-xs leading-relaxed text-muted-foreground">· vs. previous period</span>}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricSummary({
  current,
  previous,
  compare,
  compact = false,
}: {
  current: ReturnType<typeof aggregateAnalytics>
  previous?: ReturnType<typeof aggregateAnalytics>
  compare: boolean
  compact?: boolean
}) {
  const metrics = [
    {
      label: "Total Activity",
      value: formatCompact(current.activity),
      help: metricHelp.activity,
      caption: "Tracked events in this range",
      icon: ActivityIcon,
      outcomeDirection: "neutral" as const,
      currentValue: current.activity,
      previousValue: previous?.activity ?? 0,
    },
    {
      label: "Unique Users",
      value: formatCompact(current.uniqueUsers),
      help: metricHelp.uniqueUsers,
      caption: "Distinct users active in this range",
      icon: UsersRoundIcon,
      outcomeDirection: "neutral" as const,
      currentValue: current.uniqueUsers,
      previousValue: previous?.uniqueUsers ?? 0,
    },
    {
      label: "Completion Rate",
      value: `${current.completionRate.toFixed(1)}%`,
      help: metricHelp.completionRate,
      caption: "Share of activity marked complete",
      icon: CircleCheckIcon,
      outcomeDirection: "higher" as const,
      currentValue: current.completionRate,
      previousValue: previous?.completionRate ?? 0,
    },
    {
      label: "Average Response Time",
      value: `${current.averageResponseSeconds.toFixed(1)}s`,
      help: metricHelp.averageResponse,
      caption: "Activity-weighted across channels",
      icon: TimerIcon,
      currentValue: current.averageResponseSeconds,
      previousValue: previous?.averageResponseSeconds ?? 0,
      outcomeDirection: "lower" as const,
    },
  ]

  return (
    <section aria-label="Key performance indicators" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          help={metric.help}
          caption={metric.caption}
          icon={metric.icon}
          outcomeDirection={metric.outcomeDirection}
          comparison={compare ? formatMetricChange(metric.currentValue, metric.previousValue) : undefined}
          compareEnabled={compare}
          compact={compact}
        />
      ))}
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-label="Loading analytics dashboard" aria-busy="true" className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="gap-3 py-4">
            <CardContent className="flex flex-col gap-3 px-5 py-0"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-24" /><Skeleton className="h-3 w-32" /></CardContent>
          </Card>
        ))}
      </div>
      <Card className="gap-4 py-5">
        <CardContent className="flex flex-col gap-4 px-5 py-0"><Skeleton className="h-5 w-36" /><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="gap-4 py-5"><CardContent className="flex flex-col gap-4 px-5 py-0"><Skeleton className="h-5 w-32" /><Skeleton className="h-48 w-full" /></CardContent></Card>
        ))}
      </div>
      <Card className="gap-4 py-5"><CardContent className="flex flex-col gap-4 px-5 py-0"><Skeleton className="h-5 w-40" /><Skeleton className="h-44 w-full" /></CardContent></Card>
    </div>
  )
}

function EmptyDashboard({ noResults, onReset, invalidRange = false }: { noResults: boolean; onReset: () => void; invalidRange?: boolean }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <Badge variant="secondary">{invalidRange ? "Invalid range" : noResults ? "No results" : "Empty data"}</Badge>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="font-data text-lg font-semibold">{invalidRange ? "Check your date selection" : noResults ? "No activity in this date range" : "No analytics data yet"}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {invalidRange
            ? "The start date must be on or before the end date. Update either date to continue."
            : noResults
              ? "The selected range does not overlap the available demo dataset. Choose a date range within the available period to explore the dashboard."
              : "The data source returned no records. The dashboard keeps its structure clear and explains what is missing instead of showing misleading zero-value charts."}
        </p>
      </div>
      {(noResults || invalidRange) && <Button type="button" variant="outline" size="sm" onClick={onReset}>Reset date range</Button>}
    </Card>
  )
}

function DateRangeControls({
  preset,
  setPreset,
  customStart,
  customEnd,
  setCustomStart,
  setCustomEnd,
  compare,
  setCompare,
  onReset,
  rangeError,
}: {
  preset: DatePreset
  setPreset: (preset: DatePreset) => void
  customStart: string
  customEnd: string
  setCustomStart: (value: string) => void
  setCustomEnd: (value: string) => void
  compare: boolean
  setCompare: (value: boolean) => void
  onReset: () => void
  rangeError: string | null
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 lg:items-end">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-40 flex-col gap-1.5">
          <Label htmlFor="analytics-date-range" className="text-xs text-muted-foreground">Date range</Label>
          <Select value={preset} onValueChange={(value) => setPreset(value as DatePreset)}>
            <SelectTrigger id="analytics-date-range" aria-label="Date range" className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="analytics-range-start" className="text-xs text-muted-foreground">Start date</Label>
              <Input id="analytics-range-start" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="w-36" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="analytics-range-end" className="text-xs text-muted-foreground">End date</Label>
              <Input id="analytics-range-end" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="w-36" />
            </div>
          </div>
        )}
        <div className="flex min-h-9 items-center gap-2 pb-1">
          <Switch id="analytics-compare-period" checked={compare} onCheckedChange={setCompare} />
          <Label htmlFor="analytics-compare-period" className="cursor-pointer text-sm">Compare to previous period</Label>
        </div>
        {preset !== "30" && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset} className="mb-0.5">
            <RotateCcwIcon data-icon="inline-start" />Reset date range
          </Button>
        )}
      </div>
      {rangeError && <p role="alert" className="text-sm text-destructive">{rangeError}</p>}
    </div>
  )
}

export function AnalyticsDashboard({ state = "default" }: { state?: AnalyticsDemoState }) {
  const [preset, setPreset] = useState<DatePreset>("30")
  const [customStart, setCustomStart] = useState(() => addDaysToISO(ANALYTICS_END_DATE, -29))
  const [customEnd, setCustomEnd] = useState(ANALYTICS_END_DATE)
  const [compare, setCompare] = useState(true)

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd }
    return getPresetDateRange(Number(preset) as 7 | 30 | 90)
  }, [customEnd, customStart, preset])
  const periodLength = getInclusiveDateCount(range.start, range.end)
  const rangeError = preset === "custom" && !periodLength
    ? "Choose a valid start date that is on or before the end date."
    : null
  const currentDays = useMemo(() => periodLength ? getAnalyticsDays(range.start, range.end) : [], [periodLength, range.end, range.start])
  const previousStart = periodLength ? addDaysToISO(range.start, -periodLength) : ""
  const previousEnd = periodLength ? addDaysToISO(range.end, -periodLength) : ""
  const previousDays = useMemo(() => periodLength ? getAnalyticsDays(previousStart, previousEnd) : [], [periodLength, previousEnd, previousStart])
  const current = useMemo(() => aggregateAnalytics(currentDays), [currentDays])
  const previous = useMemo(() => aggregateAnalytics(previousDays), [previousDays])
  const hasCompletePreviousPeriod = periodLength > 0 && previousDays.length === periodLength
  const trend = useMemo(
    () => periodLength ? buildTrendSeries(currentDays, previousDays, range.start, range.end, periodLength) : [],
    [currentDays, periodLength, previousDays, range.end, range.start],
  )

  function resetDateRange() {
    setPreset("30")
    setCustomStart(addDaysToISO(ANALYTICS_END_DATE, -29))
    setCustomEnd(ANALYTICS_END_DATE)
  }

  return (
    <section className="font-data flex min-w-0 flex-col gap-5" aria-labelledby="analytics-overview-heading">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-2">
          <h2 id="analytics-overview-heading" className="font-data text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Analytics Overview</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Monitor activity, audience, and service performance across your workspace.</p>
          <p className="text-xs text-muted-foreground">Available demo data: Apr 30 – Oct 27, 2026</p>
        </div>
        <DateRangeControls
          preset={preset}
          setPreset={setPreset}
          customStart={customStart}
          customEnd={customEnd}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
          compare={compare}
          setCompare={setCompare}
          onReset={resetDateRange}
          rangeError={rangeError}
        />
      </header>

      {state === "loading" ? (
        <DashboardSkeleton />
      ) : state === "empty" ? (
        <EmptyDashboard noResults={false} onReset={resetDateRange} />
      ) : rangeError ? (
        <EmptyDashboard noResults={false} invalidRange onReset={resetDateRange} />
      ) : currentDays.length === 0 ? (
        <EmptyDashboard noResults onReset={resetDateRange} />
      ) : (
        <div className="flex flex-col gap-5">
          <MetricSummary current={current} previous={hasCompletePreviousPeriod ? previous : undefined} compare={compare} />
          <ActivityTrendChart data={trend} compare={compare && hasCompletePreviousPeriod} />
<div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <ActivityByChannelChart data={current.channels} />
            <ActivityDistributionChart completed={current.completed} activity={current.activity} />
            <TopSegmentsList data={current.segments} />
          </div>
          <AnalyticsBreakdownTable data={current.channels} />
        </div>
      )}
    </section>
  )
}

export function AnalyticsDashboardThumbnail() {
  const range = getPresetDateRange(30)
  const currentDays = getAnalyticsDays(range.start, range.end)
  const previousStart = addDaysToISO(range.start, -30)
  const previousDays = getAnalyticsDays(previousStart, addDaysToISO(range.end, -30))
  const summary = aggregateAnalytics(currentDays)
  const trend = buildTrendSeries(currentDays, previousDays, range.start, range.end, 30)

  return (
    <div aria-hidden="true" className="flex h-full min-h-0 flex-col overflow-hidden bg-background p-3 text-foreground sm:p-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-data text-xs font-semibold sm:text-sm">Analytics Overview</span>
            <span className="truncate text-[8px] text-muted-foreground sm:text-[9px]">Monitor activity and performance</span>
          </div>
          <span className="shrink-0 rounded-md border bg-card px-2 py-1 text-[8px] text-muted-foreground sm:text-[9px]">Last 30 Days</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          <MetricCard compact label="Total Activity" value={formatCompact(summary.activity)} help="Total activity" caption="Tracked events" icon={ActivityIcon} />
          <MetricCard compact label="Unique Users" value={formatCompact(summary.uniqueUsers)} help="Unique users" caption="Distinct active users" icon={UsersRoundIcon} />
          <MetricCard compact label="Completion Rate" value={`${summary.completionRate.toFixed(1)}%`} help="Completion rate" caption="Completed activity" icon={CircleCheckIcon} />
          <MetricCard compact label="Avg Response" value={`${summary.averageResponseSeconds.toFixed(1)}s`} help="Average response" caption="Across all channels" icon={TimerIcon} />
        </div>
        <ActivityTrendChart data={trend} compare={false} compact />
      </div>
    </div>
  )
}
