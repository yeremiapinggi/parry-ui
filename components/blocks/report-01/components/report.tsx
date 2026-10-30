"use client"

import { useMemo, useRef, useState } from "react"
import { DownloadIcon, FileBarChartIcon } from "lucide-react"

import { cn } from "cn"

import { channels } from "@/components/blocks/_data/channels"
import {
  agentRows,
  channelRows,
  reportGroups,
  reportTypes,
  sentimentRows,
  slaRows,
  ticketRows,
  type ReportId,
  type SlaRow,
  type TicketRow,
} from "@/components/blocks/_data/reports"
import { team } from "@/components/blocks/_data/team"
import { AppShell } from "@/components/blocks/_parts/app-shell"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { channelMeta, type ChannelId } from "@/components/blocks/channel-meta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, DataTableColumnHeader, type DataTableColumnDef, type DataTableInstance } from "@/components/ui/data-table"
import { DataToolbar } from "@/components/ui/data-toolbar"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const ranges = ["Today", "Yesterday", "Last 7 days", "Last 30 days"]
const ALL = "all"

const ChannelCell = ({ id }: { id: ChannelId }) => (
  <span className="flex items-center gap-2">
    <ChannelIcon channel={id} />
    {channelMeta[id].label}
  </span>
)
const num = "block text-right font-mono tabular-nums"

// Column sets live at module scope: DataTable rebuilds its row models when `columns` changes identity.
const ticketColumns: DataTableColumnDef<TicketRow>[] = [
  { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="No. Ticket" />, cell: ({ row }) => <span className="font-mono">#{row.original.id}</span> },
  { accessorKey: "customer", header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> },
  { accessorKey: "channel", header: "Channel", cell: ({ row }) => <ChannelCell id={row.original.channel} /> },
  { accessorKey: "group", header: "Group" },
  { accessorKey: "agent", header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" /> },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.original.status === "Closed" ? "secondary" : "outline"}>{row.original.status}</Badge>,
  },
  { accessorKey: "created", header: "Created", cell: ({ row }) => <span className="tabular-nums">{row.original.created}</span> },
  { accessorKey: "replies", header: ({ column }) => <DataTableColumnHeader column={column} title="Replies" />, cell: ({ row }) => <span className={num}>{row.original.replies}</span> },
]

type AgentRow = (typeof agentRows)[number]
const agentColumns: DataTableColumnDef<AgentRow>[] = [
  { accessorKey: "agent", header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" /> },
  { accessorKey: "group", header: "Group" },
  { accessorKey: "handled", header: ({ column }) => <DataTableColumnHeader column={column} title="Handled" />, cell: ({ row }) => <span className={num}>{row.original.handled}</span> },
  { accessorKey: "art", header: ({ column }) => <DataTableColumnHeader column={column} title="ART" />, cell: ({ row }) => <span className={num}>{row.original.art ? `${row.original.art}s` : "–"}</span> },
  { accessorKey: "arr", header: ({ column }) => <DataTableColumnHeader column={column} title="ARR" />, cell: ({ row }) => <span className={num}>{row.original.arr}%</span> },
  {
    accessorKey: "outSla",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Out SLA" />,
    cell: ({ row }) => <span className={cn(num, row.original.outSla > 0 && "text-destructive")}>{row.original.outSla}</span>,
  },
]

type ChannelRow = (typeof channelRows)[number]
const channelColumns: DataTableColumnDef<ChannelRow>[] = [
  { accessorKey: "channel", header: "Channel", cell: ({ row }) => <ChannelCell id={row.original.channel} /> },
  { accessorKey: "tickets", header: ({ column }) => <DataTableColumnHeader column={column} title="Tickets" />, cell: ({ row }) => <span className={num}>{row.original.tickets}</span> },
  { accessorKey: "art", header: ({ column }) => <DataTableColumnHeader column={column} title="ART" />, cell: ({ row }) => <span className={num}>{row.original.art ? `${row.original.art}s` : "–"}</span> },
  { accessorKey: "positive", header: ({ column }) => <DataTableColumnHeader column={column} title="Positive" />, cell: ({ row }) => <span className={num}>{row.original.positive}%</span> },
]

const slaColumns: DataTableColumnDef<SlaRow>[] = [
  { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="No. Ticket" />, cell: ({ row }) => <span className="font-mono">#{row.original.id}</span> },
  { accessorKey: "channel", header: "Channel", cell: ({ row }) => <ChannelCell id={row.original.channel} /> },
  { accessorKey: "agent", header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" /> },
  {
    accessorKey: "firstResponse",
    header: ({ column }) => <DataTableColumnHeader column={column} title="First response" />,
    cell: ({ row }) => <span className={num}>{row.original.firstResponse}s</span>,
  },
  { accessorKey: "target", header: "Target", cell: ({ row }) => <span className={num}>{row.original.target}s</span> },
  {
    id: "result",
    header: "Result",
    cell: ({ row }) =>
      row.original.firstResponse > row.original.target ? <Badge variant="destructive">Breached</Badge> : <Badge variant="secondary">Within SLA</Badge>,
  },
]

type SentimentRow = (typeof sentimentRows)[number]
const sentimentColumns: DataTableColumnDef<SentimentRow>[] = [
  { accessorKey: "day", header: "Day" },
  { accessorKey: "positive", header: ({ column }) => <DataTableColumnHeader column={column} title="Positive" />, cell: ({ row }) => <span className={num}>{row.original.positive}</span> },
  { accessorKey: "neutral", header: ({ column }) => <DataTableColumnHeader column={column} title="Neutral" />, cell: ({ row }) => <span className={num}>{row.original.neutral}</span> },
  { accessorKey: "negative", header: ({ column }) => <DataTableColumnHeader column={column} title="Negative" />, cell: ({ row }) => <span className={num}>{row.original.negative}</span> },
  {
    id: "net",
    header: "Net",
    cell: ({ row }) => {
      const net = row.original.positive - row.original.negative
      return <span className={cn(num, net >= 0 ? "text-success" : "text-destructive")}>{net > 0 ? `+${net}` : net}</span>
    },
  },
]

function TableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading report" className="flex flex-col gap-3">
      <Skeleton className="h-8 w-60" />
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  )
}

export function Report() {
  const [report, setReport] = useState<ReportId>("tickets")
  const [range, setRange] = useState(ranges[2])
  const [group, setGroup] = useState(ALL)
  const [channel, setChannel] = useState(ALL)
  const [agent, setAgent] = useState(ALL)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Simulated fetch: every filter or report change shows the loading state briefly.
  const reload =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setLoading(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setLoading(false), 600)
    }
  const reset = () => {
    reload(setGroup)(ALL)
    setChannel(ALL)
    setAgent(ALL)
  }

  const keep = (r: { channel?: ChannelId; agent?: string; group?: string }) =>
    (channel === ALL || r.channel === channel) && (agent === ALL || r.agent === agent) && (group === ALL || r.group === group)
  const data = useMemo(
    () => ({
      tickets: ticketRows.filter(keep),
      sla: slaRows.filter(keep),
      agents: agentRows.filter((r) => (agent === ALL || r.agent === agent) && (group === ALL || r.group === group)),
      channels: channelRows.filter((r) => channel === ALL || r.channel === channel),
      sentiment: sentimentRows,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep only reads these three filters
    [channel, agent, group]
  )
  const current = reportTypes.find((r) => r.id === report)!

  const empty = (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileBarChartIcon />
        </EmptyMedia>
        <EmptyTitle>No data for these filters</EmptyTitle>
        <EmptyDescription>Try another channel, group or agent, or widen the date range.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={reset}>
          Reset filters
        </Button>
      </EmptyContent>
    </Empty>
  )
  const toolbar = <T extends object>(table: DataTableInstance<T>) => <DataToolbar table={table} searchPlaceholder={`Search ${current.label.toLowerCase()}…`} />

  const filter = (label: string, value: string, onChange: (v: string) => void, options: { value: string; label: string; disabled?: boolean }[]) => (
    <Select value={value} onValueChange={reload(onChange)}>
      <SelectTrigger aria-label={label} className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <AppShell
      active="report"
      title="Report"
      description="Export ticket, agent, channel, SLA and sentiment reports · sample data"
      actions={
        <Button>
          <DownloadIcon />
          Download Excel
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Report types" className="flex flex-col gap-0.5 max-lg:hidden">
          <h2 className="px-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Reports</h2>
          {reportTypes.map((r) => (
            <Button
              key={r.id}
              variant="ghost"
              size="sm"
              aria-current={r.id === report ? "page" : undefined}
              onClick={() => reload(setReport)(r.id)}
              className={cn(
                "h-8 justify-start px-2 font-normal hover:bg-accent",
                r.id === report && "bg-card font-medium text-foreground shadow-xs ring-1 ring-border hover:bg-card"
              )}
            >
              {r.label}
            </Button>
          ))}
        </nav>

        <section aria-label={current.label} className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="lg:hidden">
              {filter("Report type", report, (v) => setReport(v as ReportId), reportTypes.map((r) => ({ value: r.id, label: r.label })))}
            </div>
            <h2 className="font-heading text-base font-semibold max-lg:sr-only">{current.label}</h2>
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </div>

          <div role="group" aria-label="Report filters" className="flex flex-wrap gap-2">
            {filter("Date range", range, setRange, ranges.map((r) => ({ value: r, label: r })))}
            {filter("Group", group, setGroup, [{ value: ALL, label: "All groups" }, ...reportGroups.map((g) => ({ value: g, label: g }))])}
            {filter("Channel", channel, setChannel, [
              { value: ALL, label: "All channels" },
              ...channels.map((c) => ({ value: c.id, label: c.connected ? channelMeta[c.id].label : `${channelMeta[c.id].label} (disconnected)` })),
            ])}
            {filter("Agent", agent, setAgent, [{ value: ALL, label: "All agents" }, ...team.map((a) => ({ value: a.name, label: a.name }))])}
          </div>

          <Card className="py-0">
            <CardContent className="p-4">
              {loading ? (
                <TableSkeleton />
              ) : report === "tickets" ? (
                <DataTable columns={ticketColumns} data={data.tickets} pageSize={8} toolbar={toolbar} emptyText={empty} />
              ) : report === "agents" ? (
                <DataTable columns={agentColumns} data={data.agents} toolbar={toolbar} emptyText={empty} />
              ) : report === "channels" ? (
                <DataTable columns={channelColumns} data={data.channels} toolbar={toolbar} emptyText={empty} />
              ) : report === "sla" ? (
                <DataTable columns={slaColumns} data={data.sla} pageSize={8} toolbar={toolbar} emptyText={empty} />
              ) : (
                <DataTable columns={sentimentColumns} data={data.sentiment} toolbar={toolbar} emptyText={empty} />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  )
}
