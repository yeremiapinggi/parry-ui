"use client"

import { useMemo, useState, type ComponentType } from "react"
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  CheckIcon,
  CircleAlertIcon,
  Clock3Icon,
  HeadsetIcon,
  InboxIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  MonitorIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  SignalIcon,
  UsersRoundIcon,
  type LucideProps,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  OPERATIONAL_AGENTS,
  OPERATIONAL_CHANNELS,
  OPERATIONAL_ISSUES,
  createOperationalSnapshot,
  createServiceHealth,
  type IssueSeverity,
  type IssueState,
  type OperationalChannel,
  type OperationalIssue,
  type ServiceState,
  type WorkItem,
  type WorkStatus,
} from "@/lib/operational-dashboard-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type PreviewState = "default" | "empty" | "no-results"
type FocusMode = "all" | "sla-risk" | "available-agents"
type SortKey = "id" | "channel" | "status" | "sla"
type SortDirection = "asc" | "desc"
type DrawerSelection = { kind: "work-item"; id: string } | { kind: "issue"; id: string } | null

type ChannelIcon = ComponentType<LucideProps>

const channelIcons: Record<OperationalChannel, ChannelIcon> = {
  chat: MessageCircleIcon,
  email: InboxIcon,
  voice: HeadsetIcon,
  web: MonitorIcon,
}

const channelChartConfig = {
  count: { label: "Work items", color: "var(--chart-1)" },
} satisfies ChartConfig

const workStatusLabels: Record<WorkStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
}

const issueSeverityLabels: Record<IssueSeverity, string> = {
  normal: "Normal",
  warning: "At risk",
  critical: "Critical",
}

const issueStateLabels: Record<IssueState, string> = {
  open: "Needs review",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
}

const statusClasses: Record<WorkStatus | IssueSeverity | IssueState | ServiceState, string> = {
  pending: "border-warning/30 bg-warning-soft text-warning",
  active: "border-info/30 bg-info-soft text-info",
  completed: "border-success/30 bg-success-soft text-success",
  normal: "border-border bg-muted text-muted-foreground",
  warning: "border-warning/30 bg-warning-soft text-warning",
  critical: "border-destructive/30 bg-destructive-soft text-destructive",
  open: "border-warning/30 bg-warning-soft text-warning",
  acknowledged: "border-info/30 bg-info-soft text-info",
  resolved: "border-success/30 bg-success-soft text-success",
  connected: "border-success/30 bg-success-soft text-success",
  degraded: "border-warning/30 bg-warning-soft text-warning",
  disconnected: "border-destructive/30 bg-destructive-soft text-destructive",
}

const serviceLabels: Record<ServiceState, string> = {
  connected: "Connected",
  degraded: "Degraded",
  disconnected: "Disconnected",
}

const sortLabels: Record<SortKey, string> = {
  id: "Work item",
  channel: "Channel",
  status: "Status",
  sla: "SLA remaining",
}

function formatSla(minutes: number, status: WorkStatus) {
  if (status === "completed") return "Completed"
  if (minutes < 0) return `${Math.abs(minutes)}m overdue`
  if (minutes === 0) return "Due now"
  return `${minutes}m left`
}

function formatDetected(minutes: number) {
  return minutes < 1 ? "Just now" : `${minutes}m ago`
}

function getChannelLabel(channel: OperationalChannel) {
  return OPERATIONAL_CHANNELS.find((item) => item.key === channel)?.label ?? channel
}

function StatusBadge({ label, kind }: { label: string; kind: WorkStatus | IssueSeverity | IssueState | ServiceState }) {
  return <Badge variant="outline" className={statusClasses[kind]}>{label}</Badge>
}

function MetricCard({
  title,
  value,
  context,
  icon: Icon,
  tone = "info",
  onClick,
  pressed = false,
}: {
  title: string
  value: number
  context: string
  icon: ChannelIcon
  tone?: "info" | "warning" | "critical" | "success"
  onClick: () => void
  pressed?: boolean
}) {
  const toneClass = {
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
    critical: "bg-destructive-soft text-destructive",
    success: "bg-success-soft text-success",
  }[tone]

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="group w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 border-border/80 py-0 transition-colors group-hover:border-primary/40 group-aria-pressed:border-primary group-aria-pressed:bg-muted/30">
        <CardHeader className="flex-row items-center justify-between gap-3 px-4 pt-4 pb-0 sm:px-5 sm:pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${toneClass}`}><Icon aria-hidden="true" className="size-4" /></span>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
          <span className="font-data text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
          <span className="text-xs leading-relaxed text-muted-foreground">{context}</span>
        </CardContent>
      </Card>
    </button>
  )
}

function WorkloadChart({
  items,
  selectedChannel,
  onSelectChannel,
}: {
  items: WorkItem[]
  selectedChannel: OperationalChannel | "all"
  onSelectChannel: (channel: OperationalChannel) => void
}) {
  const chartData = OPERATIONAL_CHANNELS.map((channel) => ({
    key: channel.key,
    name: channel.label,
    count: items.filter((item) => item.channel === channel.key).length,
  }))

  return (
    <Card className="gap-0 border-border/80 py-0">
      <CardHeader className="gap-1 px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
        <CardTitle className="text-base">Workload by Channel</CardTitle>
        <CardDescription>Click a bar or channel name to filter this snapshot.</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-5 sm:pb-4">
        <ChartContainer config={channelChartConfig} aria-label="Horizontal bar chart showing work items by channel" className="h-52 min-h-52 w-full aspect-auto">
          <BarChart data={chartData} layout="vertical" accessibilityLayer margin={{ top: 4, right: 14, left: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 5" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={54} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(value) => <span className="font-mono tabular-nums">{Number(value)} work items</span>} />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              cursor="pointer"
              onClick={(_entry, index) => {
                const channel = chartData[index]?.key
                if (channel) onSelectChannel(channel)
              }}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter workload chart by channel">
          {chartData.map((channel) => (
            <Button key={channel.key} type="button" size="xs" variant={selectedChannel === channel.key ? "secondary" : "ghost"} onClick={() => onSelectChannel(channel.key)} aria-pressed={selectedChannel === channel.key}>
              {channel.name}<span className="ml-1 font-mono tabular-nums text-muted-foreground">{channel.count}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QueueStatus({
  items,
  selectedStatus,
  onSelectStatus,
}: {
  items: WorkItem[]
  selectedStatus: WorkStatus | "all"
  onSelectStatus: (status: WorkStatus) => void
}) {
  const queue = [
    { key: "pending" as const, label: "Pending", detail: "Waiting for an agent", icon: Clock3Icon },
    { key: "active" as const, label: "Active", detail: "In progress", icon: ActivityIcon },
    { key: "completed" as const, label: "Completed", detail: "Resolved in this snapshot", icon: CheckIcon },
  ]

  return (
    <Card className="gap-0 border-border/80 py-0">
      <CardHeader className="gap-1 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <CardTitle className="text-base">Queue Status</CardTitle>
        <CardDescription>Current work-item distribution.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-3 pb-3 sm:px-4 sm:pb-4">
        {queue.map((row) => {
          const Icon = row.icon
          const count = items.filter((item) => item.status === row.key).length
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => onSelectStatus(row.key)}
              aria-pressed={selectedStatus === row.key}
              className="flex items-center gap-3 rounded-lg px-2.5 py-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-muted"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground"><Icon aria-hidden="true" className="size-4" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="text-sm font-medium">{row.label}</span><span className="text-xs text-muted-foreground">{row.detail}</span></span>
              <span className="font-data text-lg font-semibold tabular-nums">{count}</span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ServiceHealth({
  services,
}: {
  services: ReturnType<typeof createServiceHealth>
}) {
  const ServiceIcon = SignalIcon

  return (
    <Card className="gap-0 border-border/80 py-0">
      <CardHeader className="gap-1 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <CardTitle className="text-base">Service Health</CardTitle>
        <CardDescription>Demo channel status; no live services are connected.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-3 pb-3 sm:px-4 sm:pb-4">
        {services.length ? services.map((service) => {
          const ChannelIconComponent = channelIcons[service.channel]
          return (
            <div key={service.channel} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><ChannelIconComponent aria-hidden="true" className="size-4" /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="text-sm font-medium">{getChannelLabel(service.channel)}</span><span className="truncate text-xs text-muted-foreground">{service.detail}</span></span>
              <StatusBadge label={serviceLabels[service.state]} kind={service.state} />
            </div>
          )
        }) : (
          <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-5 text-sm text-muted-foreground"><ServiceIcon aria-hidden="true" className="size-4" />Choose a channel to inspect its demo status.</div>
        )}
      </CardContent>
    </Card>
  )
}

function AttentionRequired({
  issues,
  issueStates,
  onOpenIssue,
  onAcknowledge,
  onResolve,
}: {
  issues: OperationalIssue[]
  issueStates: Record<string, IssueState>
  onOpenIssue: (issueId: string) => void
  onAcknowledge: (issueId: string) => void
  onResolve: (issueId: string) => void
}) {
  const needingReview = issues.filter((issue) => (issueStates[issue.id] ?? "open") === "open").length

  return (
    <Card className="gap-0 border-border/80 py-0">
      <CardHeader className="flex-row items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <div className="flex flex-col gap-1"><CardTitle className="text-base">Attention Required</CardTitle><CardDescription>Prioritized warnings from the demo snapshot.</CardDescription></div>
        <Badge variant={needingReview ? "destructive" : "secondary"}>{needingReview} unacknowledged</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        {issues.length ? issues.map((issue) => {
          const issueState = issueStates[issue.id] ?? "open"
          return (
            <article key={issue.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={issueSeverityLabels[issue.severity]} kind={issue.severity} />
                  <span className="text-xs text-muted-foreground">{formatDetected(issue.detectedMinutesAgo)}</span>
                </div>
                <button type="button" onClick={() => onOpenIssue(issue.id)} className="w-fit text-left text-sm font-medium leading-snug hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{issue.title}</button>
                <p className="text-xs text-muted-foreground">{getChannelLabel(issue.channel)} · {issue.workItemId} · {issueStateLabels[issueState]}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                {issueState === "open" ? <Button type="button" size="xs" variant="outline" onClick={() => onAcknowledge(issue.id)}>Acknowledge</Button> : null}
                <Button type="button" size="xs" variant="ghost" onClick={() => onOpenIssue(issue.id)}>View details</Button>
                <Button type="button" size="xs" variant="secondary" onClick={() => onResolve(issue.id)}>Resolve</Button>
              </div>
            </article>
          )
        }) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center">
            <CheckIcon aria-hidden="true" className="size-5 text-success" />
            <p className="text-sm font-medium">No active issues in this view</p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">Resolved issues leave the attention queue. Change the channel or status filters to inspect another part of the snapshot.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SortButton({
  sortKey,
  activeSort,
  direction,
  onClick,
}: {
  sortKey: SortKey
  activeSort: SortKey
  direction: SortDirection
  onClick: (sortKey: SortKey) => void
}) {
  const ActiveIcon = sortKey === activeSort ? direction === "asc" ? ArrowUpIcon : ArrowDownIcon : ArrowDownUpIcon
  return (
    <button type="button" onClick={() => onClick(sortKey)} className="inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {sortLabels[sortKey]}<ActiveIcon aria-hidden="true" className="size-3" />
    </button>
  )
}

function WorkItemsTable({
  items,
  allItems,
  query,
  onQueryChange,
  onOpenItem,
  noResultsPreview,
}: {
  items: WorkItem[]
  allItems: WorkItem[]
  query: string
  onQueryChange: (query: string) => void
  onOpenItem: (itemId: string) => void
  noResultsPreview: boolean
}) {
  const [sortKey, setSortKey] = useState<SortKey>("sla")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return items
      .filter((item) => !normalizedQuery || `${item.id} ${item.title} ${item.requester} ${item.assignee} ${getChannelLabel(item.channel)}`.toLowerCase().includes(normalizedQuery))
      .sort((first, second) => {
        const firstValue = sortKey === "sla" ? first.slaRemainingMinutes : sortKey === "status" ? workStatusLabels[first.status] : sortKey === "channel" ? getChannelLabel(first.channel) : first.id
        const secondValue = sortKey === "sla" ? second.slaRemainingMinutes : sortKey === "status" ? workStatusLabels[second.status] : sortKey === "channel" ? getChannelLabel(second.channel) : second.id
        const comparison = typeof firstValue === "number" && typeof secondValue === "number" ? firstValue - secondValue : String(firstValue).localeCompare(String(secondValue))
        return sortDirection === "asc" ? comparison : -comparison
      })
  }, [items, query, sortDirection, sortKey])

  function changeSort(nextKey: SortKey) {
    if (nextKey === sortKey) setSortDirection((current) => current === "asc" ? "desc" : "asc")
    else {
      setSortKey(nextKey)
      setSortDirection("asc")
    }
  }

  const tableQuery = noResultsPreview ? "No matching demo work item" : query
  const displayedRows = noResultsPreview ? [] : rows

  return (
    <Card className="gap-0 border-border/80 py-0">
      <CardHeader className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pt-5">
        <div className="flex flex-col gap-1"><CardTitle className="text-base">Active Work Items</CardTitle><CardDescription>{displayedRows.length} shown from {allItems.length} matching work items · select a column to sort</CardDescription></div>
        <label className="relative w-full sm:max-w-xs">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={tableQuery} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search work items" aria-label="Search work items" disabled={noResultsPreview} className="pl-9" />
        </label>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead aria-sort={sortKey === "id" ? sortDirection === "asc" ? "ascending" : "descending" : "none"}><SortButton sortKey="id" activeSort={sortKey} direction={sortDirection} onClick={changeSort} /></TableHead>
              <TableHead>Requester</TableHead>
              <TableHead aria-sort={sortKey === "channel" ? sortDirection === "asc" ? "ascending" : "descending" : "none"}><SortButton sortKey="channel" activeSort={sortKey} direction={sortDirection} onClick={changeSort} /></TableHead>
              <TableHead aria-sort={sortKey === "status" ? sortDirection === "asc" ? "ascending" : "descending" : "none"}><SortButton sortKey="status" activeSort={sortKey} direction={sortDirection} onClick={changeSort} /></TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead aria-sort={sortKey === "sla" ? sortDirection === "asc" ? "ascending" : "descending" : "none"}><SortButton sortKey="sla" activeSort={sortKey} direction={sortDirection} onClick={changeSort} /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedRows.length ? displayedRows.map((item) => (
              <TableRow key={item.id} onClick={() => onOpenItem(item.id)} className="cursor-pointer">
                <TableCell><button type="button" onClick={() => onOpenItem(item.id)} className="flex max-w-64 flex-col gap-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="font-mono text-xs font-semibold text-link">{item.id}</span><span className="truncate text-xs text-foreground">{item.title}</span></button></TableCell>
                <TableCell className="text-xs">{item.requester}</TableCell>
                <TableCell className="text-xs">{getChannelLabel(item.channel)}</TableCell>
                <TableCell><StatusBadge label={workStatusLabels[item.status]} kind={item.status} /></TableCell>
                <TableCell className="text-xs">{item.assignee}</TableCell>
                <TableCell><span className={`font-mono text-xs tabular-nums ${item.status !== "completed" && item.slaRemainingMinutes <= 15 ? item.slaRemainingMinutes < 0 ? "font-semibold text-destructive" : "font-semibold text-warning" : "text-muted-foreground"}`}>{formatSla(item.slaRemainingMinutes, item.status)}</span></TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="whitespace-normal py-10 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                  <SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                  <p className="text-sm font-medium">{allItems.length === 0 ? "No work items in this snapshot" : "No matching work items"}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{allItems.length === 0 ? "The selected snapshot contains no records." : "Try a different search or update the channel and status filters above."}</p>
                </div>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DrawerDetails({
  selection,
  items,
  issues,
  issueStates,
  onAcknowledge,
  onResolve,
  onOpenWorkItem,
  onOpenIssue,
}: {
  selection: DrawerSelection
  items: WorkItem[]
  issues: OperationalIssue[]
  issueStates: Record<string, IssueState>
  onAcknowledge: (issueId: string) => void
  onResolve: (issueId: string) => void
  onOpenWorkItem: (itemId: string) => void
  onOpenIssue: (issueId: string) => void
}) {
  if (!selection) return null
  const item = selection.kind === "work-item" ? items.find((candidate) => candidate.id === selection.id) : items.find((candidate) => candidate.id === issues.find((issue) => issue.id === selection.id)?.workItemId)
  const issue = selection.kind === "issue" ? issues.find((candidate) => candidate.id === selection.id) : issues.find((candidate) => candidate.workItemId === selection.id)

  if (selection.kind === "issue" && issue) {
    const issueState = issueStates[issue.id] ?? "open"
    return (
      <>
        <DialogHeader className="border-b px-5 py-5 pr-12">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge label={issueSeverityLabels[issue.severity]} kind={issue.severity} /><StatusBadge label={issueStateLabels[issueState]} kind={issueState} /></div>
          <DialogTitle className="text-lg leading-snug">{issue.title}</DialogTitle>
          <DialogDescription>{issue.id} · Detected {formatDetected(issue.detectedMinutesAgo)}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
          <section className="flex flex-col gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happened</h3><p className="text-sm leading-relaxed">{issue.description}</p></section>
          <section className="flex flex-col gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended action</h3><p className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed">{issue.recommendedAction}</p></section>
          <section className="flex flex-col gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related work item</h3>
            {item ? <button type="button" onClick={() => onOpenWorkItem(item.id)} className="flex flex-col gap-1 rounded-lg border p-3 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="font-mono text-xs text-link">{item.id}</span><span className="text-sm font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{getChannelLabel(item.channel)} · {workStatusLabels[item.status]} · {formatSla(item.slaRemainingMinutes, item.status)}</span></button> : <p className="text-sm text-muted-foreground">This issue has no visible work item in the current filter.</p>}
          </section>
        </div>
        <div className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
          {issueState === "open" ? <Button type="button" variant="outline" onClick={() => onAcknowledge(issue.id)}>Acknowledge</Button> : null}
          {issueState !== "resolved" ? <Button type="button" onClick={() => onResolve(issue.id)}>Mark as resolved</Button> : <Badge variant="secondary" className="self-center">Resolved in this demo</Badge>}
        </div>
      </>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col gap-3 p-6"><DialogTitle>Work item no longer available</DialogTitle><DialogDescription>The selected record is not part of the current snapshot or filters.</DialogDescription></div>
    )
  }

  return (
    <>
      <DialogHeader className="border-b px-5 py-5 pr-12">
        <div className="flex flex-wrap items-center gap-2"><StatusBadge label={workStatusLabels[item.status]} kind={item.status} /><Badge variant={item.priority === "critical" ? "destructive" : "secondary"}>{item.priority} priority</Badge></div>
        <DialogTitle className="text-lg leading-snug">{item.title}</DialogTitle>
        <DialogDescription>{item.id} · Opened {item.ageMinutes} minutes ago</DialogDescription>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border p-4 text-sm">
          <div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Requester</dt><dd className="font-medium">{item.requester}</dd></div>
          <div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Channel</dt><dd className="font-medium">{getChannelLabel(item.channel)}</dd></div>
          <div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Assigned agent</dt><dd className="font-medium">{item.assignee}</dd></div>
          <div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">SLA</dt><dd className={item.status !== "completed" && item.slaRemainingMinutes <= 15 ? "font-semibold text-warning" : "font-medium"}>{formatSla(item.slaRemainingMinutes, item.status)}</dd></div>
        </dl>
        {issue ? <section className="flex flex-col gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related attention item</h3><div className="rounded-lg border p-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge label={issueSeverityLabels[issue.severity]} kind={issue.severity} /><span className="text-xs text-muted-foreground">{issue.id}</span></div><p className="mt-2 text-sm font-medium">{issue.title}</p><Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => onOpenIssue(issue.id)}>View issue details</Button></div></section> : null}
        <section className="flex flex-col gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo actions</h3><p className="text-sm leading-relaxed text-muted-foreground">This template uses fictional work data. Actions update this local preview only.</p></section>
      </div>
    </>
  )
}

export function OperationalDashboard({ previewState = "default" }: { previewState?: PreviewState }) {
  const [channelFilter, setChannelFilter] = useState<OperationalChannel | "all">("all")
  const [statusFilter, setStatusFilter] = useState<WorkStatus | "all">("all")
  const [focusMode, setFocusMode] = useState<FocusMode>("all")
  const [query, setQuery] = useState("")
  const [snapshotIndex, setSnapshotIndex] = useState(0)
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => createOperationalSnapshot(0))
  const [issueStates, setIssueStates] = useState<Record<string, IssueState>>({})
  const [drawer, setDrawer] = useState<DrawerSelection>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("Oct 27, 2026 · 09:00 AM")
  const [updateFeedback, setUpdateFeedback] = useState("Demo snapshot · Not connected to live services")

  const matchedItems = useMemo(() => (previewState === "empty" ? [] : workItems).filter((item) => {
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesFocus = focusMode === "all"
      || focusMode === "sla-risk" && item.status !== "completed" && item.slaRemainingMinutes <= 15
      || focusMode === "available-agents" && item.status === "active" && OPERATIONAL_AGENTS.some((agent) => agent.name === item.assignee && agent.available)
    return matchesChannel && matchesStatus && matchesFocus
  }), [channelFilter, focusMode, previewState, statusFilter, workItems])

  const workSummary = useMemo(() => ({
    active: matchedItems.filter((item) => item.status === "active").length,
    pending: matchedItems.filter((item) => item.status === "pending").length,
    completed: matchedItems.filter((item) => item.status === "completed").length,
    atRisk: matchedItems.filter((item) => item.status !== "completed" && item.slaRemainingMinutes <= 15).length,
  }), [matchedItems])

  const availableAgentCount = useMemo(() => {
    const relevantChannels = new Set(matchedItems.map((item) => item.channel))
    return OPERATIONAL_AGENTS.filter((agent) => agent.available && agent.channels.some((channel) => relevantChannels.has(channel))).length
  }, [matchedItems])

  const serviceHealth = useMemo(() => createServiceHealth(snapshotIndex).filter((service) => channelFilter === "all" || service.channel === channelFilter), [channelFilter, snapshotIndex])

  const visibleIssues = useMemo(() => {
    const visibleIds = new Set(matchedItems.map((item) => item.id))
    return OPERATIONAL_ISSUES.filter((issue) => visibleIds.has(issue.workItemId) && issue.severity !== "normal" && (issueStates[issue.id] ?? "open") !== "resolved")
  }, [issueStates, matchedItems])

  function setChannel(value: string) {
    setChannelFilter(value as OperationalChannel | "all")
    setFocusMode("all")
  }

  function setStatus(value: string) {
    setStatusFilter(value as WorkStatus | "all")
    setFocusMode("all")
  }

  function showStatus(status: WorkStatus) {
    setStatusFilter(status)
    setFocusMode("all")
  }

  function resetFilters() {
    setChannelFilter("all")
    setStatusFilter("all")
    setFocusMode("all")
    setQuery("")
  }

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setUpdateFeedback("Refreshing demo snapshot…")
    window.setTimeout(() => {
      const nextSnapshot = (snapshotIndex + 1) % 3
      setSnapshotIndex(nextSnapshot)
      setWorkItems(createOperationalSnapshot(nextSnapshot))
      setIssueStates({})
      setLastUpdated(new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date()))
      setRefreshing(false)
      setUpdateFeedback("Updated · Demo data only")
    }, 700)
  }

  function acknowledgeIssue(issueId: string) {
    setIssueStates((current) => ({ ...current, [issueId]: "acknowledged" }))
  }

  function resolveIssue(issueId: string) {
    const issue = OPERATIONAL_ISSUES.find((candidate) => candidate.id === issueId)
    setIssueStates((current) => ({ ...current, [issueId]: "resolved" }))
    if (issue) {
      setWorkItems((current) => current.map((item) => item.id === issue.workItemId ? { ...item, status: "completed", slaRemainingMinutes: 0 } : item))
    }
    setDrawer(null)
  }

  const metrics = [
    { title: "Active Work Items", value: workSummary.active, context: "Currently being handled", icon: ActivityIcon, tone: "info" as const, selected: statusFilter === "active" && focusMode === "all", action: () => showStatus("active") },
    { title: "Waiting Queue", value: workSummary.pending, context: "Waiting for an available agent", icon: Clock3Icon, tone: "warning" as const, selected: statusFilter === "pending" && focusMode === "all", action: () => showStatus("pending") },
    { title: "SLA At Risk", value: workSummary.atRisk, context: "15 minutes or less, including overdue", icon: ShieldAlertIcon, tone: workSummary.atRisk > 0 ? "critical" as const : "success" as const, selected: focusMode === "sla-risk", action: () => { setStatusFilter("all"); setFocusMode((current) => current === "sla-risk" ? "all" : "sla-risk") } },
    { title: "Available Agents", value: availableAgentCount, context: "Available for channels in this view", icon: UsersRoundIcon, tone: "success" as const, selected: focusMode === "available-agents", action: () => { setStatusFilter("all"); setFocusMode((current) => current === "available-agents" ? "all" : "available-agents") } },
  ]

  return (
    <div className="template-preview-container flex w-full min-w-0 flex-col gap-5 text-foreground sm:gap-6">
      <header className="template-dashboard-header flex gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">Operations</Badge><span className="text-xs text-muted-foreground">Fictional demo snapshot</span></div>
          <div className="flex flex-col gap-1.5"><h2 id="operational-overview-heading" className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Operations Overview</h2><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Current workload, service health, and SLA risks that may need a response.</p></div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><span>Last updated {lastUpdated}</span><span aria-hidden="true">·</span><span role="status" aria-live="polite">{refreshing ? "Refreshing demo snapshot…" : updateFeedback}</span></div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:w-36"><span>Channel</span>
            <Select value={channelFilter} onValueChange={setChannel}><SelectTrigger aria-label="Filter dashboard by channel"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All channels</SelectItem>{OPERATIONAL_CHANNELS.map((channel) => <SelectItem key={channel.key} value={channel.key}>{channel.label}</SelectItem>)}</SelectGroup></SelectContent></Select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:w-36"><span>Status</span>
            <Select value={statusFilter} onValueChange={setStatus}><SelectTrigger aria-label="Filter dashboard by work status"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectGroup></SelectContent></Select>
          </label>
          <Button type="button" variant="outline" onClick={handleRefresh} disabled={refreshing} aria-busy={refreshing} className="mt-auto">
            {refreshing ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <RefreshCwIcon data-icon="inline-start" />}
            {refreshing ? "Refreshing…" : "Refresh demo"}
          </Button>
        </div>
      </header>

      <section aria-label="Operational metrics" className="grid template-kpi-grid gap-3">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} context={metric.context} icon={metric.icon} tone={metric.tone} onClick={metric.action} pressed={metric.selected} />)}
      </section>

      {previewState === "empty" ? <div role="status" className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm"><CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="font-medium">This demo snapshot is empty</p><p className="mt-1 leading-relaxed text-muted-foreground">The dashboard retains its structure while showing that there are no work items to summarize.</p></div></div> : null}

      <section aria-label="Workload overview" className="grid template-workload-grid gap-4">
        <WorkloadChart items={matchedItems} selectedChannel={channelFilter} onSelectChannel={(channel) => setChannel(channel)} />
        <QueueStatus items={matchedItems} selectedStatus={statusFilter} onSelectStatus={showStatus} />
      </section>

      <section aria-label="Service and issue overview" className="grid template-service-grid gap-4">
        <ServiceHealth services={serviceHealth} />
        <AttentionRequired
          issues={visibleIssues}
          issueStates={issueStates}
          onOpenIssue={(issueId) => setDrawer({ kind: "issue", id: issueId })}
          onAcknowledge={acknowledgeIssue}
          onResolve={resolveIssue}
        />
      </section>

      <WorkItemsTable
        items={matchedItems}
        allItems={matchedItems}
        query={query}
        onQueryChange={setQuery}
        onOpenItem={(id) => setDrawer({ kind: "work-item", id })}
        noResultsPreview={previewState === "no-results"}
      />

      <footer className="flex flex-col gap-1 border-t pt-3 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span><SignalIcon aria-hidden="true" className="mr-1.5 inline size-3.5 align-[-2px]" />Demo data is fictional and is not connected to a live backend.</span>
        <Button type="button" variant="ghost" size="xs" onClick={resetFilters}>Reset filters</Button>
      </footer>

      <Dialog open={drawer !== null} onOpenChange={(open) => { if (!open) setDrawer(null) }}>
        <DialogContent showCloseButton className="inset-y-0 right-0 left-auto top-0 flex h-dvh w-[min(100vw,30rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-l p-0 sm:max-w-none">
          <DrawerDetails
            selection={drawer}
            items={workItems}
            issues={OPERATIONAL_ISSUES}
            issueStates={issueStates}
            onAcknowledge={acknowledgeIssue}
            onResolve={resolveIssue}
            onOpenWorkItem={(itemId) => setDrawer({ kind: "work-item", id: itemId })}
            onOpenIssue={(issueId) => setDrawer({ kind: "issue", id: issueId })}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function OperationalDashboardThumbnail() {
  const items = createOperationalSnapshot(0)
  const active = items.filter((item) => item.status === "active").length
  const pending = items.filter((item) => item.status === "pending").length
  const risk = items.filter((item) => item.status !== "completed" && item.slaRemainingMinutes <= 15).length
  const channelTotals = OPERATIONAL_CHANNELS.map((channel) => items.filter((item) => item.channel === channel.key).length)
  const itemChannels = new Set(items.map((item) => item.channel))
  const availableAgents = OPERATIONAL_AGENTS.filter((agent) => agent.available && agent.channels.some((channel) => itemChannels.has(channel))).length

  return (
    <div aria-hidden="true" className="flex h-full flex-col gap-2 overflow-hidden bg-background p-3 text-[7px] text-foreground sm:p-4">
      <div className="flex items-center justify-between gap-2"><div className="flex flex-col gap-1"><span className="font-semibold text-[10px]">Operations Overview</span><span className="text-muted-foreground">Fictional workload snapshot</span></div><span className="rounded border px-2 py-1 text-muted-foreground">Refresh demo</span></div>
      <div className="grid grid-cols-4 gap-1.5">
        {[{ label: "Active", value: active }, { label: "Waiting", value: pending }, { label: "SLA at risk", value: risk }, { label: "Agents", value: availableAgents }].map((metric) => <div key={metric.label} className="flex flex-col gap-1 rounded-md border bg-card p-2"><span className="text-muted-foreground">{metric.label}</span><span className="font-data text-sm font-semibold tabular-nums">{metric.value}</span></div>)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_0.9fr] gap-2">
        <div className="flex flex-col gap-2 rounded-md border bg-card p-2"><span className="font-medium">Workload by channel</span>{OPERATIONAL_CHANNELS.map((channel, index) => <div key={channel.key} className="flex items-center gap-2"><span className="w-8 text-muted-foreground">{channel.label}</span><span className="h-1.5 flex-1 overflow-hidden rounded bg-muted"><span className="block h-full rounded bg-primary" style={{ width: `${Math.max(12, channelTotals[index] / Math.max(...channelTotals) * 100)}%` }} /></span><span className="font-mono tabular-nums">{channelTotals[index]}</span></div>)}<div className="mt-1 border-t pt-1.5"><span className="font-medium">Service health</span><div className="mt-1 flex flex-wrap gap-1"><span className="rounded bg-success-soft px-1.5 py-0.5 text-success">Connected</span><span className="rounded bg-warning-soft px-1.5 py-0.5 text-warning">Degraded</span><span className="rounded bg-destructive-soft px-1.5 py-0.5 text-destructive">Disconnected</span></div></div></div>
        <div className="flex min-h-0 flex-col gap-2 rounded-md border bg-card p-2"><span className="font-medium">Attention required</span>{OPERATIONAL_ISSUES.slice(0, 2).map((issue) => <div key={issue.id} className="flex flex-col gap-1 rounded border p-2"><span className={issue.severity === "critical" ? "font-medium text-destructive" : "font-medium text-warning"}>{issue.severity === "critical" ? "Critical" : "At risk"}</span><span className="truncate text-muted-foreground">{issue.title}</span></div>)}<div className="mt-auto flex flex-col gap-1 rounded border p-2"><span className="font-medium">Active work items</span>{items.filter((item) => item.status === "active").slice(0, 2).map((item) => <span key={item.id} className="truncate text-muted-foreground">{item.id} · {item.title}</span>)}</div></div>
      </div>
    </div>
  )
}
