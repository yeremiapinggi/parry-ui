"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import type { ChannelSummary, SegmentSummary, TrendPoint } from "@/lib/analytics-dashboard-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const trendConfig = {
  activity: { label: "Activity", color: "var(--chart-2)" },
  previousActivity: { label: "Previous period", color: "var(--chart-5)" },
} satisfies ChartConfig

const channelConfig = {
  activity: { label: "Activity", color: "var(--chart-2)" },
} satisfies ChartConfig

const distributionConfig = {
  completed: { label: "Completed", color: "var(--chart-2)" },
  incomplete: { label: "Not completed", color: "var(--chart-5)" },
} satisfies ChartConfig

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function trendFormatter(value: number | string | readonly (number | string)[] | undefined, name: string | number | undefined, item: { payload?: unknown }) {
  const point = item.payload as TrendPoint | undefined
  const range = name === "previousActivity" ? point?.previousRange : point?.currentRange
  const amount = typeof value === "number" ? value.toLocaleString("en-US") : String(value ?? 0)

  return (
    <div className="flex w-full flex-col gap-1">
      <span className="text-muted-foreground">{range}</span>
      <span className="font-mono font-medium tabular-nums">{amount} events</span>
    </div>
  )
}

export function ActivityTrendChart({
  data,
  compare,
  compact = false,
}: {
  data: TrendPoint[]
  compare: boolean
  compact?: boolean
}) {
  const [visibleSeries, setVisibleSeries] = useState({ activity: true, previousActivity: true })
  const interval = Math.max(0, Math.ceil(data.length / (compact ? 4 : 6)) - 1)

  function toggleSeries(key: "activity" | "previousActivity") {
    setVisibleSeries((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <Card className={compact ? "gap-0 py-0" : "gap-0 py-0"}>
      <CardHeader className={compact ? "gap-1 px-3 py-2" : "gap-2 px-5 py-4"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className={compact ? "text-xs" : "text-base"}>Activity Trend</CardTitle>
            {!compact && <CardDescription>Daily activity across the selected date range.</CardDescription>}
          </div>
          {!compact && (
            <div className="flex flex-wrap items-center gap-1" aria-label="Toggle chart series visibility">
              <button
                type="button"
                aria-pressed={visibleSeries.activity}
                onClick={() => toggleSeries("activity")}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:text-foreground"
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-[var(--chart-2)]" />
                Activity
              </button>
              {compare && (
                <button
                  type="button"
                  aria-pressed={visibleSeries.previousActivity}
                  onClick={() => toggleSeries("previousActivity")}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:text-foreground"
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-[var(--chart-5)]" />
                  Previous period
                </button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "px-2 pb-2" : "px-4 pb-4 sm:px-5"}>
        <ChartContainer
          config={trendConfig}
          aria-label="Line chart showing daily activity and optional previous-period activity"
          className={compact ? "h-28 min-h-28 w-full aspect-auto" : "h-72 min-h-72 w-full aspect-auto sm:h-80 sm:min-h-80"}
        >
          <LineChart data={data} accessibilityLayer={!compact} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={interval}
              minTickGap={compact ? 16 : 24}
            />
            <YAxis
              width={compact ? 36 : 48}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={compactNumber}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.currentRange ?? "Activity"}
                  formatter={trendFormatter}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="activity"
              stroke="var(--color-activity)"
              strokeWidth={compact ? 2 : 2.5}
              dot={false}
              activeDot={{ r: compact ? 2 : 4 }}
              hide={!visibleSeries.activity}
              isAnimationActive={false}
            />
            {compare && (
              <Line
                type="monotone"
                dataKey="previousActivity"
                stroke="var(--color-previousActivity)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 3 }}
                hide={!visibleSeries.previousActivity}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ActivityByChannelChart({ data }: { data: ChannelSummary[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 px-5 py-4">
        <CardTitle className="text-base">Activity by Channel</CardTitle>
        <CardDescription>Events grouped by their originating channel.</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5">
        <ChartContainer
          config={channelConfig}
          aria-label="Horizontal bar chart of activity by channel"
          className="h-56 min-h-56 w-full aspect-auto"
        >
          <BarChart data={data} layout="vertical" accessibilityLayer margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={compactNumber} />
            <YAxis
              type="category"
              dataKey="name"
              width={82}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) => payload?.[0]?.payload?.name ?? "Channel"}
                  formatter={(value) => <span className="font-mono tabular-nums">{Number(value).toLocaleString("en-US")} events</span>}
                />
              }
            />
            <Bar dataKey="activity" fill="var(--color-activity)" radius={[0, 4, 4, 0]} maxBarSize={24} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ActivityDistributionChart({ completed, activity }: { completed: number; activity: number }) {
  const distribution = [
    { key: "completed", name: "Completed", value: completed, fill: "var(--color-completed)" },
    { key: "incomplete", name: "Not completed", value: Math.max(0, activity - completed), fill: "var(--color-incomplete)" },
  ]

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 px-5 py-4">
        <CardTitle className="text-base">Activity Distribution</CardTitle>
        <CardDescription>Completed and incomplete activity in this period.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 px-4 pb-4 sm:px-5">
        <ChartContainer
          config={distributionConfig}
          aria-label="Donut chart showing completed and incomplete activity"
          className="h-52 min-h-52 w-full max-w-72 aspect-auto"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="var(--background)"
              isAnimationActive={false}
            >
              {distribution.map((entry) => <Cell key={entry.key} fill={entry.fill} />)}
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} dy="-0.15em" className="fill-foreground font-data text-lg font-semibold">
                        {activity.toLocaleString("en-US")}
                      </tspan>
                      <tspan x={viewBox.cx} dy="1.65em" className="fill-muted-foreground font-data text-[10px]">
                        total events
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-2 gap-2" aria-label="Activity distribution legend">
          {distribution.map((entry) => (
            <div key={entry.key} className="flex min-w-0 items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
              <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: entry.key === "completed" ? "var(--chart-2)" : "var(--chart-5)" }} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-xs text-muted-foreground">{entry.name}</span>
                <span className="font-mono text-sm font-medium tabular-nums">{entry.value.toLocaleString("en-US")}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TopSegmentsList({ data }: { data: SegmentSummary[] }) {
  const highestActivity = Math.max(1, ...data.map((segment) => segment.activity))

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 px-5 py-4">
        <CardTitle className="text-base">Top Segments</CardTitle>
        <CardDescription>Ranked by total activity in the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 pb-5">
        {data.map((segment, index) => (
          <div key={segment.key} className="flex flex-col gap-2" aria-label={`${index + 1}. ${segment.name}: ${segment.activity.toLocaleString("en-US")} events, ${(segment.share * 100).toFixed(1)} percent of total activity`}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium">
                <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="truncate">{segment.name}</span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{segment.activity.toLocaleString("en-US")}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((segment.activity / highestActivity) * 100)} aria-label={`${segment.name} relative activity`}>
              <div className="h-full rounded-full bg-[var(--chart-2)]" style={{ width: `${(segment.activity / highestActivity) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{(segment.share * 100).toFixed(1)}% of selected activity</p>
          </div>
        ))}
        {data.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No segment data available.</p>}
      </CardContent>
    </Card>
  )
}
