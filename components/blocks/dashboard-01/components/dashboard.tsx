"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"

import { channels } from "@/components/blocks/_data/channels"
import { agentStats, artTarget, dashboardKpis, responseTrend, sentimentByDay, ticketsPerChannel } from "@/components/blocks/_data/dashboard"
import { team, teamName } from "@/components/blocks/_data/team"
import { AppShell } from "@/components/blocks/_parts/app-shell"
import { KpiTile } from "@/components/blocks/_parts/kpi-tile"
import { PresenceDot, presenceMeta } from "@/components/blocks/_parts/presence-dot"
import { channelMeta } from "@/components/blocks/channel-meta"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ranges = ["Today", "Yesterday", "Last 7 days", "Last 30 days"]

const channelConfig = { tickets: { label: "Tickets", color: "var(--chart-1)" } } satisfies ChartConfig
const trendConfig = { art: { label: "ART (seconds)", color: "var(--chart-1)" } } satisfies ChartConfig
// Sentiment keeps its meaning across themes by using the status tokens rather than chart hues.
const sentimentConfig = {
  positive: { label: "Positive", color: "var(--success)" },
  neutral: { label: "Neutral", color: "var(--muted-foreground)" },
  negative: { label: "Negative", color: "var(--destructive)" },
} satisfies ChartConfig

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 }

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function Dashboard() {
  const [range, setRange] = useState(ranges[0])
  const [channel, setChannel] = useState("all")
  const channelData = ticketsPerChannel.map((c) => ({ ...c, label: channelMeta[c.channel].label }))

  return (
    <AppShell
      active="dashboard"
      title="Dashboard"
      description={`${range} · Team ${teamName} · sample data`}
      actions={
        <>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger aria-label="Date range" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ranges.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger aria-label="Channel" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {channels.map((c) => (
                <SelectItem key={c.id} value={c.id} disabled={!c.connected}>
                  {channelMeta[c.id].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {dashboardKpis.map((k) => (
            <KpiTile key={k.label} {...k} />
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard title="Tickets per channel" description={`${channelData.reduce((n, c) => n + c.tickets, 0)} tickets ${range.toLowerCase()}`}>
            <ChartContainer config={channelConfig} aria-label="Bar chart of tickets per channel" className="aspect-auto h-64 w-full">
              <BarChart data={channelData} layout="vertical" accessibilityLayer margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 6" />
                <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" width={104} tick={axisTick} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel={false} />} />
                <Bar dataKey="tickets" fill="var(--color-tickets)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Response time trend" description={`Average response time per hour · target ${artTarget}s`}>
            <ChartContainer config={trendConfig} aria-label="Line chart of average response time per hour" className="aspect-auto h-64 w-full">
              <LineChart data={responseTrend} accessibilityLayer margin={{ top: 8, left: 0, right: 12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
                <XAxis dataKey="hour" tick={axisTick} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis width={36} tick={axisTick} tickLine={false} axisLine={false} unit="s" />
                <ReferenceLine
                  y={artTarget}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="6 4"
                  label={{ value: "Target", position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="art" stroke="var(--color-art)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
          </ChartCard>

          <ChartCard title="Sentiment split" description="Tickets by sentiment, last 7 days">
            <ChartContainer config={sentimentConfig} aria-label="Stacked bar chart of ticket sentiment per day" className="aspect-auto h-64 w-full">
              <BarChart data={sentimentByDay} accessibilityLayer margin={{ top: 8, left: 0, right: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 6" />
                <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis width={32} tick={axisTick} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="positive" stackId="s" fill="var(--color-positive)" isAnimationActive={false} />
                <Bar dataKey="neutral" stackId="s" fill="var(--color-neutral)" isAnimationActive={false} />
                <Bar dataKey="negative" stackId="s" fill="var(--color-negative)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base">Agents</CardTitle>
            <CardDescription>
              Team {teamName} · {team.filter((a) => a.presence !== "offline").length} of {team.length} online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Handled</TableHead>
                  <TableHead className="text-right">ART</TableHead>
                  <TableHead className="w-48">ARR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((a) => {
                  const s = agentStats[a.id]
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <span className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            <AvatarFallback>{a.initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{a.name}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <PresenceDot presence={a.presence} />
                          <span aria-hidden="true">{presenceMeta[a.presence].label}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{s.handled}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{s.art}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-3">
                          <Progress value={s.arr} aria-label={`${a.name} reply rate`} className="h-1.5 flex-1" />
                          <span className="w-10 text-right font-mono text-sm tabular-nums">{s.arr}%</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
