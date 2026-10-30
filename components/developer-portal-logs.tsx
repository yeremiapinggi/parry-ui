"use client"

import { useEffect, useMemo, useState } from "react"
import { SearchIcon, SearchXIcon } from "lucide-react"

import { createLogEntry, filterLogs, requestDetail, type LogEntry, type LogFilter, type PortalApp } from "@/lib/developer-portal-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PAGE_SIZE = 25
const LOG_COUNT = 200
const defaultFilter: LogFilter = { status: "all", method: "all", appId: "all", query: "" }

function StatusBadge({ status }: { status: number }) {
  const tone = status >= 500 ? "border-destructive/30 bg-destructive-soft text-destructive" : status >= 400 ? "border-warning/30 bg-warning-soft text-warning" : "border-success/30 bg-success-soft text-success"
  return <Badge variant="outline" className={`font-mono ${tone}`}>{status}</Badge>
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <pre className="max-h-48 overflow-auto rounded-lg border bg-muted p-3 font-mono text-xs leading-relaxed">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

export function LogsSection({ apps }: { apps: PortalApp[] }) {
  const [filter, setFilter] = useState<LogFilter>(defaultFilter)
  const [page, setPage] = useState(0)
  const [liveTail, setLiveTail] = useState(false)
  const [tailCount, setTailCount] = useState(0)
  const [selected, setSelected] = useState<LogEntry | null>(null)
  const logs = useMemo(
    () => Array.from({ length: tailCount + LOG_COUNT }, (_, offset) => createLogEntry(offset - tailCount, apps)).flatMap((log) => (log ? [log] : [])),
    [apps, tailCount],
  )
  const filtered = filterLogs(logs, filter)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const filtersActive = JSON.stringify(filter) !== JSON.stringify(defaultFilter)
  const appName = (id: string) => apps.find((app) => app.id === id)?.name ?? "Deleted app"
  const detail = selected ? requestDetail(selected, apps) : null

  // Simulated new requests; the interval stops when toggled off or when the section unmounts.
  useEffect(() => {
    if (!liveTail) return
    const timer = window.setInterval(() => setTailCount((count) => count + 1), 2500)
    return () => window.clearInterval(timer)
  }, [liveTail])

  function updateFilter(patch: Partial<LogFilter>) {
    setFilter((current) => ({ ...current, ...patch }))
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Logs</h2>
          <p className="text-sm text-muted-foreground">Every API request your apps made, newest first. Select a request to inspect it.</p>
        </div>
        <Label className="flex items-center gap-2 font-normal">
          <Switch checked={liveTail} onCheckedChange={setLiveTail} />
          Live tail
          {liveTail && <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-success" />}
        </Label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search by path or request ID" placeholder="Search path or request ID" className="pl-8" value={filter.query} onChange={(event) => updateFilter({ query: event.target.value })} />
        </div>
        <Select value={filter.status} onValueChange={(status) => updateFilter({ status: status as LogFilter["status"] })}>
          <SelectTrigger aria-label="Status" className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="2xx">2xx success</SelectItem>
            <SelectItem value="4xx">4xx client</SelectItem>
            <SelectItem value="5xx">5xx server</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.method} onValueChange={(method) => updateFilter({ method: method as LogFilter["method"] })}>
          <SelectTrigger aria-label="Method" className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {(["GET", "POST", "PATCH"] as const).map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filter.appId} onValueChange={(appId) => updateFilter({ appId })}>
          <SelectTrigger aria-label="App" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All apps</SelectItem>
            {apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
          <SearchXIcon className="size-5 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">{filtersActive ? "No requests match these filters" : "No requests yet"}</h3>
            <p className="max-w-sm text-sm text-muted-foreground">{filtersActive ? "Try a different search or clear the filters." : "Requests appear here once an app calls the API."}</p>
          </div>
          {filtersActive && <Button variant="outline" onClick={() => updateFilter(defaultFilter)}>Clear filters</Button>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Time (UTC)</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Credential</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((log) => (
                  <TableRow key={log.requestId} className="cursor-pointer" onClick={() => setSelected(log)}>
                    <TableCell className="pl-4 font-mono text-xs whitespace-nowrap">{log.at}</TableCell>
                    <TableCell>
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelected(log) }} className="flex items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                        <Badge variant="outline" className="w-14 justify-center font-mono text-[10px]">{log.method}</Badge>
                        <code className="font-mono text-xs text-link">{log.path}</code>
                      </button>
                    </TableCell>
                    <TableCell><StatusBadge status={log.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{log.latencyMs} ms</TableCell>
                    <TableCell className="whitespace-nowrap">{appName(log.appId)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{log.credential}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span aria-live="polite">Showing {currentPage * PAGE_SIZE + 1}–{currentPage * PAGE_SIZE + rows.length} of {filtered.length}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent data-parry-theme className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
          {selected && detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2 font-mono text-base"><Badge variant="outline" className="font-mono">{selected.method}</Badge>{selected.path}</DialogTitle>
                <DialogDescription className="font-mono text-xs">{selected.requestId}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Status", <StatusBadge key="status" status={selected.status} />],
                  ["Latency", `${selected.latencyMs} ms`],
                  ["App", appName(selected.appId)],
                  ["Time (UTC)", selected.at],
                ].map(([label, value]) => <div key={String(label)} className="flex flex-col gap-1"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}
              </dl>
              <JsonBlock label="Request headers" value={detail.headers} />
              {detail.query && <JsonBlock label="Query" value={detail.query} />}
              {detail.body && <JsonBlock label="Request body" value={detail.body} />}
              <JsonBlock label="Response body" value={detail.response} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
