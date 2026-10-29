"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MinusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TrendingDownIcon,
} from "lucide-react"
import { Line, LineChart } from "recharts"

import {
  aggregatePeriod,
  aggregateTrend,
  dateForIndex,
  formatMetric,
  formatRangeLabel,
  indexForDate,
  metricLabel,
  metricValue,
  rankingDataStart,
  rankingPlatforms,
  socialAccounts,
  type PeriodMetrics,
  type RankingMetric,
  type SocialAccount,
} from "@/lib/ranking-analytics-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const columnOptions = [
  { key: "mentions", label: "Total Mentions" },
  { key: "engagement", label: "Engagement" },
  { key: "reach", label: "Reach" },
  { key: "sentiment", label: "Sentiment" },
  { key: "engagementRate", label: "Engagement Rate" },
  { key: "trend", label: "Trend" },
] as const

type ColumnKey = (typeof columnOptions)[number]["key"]
type SortKey = "rank" | "name" | RankingMetric
type SortDirection = "ascending" | "descending"
type PreviewState = "normal" | "loading" | "unavailable" | "ties"
type SentimentFilter = "all" | "positive" | "neutral" | "negative"

type RankedAccount = {
  account: SocialAccount
  current: PeriodMetrics
  previous: PeriodMetrics
  rank: number
  previousRank: number
  trend: { label: string; value: number }[]
}

const sparklineConfig = {
  value: { label: "Selected metric", color: "var(--chart-1)" },
} satisfies ChartConfig

const detailChartConfig = {
  current: { label: "Current period", color: "var(--chart-1)" },
  previous: { label: "Previous period", color: "var(--chart-4)" },
} satisfies ChartConfig

const metrics: RankingMetric[] = ["mentions", "engagement", "reach", "engagementRate"]
const pageSize = 8

function rankAccounts(
  accounts: { account: SocialAccount; current: PeriodMetrics; previous: PeriodMetrics }[],
  metric: RankingMetric,
  startIndex: number,
  endIndex: number,
): RankedAccount[] {
  const currentOrdered = [...accounts].sort((first, second) =>
    metricValue(second.current, metric) - metricValue(first.current, metric) || first.account.name.localeCompare(second.account.name),
  )
  const previousOrdered = [...accounts].sort((first, second) =>
    metricValue(second.previous, metric) - metricValue(first.previous, metric) || first.account.name.localeCompare(second.account.name),
  )
  const previousRanks = new Map<string, number>()
  let previousValue: number | undefined
  let previousRank = 0

  previousOrdered.forEach((row, index) => {
    const value = metricValue(row.previous, metric)
    if (previousValue === undefined || value !== previousValue) previousRank = index + 1
    previousRanks.set(row.account.id, previousRank)
    previousValue = value
  })

  let currentValue: number | undefined
  let currentRank = 0
  return currentOrdered.map((row, index) => {
    const value = metricValue(row.current, metric)
    if (currentValue === undefined || value !== currentValue) currentRank = index + 1
    currentValue = value
    return {
      ...row,
      rank: currentRank,
      previousRank: previousRanks.get(row.account.id) ?? currentRank,
      trend: aggregateTrend(row.account, metric, startIndex, endIndex),
    }
  })
}

function numberLabel(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function safeCsvCell(value: string | number) {
  const stringValue = String(value)
  const safeValue = /^[=+\-@\t\r]/.test(stringValue) ? `'${stringValue}` : stringValue
  return `"${safeValue.replaceAll('"', '""')}"`
}

function comparisonChange(current: number, previous: number, metric: RankingMetric) {
  const difference = current - previous
  const percent = previous === 0 ? current === 0 ? 0 : 100 : (difference / previous) * 100
  const roundedPercent = Math.abs(percent) < 0.05 ? 0 : percent
  const absolute = `${difference > 0 ? "+" : difference < 0 ? "−" : ""}${formatMetric(Math.abs(difference), metric, true)}`
  return { absolute, percent: roundedPercent }
}

function SentimentBar({ metrics: periodMetrics, compact = false }: { metrics: PeriodMetrics; compact?: boolean }) {
  const total = periodMetrics.positive + periodMetrics.neutral + periodMetrics.negative
  const positive = total ? (periodMetrics.positive / total) * 100 : 0
  const neutral = total ? (periodMetrics.neutral / total) * 100 : 0
  const negative = Math.max(0, 100 - positive - neutral)

  return (
    <div className={compact ? "flex min-w-28 flex-col gap-1" : "flex flex-col gap-2"}>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Sentiment: ${Math.round(positive)}% positive, ${Math.round(neutral)}% neutral, ${Math.round(negative)}% negative`}
      >
        <span className="h-full bg-success" style={{ width: `${positive}%` }} />
        <span className="h-full bg-muted-foreground/45" style={{ width: `${neutral}%` }} />
        <span className="h-full bg-destructive" style={{ width: `${negative}%` }} />
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="font-mono tabular-nums text-success">{Math.round(positive)}%</span>
        {!compact && <span>positive</span>}
        {!compact && <span className="font-mono tabular-nums">{Math.round(neutral)}% neutral</span>}
        {!compact && <span className="font-mono tabular-nums text-destructive">{Math.round(negative)}% negative</span>}
      </div>
    </div>
  )
}

function TrendSparkline({ accountName, trend }: { accountName: string; trend: { label: string; value: number }[] }) {
  return (
    <ChartContainer
      config={sparklineConfig}
      aria-label={`${accountName} selected metric trend`}
      className="h-9 min-h-9 w-20 aspect-auto"
    >
      <LineChart data={trend} margin={{ top: 5, right: 1, bottom: 3, left: 1 }}>
        <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  )
}

function RankMovement({ currentRank, previousRank }: { currentRank: number; previousRank: number }) {
  const change = previousRank - currentRank
  if (change === 0) {
    return <span className="inline-flex items-center text-xs text-muted-foreground" aria-label="Rank unchanged"><MinusIcon aria-hidden="true" /></span>
  }
  if (change > 0) {
    return <span className="inline-flex items-center gap-1 text-xs text-success" aria-label={`Up ${change} ${change === 1 ? "place" : "places"}`}><ArrowUpIcon aria-hidden="true" />{change}</span>
  }
  return <span className="inline-flex items-center gap-1 text-xs text-destructive" aria-label={`Down ${Math.abs(change)} ${Math.abs(change) === 1 ? "place" : "places"}`}><ArrowDownIcon aria-hidden="true" />{Math.abs(change)}</span>
}

function MetricValue({ current, previous, metric, compare }: {
  current: number
  previous: number
  metric: RankingMetric
  compare: boolean
}) {
  const change = comparisonChange(current, previous, metric)
  const improving = change.percent >= 0
  return (
    <div className="flex flex-col items-end gap-0.5 text-right">
      <span className="font-mono text-sm font-medium tabular-nums">{formatMetric(current, metric, true)}</span>
      {compare && (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Prev {formatMetric(previous, metric, true)} · {change.absolute}</span>
          <span className={improving ? "text-success" : "text-destructive"}>{change.percent > 0 ? "+" : ""}{change.percent.toFixed(1)}%</span>
        </span>
      )}
    </div>
  )
}

function PlatformFilter({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
  function toggle(platform: string, checked: boolean | "indeterminate") {
    const next = new Set(selected)
    if (checked) next.add(platform)
    else next.delete(platform)
    onChange(rankingPlatforms.filter((value) => next.has(value)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant={selected.length ? "secondary" : "outline"} controlSize="sm" aria-label={selected.length ? `Filter platforms, ${selected.length} selected` : "Filter platforms"}>
          Platforms{selected.length > 0 ? ` · ${selected.length}` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent data-parry-theme widthMode="custom" align="start" className="w-52 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Platforms</p>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" disabled={!selected.length} onClick={() => onChange([])}>Clear</Button>
        </div>
        <fieldset className="flex flex-col gap-2" aria-label="Choose platforms">
          {rankingPlatforms.map((platform) => (
            <label key={platform} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
              <Checkbox checked={selected.includes(platform)} onCheckedChange={(checked) => toggle(platform, checked)} />
              <span>{platform}</span>
            </label>
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}

function ColumnVisibility({ visible, onChange }: { visible: ColumnKey[]; onChange: (next: ColumnKey[]) => void }) {
  function toggle(key: ColumnKey, checked: boolean | "indeterminate") {
    onChange(checked ? [...visible, key] : visible.filter((column) => column !== key))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" controlSize="sm" aria-label="Choose visible columns"><SlidersHorizontalIcon data-icon="inline-start" />Columns</Button>
      </PopoverTrigger>
      <PopoverContent data-parry-theme widthMode="custom" align="end" className="w-56 p-3">
        <p className="mb-2 text-sm font-medium">Visible columns</p>
        <fieldset className="flex flex-col gap-2" aria-label="Choose visible table columns">
          {columnOptions.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
              <Checkbox checked={visible.includes(key)} onCheckedChange={(checked) => toggle(key, checked)} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}

function DetailDrawer({
  account,
  metrics: current,
  previous,
  rank,
  previousRank,
  startIndex,
  endIndex,
  compare,
}: {
  account: SocialAccount | undefined
  metrics: PeriodMetrics | undefined
  previous: PeriodMetrics | undefined
  rank: number | undefined
  previousRank: number | undefined
  startIndex: number
  endIndex: number
  compare: boolean
}) {
  const currentTrend = account ? aggregateTrend(account, "engagement", startIndex, endIndex) : []
  const previousTrend = account ? aggregateTrend(account, "engagement", startIndex, endIndex, true) : []
  const chartData = currentTrend.map((point, index) => ({
    label: point.label,
    current: point.value,
    previous: previousTrend[index]?.value ?? 0,
  }))

  if (!account || !current || !previous) return null

  const details = [
    { label: "Total Mentions", metric: "mentions" as const },
    { label: "Engagement", metric: "engagement" as const },
    { label: "Reach", metric: "reach" as const },
    { label: "Engagement Rate", metric: "engagementRate" as const },
  ]

  return (
    <>
      <SheetHeader className="shrink-0 border-b px-5 py-5 pr-14">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">{account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <div className="flex min-w-0 flex-col gap-1">
            <SheetTitle className="truncate">{account.name}</SheetTitle>
            <SheetDescription className="truncate">{account.handle} · {account.platform}</SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <section className="flex flex-col gap-2" aria-labelledby="drawer-rank-heading">
          <h3 id="drawer-rank-heading" className="text-sm font-semibold">Ranking position</h3>
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-3">
            <div className="flex items-baseline gap-2"><span className="font-mono text-2xl font-semibold tabular-nums">{rank ? `#${rank}` : "—"}</span><span className="text-xs text-muted-foreground">by selected metric</span></div>
            {rank && previousRank ? <RankMovement currentRank={rank} previousRank={previousRank} /> : <span className="text-xs text-muted-foreground">Outside current filters</span>}
          </div>
        </section>
        <section className="flex flex-col gap-2" aria-labelledby="drawer-metrics-heading">
          <h3 id="drawer-metrics-heading" className="text-sm font-semibold">Key metrics</h3>
          <div className="grid grid-cols-2 gap-2">
            {details.map(({ label, metric }) => {
              const change = comparisonChange(current[metric], previous[metric], metric)
              return (
                <div key={metric} className="flex min-w-0 flex-col gap-1 rounded-lg border p-3">
                  <span className="truncate text-xs text-muted-foreground">{label}</span>
                  <span className="font-mono text-base font-semibold tabular-nums">{formatMetric(current[metric], metric, true)}</span>
                  <span className={change.percent >= 0 ? "text-xs text-success" : "text-xs text-destructive"}>Prev {formatMetric(previous[metric], metric, true)} · {change.absolute} ({change.percent > 0 ? "+" : ""}{change.percent.toFixed(1)}%)</span>
                </div>
              )
            })}
          </div>
        </section>
        <section className="flex flex-col gap-2" aria-labelledby="drawer-trend-heading">
          <div className="flex items-center justify-between gap-3">
            <h3 id="drawer-trend-heading" className="text-sm font-semibold">Engagement trend</h3>
            <span className="text-xs text-muted-foreground">{compare ? "Current and previous" : "Current period"}</span>
          </div>
          <ChartContainer config={detailChartConfig} aria-label="Engagement trend compared with the previous period" className="h-44 min-h-44 w-full aspect-auto">
            <LineChart data={chartData} margin={{ top: 10, right: 6, bottom: 4, left: 0 }}>
              <Line dataKey="current" type="monotone" stroke="var(--color-current)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              {compare && <Line dataKey="previous" type="monotone" stroke="var(--color-previous)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
            </LineChart>
          </ChartContainer>
        </section>
        <section className="flex flex-col gap-2" aria-labelledby="drawer-sentiment-heading">
          <h3 id="drawer-sentiment-heading" className="text-sm font-semibold">Sentiment breakdown</h3>
          <SentimentBar metrics={current} />
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[{ name: "Positive", value: current.positive, tone: "text-success" }, { name: "Neutral", value: current.neutral, tone: "text-muted-foreground" }, { name: "Negative", value: current.negative, tone: "text-destructive" }].map((item) => (
              <div key={item.name} className="flex flex-col gap-1 rounded-md bg-muted/40 p-2"><span className="text-muted-foreground">{item.name}</span><span className={`font-mono font-medium tabular-nums ${item.tone}`}>{numberLabel(item.value)}</span></div>
            ))}
          </div>
        </section>
        <p className="text-xs leading-relaxed text-muted-foreground">All values are deterministic fictional sample data for the {formatRangeLabel(startIndex, endIndex)} reporting period.</p>
      </div>
    </>
  )
}

export function RankingAnalyticsTable() {
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("30")
  const [customStart, setCustomStart] = useState(dateForIndex(60))
  const [customEnd, setCustomEnd] = useState(dateForIndex(89))
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [sentiment, setSentiment] = useState<SentimentFilter>("all")
  const [metric, setMetric] = useState<RankingMetric>("engagement")
  const [compare, setCompare] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(columnOptions.map(({ key }) => key))
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending")
  const [page, setPage] = useState(1)
  const [previewState, setPreviewState] = useState<PreviewState>("normal")
  const [exporting, setExporting] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const periodRange = useMemo(() => {
    if (period === "custom") {
      const from = indexForDate(customStart)
      const to = indexForDate(customEnd)
      return { startIndex: from, endIndex: to, valid: Boolean(customStart && customEnd) && from <= to }
    }
    const days = Number(period)
    return { startIndex: 90 - days, endIndex: 89, valid: true }
  }, [customEnd, customStart, period])
  const { startIndex, endIndex } = periodRange

  const allRows = useMemo(() => socialAccounts.map((account) => ({
    account,
    current: aggregatePeriod(account, startIndex, endIndex),
    previous: aggregatePeriod(account, startIndex, endIndex, true),
  })), [endIndex, startIndex])

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return allRows.filter(({ account, current }) => {
      const matchesSearch = !normalizedSearch || `${account.name} ${account.handle} ${account.platform}`.toLocaleLowerCase().includes(normalizedSearch)
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(account.platform)
      const shares = [current.positive, current.neutral, current.negative]
      const leadingSentiment = ["positive", "neutral", "negative"][shares.indexOf(Math.max(...shares))]
      const matchesSentiment = sentiment === "all" || leadingSentiment === sentiment
      return matchesSearch && matchesPlatform && matchesSentiment
    })
  }, [allRows, search, selectedPlatforms, sentiment])

  const rankedRows = useMemo(() => {
    if (previewState === "ties") {
      const tieRows = filteredRows.map((row) => {
        const tiedMetric = { ...row.current, mentions: row.account.dailyCurrent.slice(startIndex, endIndex + 1).reduce((total, day) => total + day.mentions, 0) }
        return { ...row, current: tiedMetric }
      })
      return rankAccounts(tieRows, "mentions", startIndex, endIndex)
    }
    return rankAccounts(filteredRows, metric, startIndex, endIndex)
  }, [endIndex, filteredRows, metric, previewState, startIndex])

  const displayedRows = useMemo(() => {
    const rows = [...rankedRows]
    const sign = sortDirection === "ascending" ? 1 : -1
    rows.sort((first, second) => {
      if (sortKey === "rank") return first.rank - second.rank || first.account.name.localeCompare(second.account.name)
      if (sortKey === "name") return sign * first.account.name.localeCompare(second.account.name)
      return sign * (metricValue(first.current, sortKey) - metricValue(second.current, sortKey)) || first.rank - second.rank
    })
    return rows
  }, [rankedRows, sortDirection, sortKey])

  const pageCount = Math.max(1, Math.ceil(displayedRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRows = displayedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedAccount = socialAccounts.find((account) => account.id === selectedAccountId)
  const selectedMetrics = selectedAccount ? aggregatePeriod(selectedAccount, startIndex, endIndex) : undefined
  const selectedPrevious = selectedAccount ? aggregatePeriod(selectedAccount, startIndex, endIndex, true) : undefined
  const selectedRank = rankedRows.find((row) => row.account.id === selectedAccountId)
  const customRangeInvalid = period === "custom" && !periodRange.valid
  const dateMin = rankingDataStart.toISOString().slice(0, 10)
  const dateMax = dateForIndex(89)
  const visible = (key: ColumnKey) => visibleColumns.includes(key)

  function changeSort(next: SortKey) {
    if (sortKey === next) {
      setSortDirection((current) => current === "ascending" ? "descending" : "ascending")
    } else {
      setSortKey(next)
      setSortDirection(next === "name" ? "ascending" : next === "rank" ? "ascending" : "descending")
    }
    setPage(1)
  }

  function resetFilters() {
    setSearch("")
    setPeriod("30")
    setCustomStart(dateForIndex(60))
    setCustomEnd(dateForIndex(89))
    setSelectedPlatforms([])
    setSentiment("all")
    setMetric("engagement")
    setCompare(false)
    setVisibleColumns(columnOptions.map(({ key }) => key))
    setSortKey("rank")
    setSortDirection("ascending")
    setPage(1)
  }

  function exportCsv() {
    if (exporting || !periodRange.valid || (previewState !== "normal" && previewState !== "ties")) return
    setExporting(true)
    window.setTimeout(() => {
      const headings = ["Rank", "Previous rank", "Rank change", "Account", "Handle", "Platform", "Total mentions", "Engagement", "Reach", "Positive sentiment", "Neutral sentiment", "Negative sentiment", "Engagement rate"]
      if (compare) headings.push("Previous mentions", "Previous engagement", "Previous reach", "Previous engagement rate")
      const records = rankedRows.map((row) => {
        const movement = row.previousRank - row.rank
        const values: (string | number)[] = [row.rank, row.previousRank, movement, row.account.name, row.account.handle, row.account.platform, row.current.mentions, row.current.engagement, row.current.reach, row.current.positive, row.current.neutral, row.current.negative, `${row.current.engagementRate.toFixed(2)}%`]
        if (compare) values.push(row.previous.mentions, row.previous.engagement, row.previous.reach, `${row.previous.engagementRate.toFixed(2)}%`)
        return values.map(safeCsvCell).join(",")
      })
      const csv = [headings.map(safeCsvCell).join(","), ...records].join("\r\n")
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `performance-ranking-${period === "custom" ? "custom" : `${period}d`}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setExporting(false)
    }, 260)
  }

  function updatePeriod(value: string) {
    if (!value) return
    setPeriod(value)
    setPage(1)
  }

  function rangeDateChanged(kind: "start" | "end", value: string) {
    if (kind === "start") setCustomStart(value)
    else setCustomEnd(value)
    setPage(1)
  }

  const rankingLabel = previewState === "ties" ? "Total Mentions" : metricLabel(metric)
  const dateLabel = periodRange.valid ? formatRangeLabel(startIndex, endIndex) : "Choose a valid date range"

  return (
    <div className="flex min-w-0 flex-col gap-4 text-foreground">
      <header className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Performance Ranking</h2>
            <Badge variant="outline" className="font-normal">Fictional demo data</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Compare social account performance, track rank movement, and explore the metrics behind each result.</p>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDaysIcon aria-hidden="true" />Reporting period: {dateLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ranking-preview-state" className="text-xs text-muted-foreground">Preview state</Label>
            <Select value={previewState} onValueChange={(value) => { setPreviewState(value as PreviewState); if (value === "ties") { setMetric("mentions"); setSortKey("rank"); setSortDirection("ascending") } setPage(1) }}>
              <SelectTrigger id="ranking-preview-state" size="sm" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme>
                <SelectGroup>
                  <SelectItem value="normal">Default</SelectItem>
                  <SelectItem value="ties">Tied ranks</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="unavailable">Data unavailable</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" onClick={exportCsv} disabled={exporting || customRangeInvalid || (previewState !== "normal" && previewState !== "ties")}>
            <DownloadIcon data-icon="inline-start" />{exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3" aria-label="Ranking filters and table settings">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1 sm:max-w-64">
              <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} aria-label="Search accounts" placeholder="Search accounts" className="h-8 pl-8" />
            </div>
            <Tabs value={period} onValueChange={updatePeriod} className="shrink-0 gap-0">
              <TabsList aria-label="Reporting period" className="h-8 shrink-0">
                <TabsTrigger value="7" aria-label="Last 7 days" className="px-2 py-0.5 text-xs">7D</TabsTrigger>
                <TabsTrigger value="30" aria-label="Last 30 days" className="px-2 py-0.5 text-xs">30D</TabsTrigger>
                <TabsTrigger value="90" aria-label="Last 90 days" className="px-2 py-0.5 text-xs">90D</TabsTrigger>
                <TabsTrigger value="custom" aria-label="Custom date range" className="px-2 py-0.5 text-xs">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="7" className="sr-only">Showing ranking results for the last 7 days.</TabsContent>
              <TabsContent value="30" className="sr-only">Showing ranking results for the last 30 days.</TabsContent>
              <TabsContent value="90" className="sr-only">Showing ranking results for the last 90 days.</TabsContent>
              <TabsContent value="custom" className="sr-only">Showing ranking results for the custom date range: {dateLabel}.</TabsContent>
            </Tabs>
            <PlatformFilter selected={selectedPlatforms} onChange={(next) => { setSelectedPlatforms(next); setPage(1) }} />
            <div className="flex items-center gap-2">
              <Label htmlFor="sentiment-filter" className="sr-only">Filter by sentiment</Label>
              <Select value={sentiment} onValueChange={(value) => { setSentiment(value as SentimentFilter); setPage(1) }}>
                <SelectTrigger id="sentiment-filter" size="sm" className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent data-parry-theme>
                  <SelectGroup>
                    <SelectItem value="all">All sentiment</SelectItem>
                    <SelectItem value="positive">Positive-led</SelectItem>
                    <SelectItem value="neutral">Neutral-led</SelectItem>
                    <SelectItem value="negative">Negative-led</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="ranking-metric" className="text-xs text-muted-foreground">Rank by</Label>
            <Select value={metric} onValueChange={(value) => { setMetric(value as RankingMetric); setSortKey("rank"); setSortDirection("ascending"); setPage(1) }}>
              <SelectTrigger id="ranking-metric" size="sm" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme>
                <SelectGroup>
                  {metrics.map((value) => <SelectItem key={value} value={value}>{metricLabel(value)}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="compare-period" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare-period" className="cursor-pointer text-xs">Compare period</Label>
            </div>
            <ColumnVisibility visible={visibleColumns} onChange={setVisibleColumns} />
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
          </div>
        </div>
        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
            <Label htmlFor="custom-start" className="text-xs text-muted-foreground">From</Label>
            <Input id="custom-start" type="date" value={customStart} min={dateMin} max={dateMax} onChange={(event) => rangeDateChanged("start", event.target.value)} className="h-8 w-36" />
            <Label htmlFor="custom-end" className="text-xs text-muted-foreground">To</Label>
            <Input id="custom-end" type="date" value={customEnd} min={dateMin} max={dateMax} onChange={(event) => rangeDateChanged("end", event.target.value)} className="h-8 w-36" />
            {customRangeInvalid && <span role="alert" className="text-xs text-destructive">Choose a start date on or before the end date.</span>}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{filteredRows.length} accounts · ranked by <span className="font-medium text-foreground">{rankingLabel}</span></span>
          <span>Ranking position is independent of manual table sorting.</span>
        </div>
      </section>

      {previewState === "unavailable" ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/10 px-5 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted"><TrendingDownIcon aria-hidden="true" className="text-muted-foreground" /></span>
          <div className="flex flex-col gap-1"><h2 className="font-medium">Ranking data is unavailable</h2><p className="max-w-md text-sm leading-relaxed text-muted-foreground">The demo state simulates a source that cannot be reached. No metrics are shown as zero or presented as current.</p></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setPreviewState("normal")}>Retry data</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="truncate text-sm font-semibold">Social Media Performance Ranking</h2>
              <p className="text-xs text-muted-foreground">{compare ? "Current and previous period values are shown together." : "Sort the table without changing rank positions."}</p>
            </div>
            {compare && <Badge variant="secondary" className="shrink-0 gap-1"><ArrowDownUpIcon aria-hidden="true" />Previous period</Badge>}
          </div>
          <div className="max-h-[620px] overflow-auto">
            <Table className="min-w-[1040px]">
              <caption className="sr-only">Fictional social media accounts ranked by {rankingLabel.toLocaleLowerCase()}, with sentiment, trends, and rank change.</caption>
              <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                <TableRow className="hover:bg-muted/95">
                  <TableHead scope="col" aria-sort={sortKey === "rank" ? sortDirection : "none"} className="sticky left-0 z-20 w-24 bg-muted/95">Rank <span className="text-[10px] font-normal text-muted-foreground">· {rankingLabel}</span></TableHead>
                  <TableHead scope="col" aria-sort={sortKey === "name" ? sortDirection : "none"} className="sticky left-24 z-20 min-w-52 bg-muted/95"><Button type="button" variant="ghost" size="sm" className="-ml-2 h-8 px-2 font-medium" onClick={() => changeSort("name")}>Account{sortKey === "name" ? sortDirection === "ascending" ? <ArrowUpIcon data-icon="inline-end" /> : <ArrowDownIcon data-icon="inline-end" /> : <ArrowDownUpIcon data-icon="inline-end" />}</Button></TableHead>
                  {visible("mentions") && <TableHead scope="col" aria-sort={sortKey === "mentions" ? sortDirection : "none"} className="min-w-36 text-right"><MetricSortButton label="Mentions" sortKey="mentions" currentKey={sortKey} direction={sortDirection} onSort={changeSort} /></TableHead>}
                  {visible("engagement") && <TableHead scope="col" aria-sort={sortKey === "engagement" ? sortDirection : "none"} className="min-w-36 text-right"><MetricSortButton label="Engagement" sortKey="engagement" currentKey={sortKey} direction={sortDirection} onSort={changeSort} /></TableHead>}
                  {visible("reach") && <TableHead scope="col" aria-sort={sortKey === "reach" ? sortDirection : "none"} className="min-w-36 text-right"><MetricSortButton label="Reach" sortKey="reach" currentKey={sortKey} direction={sortDirection} onSort={changeSort} /></TableHead>}
                  {visible("sentiment") && <TableHead scope="col" className="min-w-40">Sentiment</TableHead>}
                  {visible("engagementRate") && <TableHead scope="col" aria-sort={sortKey === "engagementRate" ? sortDirection : "none"} className="min-w-36 text-right"><MetricSortButton label="Engagement rate" sortKey="engagementRate" currentKey={sortKey} direction={sortDirection} onSort={changeSort} /></TableHead>}
                  {visible("trend") && <TableHead scope="col" className="w-28 text-right">Trend</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewState === "loading" ? Array.from({ length: 6 }, (_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="size-8 rounded-full" /><div className="flex flex-col gap-1"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                    {columnOptions.filter(({ key }) => visible(key)).map(({ key }) => <TableCell key={key}><Skeleton className="ml-auto h-4 w-20" /></TableCell>)}
                  </TableRow>
                )) : pageRows.map((row) => (
                  <TableRow
                    key={row.account.id}
                    className="cursor-pointer"
                    data-state={selectedAccountId === row.account.id ? "selected" : undefined}
                    onClick={() => setSelectedAccountId(row.account.id)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedAccountId(row.account.id) } }}
                    tabIndex={0}
                    aria-label={`Open analytics for ${row.account.name}, rank ${row.rank}`}
                  >
                    <TableCell className="sticky left-0 z-[1] bg-card font-mono text-sm tabular-nums">
                      <div className="flex items-center gap-2"><span className="w-5 text-right font-semibold">{row.rank}</span><RankMovement currentRank={row.rank} previousRank={row.previousRank} /></div>
                    </TableCell>
                    <TableCell className="sticky left-24 z-[1] bg-card">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted text-[10px] font-semibold">{row.account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                        <span className="flex min-w-0 flex-col gap-0.5"><span className="truncate text-sm font-medium">{row.account.name}</span><span className="truncate text-xs text-muted-foreground">{row.account.handle} · {row.account.platform}</span></span>
                      </div>
                    </TableCell>
                    {visible("mentions") && <TableCell className="text-right"><MetricValue current={row.current.mentions} previous={row.previous.mentions} metric="mentions" compare={compare} /></TableCell>}
                    {visible("engagement") && <TableCell className="text-right"><MetricValue current={row.current.engagement} previous={row.previous.engagement} metric="engagement" compare={compare} /></TableCell>}
                    {visible("reach") && <TableCell className="text-right"><MetricValue current={row.current.reach} previous={row.previous.reach} metric="reach" compare={compare} /></TableCell>}
                    {visible("sentiment") && <TableCell><SentimentBar metrics={row.current} compact /></TableCell>}
                    {visible("engagementRate") && <TableCell className="text-right"><MetricValue current={row.current.engagementRate} previous={row.previous.engagementRate} metric="engagementRate" compare={compare} /></TableCell>}
                    {visible("trend") && <TableCell className="text-right"><TrendSparkline accountName={row.account.name} trend={row.trend} /></TableCell>}
                  </TableRow>
                ))}
                {previewState !== "loading" && pageRows.length === 0 && (
                  <TableRow><TableCell colSpan={2 + visibleColumns.length} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2"><span className="flex size-9 items-center justify-center rounded-full bg-muted"><SearchIcon aria-hidden="true" className="text-muted-foreground" /></span><span className="font-medium">No accounts match these filters</span><span className="text-sm text-muted-foreground">Try another account name or reset the platform and sentiment filters.</span><Button type="button" variant="outline" size="sm" onClick={resetFilters}>Reset filters</Button></div>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <footer className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {displayedRows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, displayedRows.length)} of {displayedRows.length} accounts</span>
            <div className="flex items-center gap-2">
              <span>Page {currentPage} of {pageCount}</span>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeftIcon /></Button>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}><ChevronRightIcon /></Button>
            </div>
          </footer>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span role="status" aria-live="polite">{exporting ? "Preparing the filtered CSV export…" : "Fictional, deterministic sample data. No live social platform data is connected."}</span>
        <span>Ranked by {rankingLabel}{sortKey !== "rank" ? ` · Table sorted by ${sortKey === "name" ? "account name" : metricLabel(sortKey)}` : ""}</span>
      </div>

      <Sheet open={Boolean(selectedAccountId)} onOpenChange={(open) => { if (!open) setSelectedAccountId(null) }}>
        <SheetContent data-parry-theme side="right" className="w-[min(100vw,36rem)] max-w-none gap-0 p-0 sm:max-w-[36rem]">
          <DetailDrawer account={selectedAccount} metrics={selectedMetrics} previous={selectedPrevious} rank={selectedRank?.rank} previousRank={selectedRank?.previousRank} startIndex={startIndex} endIndex={endIndex} compare={compare} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MetricSortButton({ label, sortKey, currentKey, direction, onSort }: {
  label: string
  sortKey: RankingMetric
  currentKey: SortKey
  direction: SortDirection
  onSort: (key: SortKey) => void
}) {
  const active = currentKey === sortKey
  const Icon = active ? direction === "ascending" ? ArrowUpIcon : ArrowDownIcon : ArrowDownUpIcon
  return <Button type="button" variant="ghost" size="sm" className="-mr-2 h-8 px-2 font-medium" onClick={() => onSort(sortKey)}>{label}<Icon data-icon="inline-end" /></Button>
}
