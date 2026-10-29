"use client"

import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon, Clock3Icon, EllipsisIcon, FileJson2Icon, RefreshCwIcon, SearchIcon, XCircleIcon } from "lucide-react"

import { type DeveloperApp, type RequestLog } from "@/lib/developer-portal-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const pageSize = 6
type SortKey = "timestamp" | "app" | "method" | "endpoint" | "status" | "responseTime"

function statusTone(status: number) {
  if (status < 300) return "border-success/30 bg-success-soft text-success"
  if (status < 500) return "border-warning/30 bg-warning-soft text-warning"
  return "border-destructive/30 bg-destructive-soft text-destructive"
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", timeZone: "UTC" }).format(new Date(timestamp))
}

function SortButton({ label, active, direction, onClick }: { label: string; active: boolean; direction: "asc" | "desc"; onClick: () => void }) {
  const Icon = active ? direction === "asc" ? ArrowUpIcon : ArrowDownIcon : ArrowUpDownIcon
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">{label}<Icon className="size-3.5" /></button>
}

export function DeveloperPortalLogs({ apps, logs }: { apps: DeveloperApp[]; logs: RequestLog[] }) {
  const [query, setQuery] = useState("")
  const [appFilter, setAppFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rangeDays, setRangeDays] = useState(30)
  const [sortKey, setSortKey] = useState<SortKey>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const filteredLogs = useMemo(() => {
    const latest = logs.reduce((value, log) => Math.max(value, new Date(log.timestamp).getTime()), 0)
    const rangeStart = latest - rangeDays * 24 * 60 * 60 * 1000
    const normalized = query.trim().toLocaleLowerCase()
    return logs.filter((log) => {
      const appName = apps.find((app) => app.id === log.appId)?.name ?? "Deleted app"
      const matchesQuery = !normalized || [appName, log.method, log.endpoint, String(log.status), log.requestId].some((value) => value.toLocaleLowerCase().includes(normalized))
      const matchesApp = appFilter === "all" || log.appId === appFilter
      const matchesStatus = statusFilter === "all" || (statusFilter === "2xx" && log.status >= 200 && log.status < 300) || (statusFilter === "4xx" && log.status >= 400 && log.status < 500) || (statusFilter === "5xx" && log.status >= 500 && log.status < 600)
      return matchesQuery && matchesApp && matchesStatus && new Date(log.timestamp).getTime() >= rangeStart
    }).sort((first, second) => {
      const appFirst = apps.find((app) => app.id === first.appId)?.name ?? "Deleted app"
      const appSecond = apps.find((app) => app.id === second.appId)?.name ?? "Deleted app"
      const values: Record<SortKey, number> = {
        timestamp: new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime(),
        app: appFirst.localeCompare(appSecond),
        method: first.method.localeCompare(second.method),
        endpoint: first.endpoint.localeCompare(second.endpoint),
        status: first.status - second.status,
        responseTime: first.responseTimeMs - second.responseTimeMs,
      }
      return values[sortKey] * (sortDirection === "asc" ? 1 : -1)
    })
  }, [appFilter, apps, logs, query, rangeDays, sortDirection, sortKey, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function changeSort(key: SortKey) {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDirection("asc") }
    setPage(1)
  }

  function refreshLogs() {
    setLoadError(false)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 450)
  }

  const selectedAppName = selectedLog ? apps.find((app) => app.id === selectedLog.appId)?.name ?? "Deleted app" : ""
  const detailJson = selectedLog ? {
    request: {
      id: selectedLog.requestId,
      timestamp: selectedLog.timestamp,
      method: selectedLog.method,
      path: selectedLog.endpoint,
      app: selectedAppName,
      headers: { "content-type": "application/json", authorization: "Bearer [REDACTED]", "x-request-id": selectedLog.requestId },
      body: selectedLog.requestBody,
    },
    response: { status: selectedLog.status, duration_ms: selectedLog.responseTimeMs, body: selectedLog.responseBody },
  } : null

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-col gap-1.5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Observability</p><h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Request logs</h1><p className="text-sm leading-relaxed text-muted-foreground">Inspect request metadata, response status, and latency.</p></div><div className="flex items-center gap-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Log actions"><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setLoadError(true)}><XCircleIcon />Simulate API error</DropdownMenuItem><DropdownMenuItem onSelect={() => setLoadError(false)}>Clear error</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Button variant="outline" onClick={refreshLogs} disabled={loading}><RefreshCwIcon className={loading ? "animate-spin" : ""} data-icon="inline-start" />Refresh</Button></div></header>

      {loadError ? <Card className="gap-3 border-destructive/30 bg-destructive-soft/30 py-4"><CardContent className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" /><div><p className="text-sm font-medium">Could not load request logs</p><p className="mt-1 text-xs text-muted-foreground">The simulated API returned a temporary error. Your filters and selection are unchanged.</p></div></div><Button size="sm" variant="outline" onClick={refreshLogs}>Retry</Button></CardContent></Card> : null}

      <Card className="gap-0 py-0"><CardHeader className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><CardTitle className="text-base">Request activity</CardTitle><CardDescription className="mt-1">{filteredLogs.length} matching requests in the selected window.</CardDescription></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex">
        <div className="relative min-w-0 sm:col-span-2 xl:w-64"><SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search logs" aria-label="Search request logs" className="pl-9" /></div>
        <Select value={appFilter} onValueChange={(value) => { setAppFilter(value); setPage(1) }}><SelectTrigger className="w-full xl:w-44" aria-label="Filter logs by application"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All applications</SelectItem>{apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}><SelectTrigger className="w-full xl:w-36" aria-label="Filter logs by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="2xx">2xx success</SelectItem><SelectItem value="4xx">4xx client error</SelectItem><SelectItem value="5xx">5xx server error</SelectItem></SelectContent></Select>
        <Select value={String(rangeDays)} onValueChange={(value) => { setRangeDays(Number(value)); setPage(1) }}><SelectTrigger className="w-full xl:w-36" aria-label="Filter logs by date range"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
      </div></CardHeader><CardContent className="p-0">
        {loading ? <div aria-label="Loading request logs" aria-busy="true" className="flex flex-col gap-3 p-4">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex items-center gap-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-16" /></div>)}</div> : visibleLogs.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead><SortButton label="Timestamp" active={sortKey === "timestamp"} direction={sortDirection} onClick={() => changeSort("timestamp")} /></TableHead><TableHead><SortButton label="Application" active={sortKey === "app"} direction={sortDirection} onClick={() => changeSort("app")} /></TableHead><TableHead><SortButton label="Method" active={sortKey === "method"} direction={sortDirection} onClick={() => changeSort("method")} /></TableHead><TableHead><SortButton label="Endpoint" active={sortKey === "endpoint"} direction={sortDirection} onClick={() => changeSort("endpoint")} /></TableHead><TableHead><SortButton label="Status" active={sortKey === "status"} direction={sortDirection} onClick={() => changeSort("status")} /></TableHead><TableHead><SortButton label="Latency" active={sortKey === "responseTime"} direction={sortDirection} onClick={() => changeSort("responseTime")} /></TableHead><TableHead>Request ID</TableHead></TableRow></TableHeader><TableBody>{visibleLogs.map((log) => <TableRow key={log.id}>
          <TableCell className="min-w-36 whitespace-nowrap text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</TableCell><TableCell className="min-w-32 text-xs">{apps.find((app) => app.id === log.appId)?.name ?? "Deleted app"}</TableCell><TableCell><Badge variant="outline" className="font-mono text-[10px]">{log.method}</Badge></TableCell><TableCell className="min-w-40"><code className="font-mono text-xs">{log.endpoint}</code></TableCell><TableCell><Badge variant="outline" className={statusTone(log.status)}>{log.status}</Badge></TableCell><TableCell className="whitespace-nowrap font-mono text-xs tabular-nums">{log.responseTimeMs} ms</TableCell><TableCell><Button type="button" variant="link" size="sm" className="h-auto p-0 font-mono text-[11px]" onClick={() => setSelectedLog(log)}>{log.requestId}</Button></TableCell>
        </TableRow>)}</TableBody></Table></div> : <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-10 text-center"><span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><SearchIcon className="size-5" /></span><div className="flex max-w-sm flex-col gap-1"><p className="text-sm font-medium">No request logs found</p><p className="text-sm leading-relaxed text-muted-foreground">No rows match the current search and filters. Try a different term or clear the filters.</p></div><Button size="sm" variant="outline" onClick={() => { setQuery(""); setAppFilter("all"); setStatusFilter("all"); setRangeDays(30); setPage(1) }}>Clear filters</Button></div>}
      </CardContent>{filteredLogs.length > pageSize ? <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p className="text-xs text-muted-foreground">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length}</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeftIcon data-icon="inline-start" />Previous</Button><span className="px-1 text-xs text-muted-foreground">Page {currentPage} of {pageCount}</span><Button size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next<ChevronRightIcon data-icon="inline-end" /></Button></div></div> : null}</Card>

      <Sheet open={Boolean(selectedLog)} onOpenChange={(open) => { if (!open) setSelectedLog(null) }}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">{selectedLog && detailJson ? <><SheetHeader className="border-b pb-4"><div className="flex items-center gap-2"><FileJson2Icon className="size-4 text-info" /><SheetTitle>Request details</SheetTitle><Badge variant="outline" className={statusTone(selectedLog.status)}>{selectedLog.status}</Badge></div><SheetDescription>{selectedLog.method} {selectedLog.endpoint} · {formatTimestamp(selectedLog.timestamp)}</SheetDescription></SheetHeader><div className="flex flex-col gap-4 px-5 pb-6"><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Application</p><p className="mt-1 text-sm font-medium">{selectedAppName}</p></div><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Response time</p><p className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm"><Clock3Icon className="size-3.5" />{selectedLog.responseTimeMs} ms</p></div><div className="col-span-2 rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Request ID</p><code className="mt-1 block break-all font-mono text-xs">{selectedLog.requestId}</code></div></div><section className="flex flex-col gap-2"><h3 className="text-sm font-semibold">Request and response metadata</h3><pre className="max-h-[50vh] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"><code>{JSON.stringify(detailJson, null, 2)}</code></pre><p className="text-xs text-muted-foreground">Authorization, tokens, and sensitive request fields are masked in this view.</p></section></div></> : null}</SheetContent></Sheet>
    </div>
  )
}
