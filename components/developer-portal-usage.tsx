"use client"

import { useState } from "react"
import { SearchXIcon } from "lucide-react"

import { PRODUCTS, getRateLimit, getUsage, type PortalApp, type UsageFilter, type UsageRange, type Webhook } from "@/lib/developer-portal-data"
import { UsageAreaChart } from "@/components/developer-portal-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const numberFormat = new Intl.NumberFormat("en-US")
const defaultFilter: UsageFilter = { range: 30, appId: "all", product: "all" }

export function UsageSection({ apps, webhooks }: { apps: PortalApp[]; webhooks: Webhook[] }) {
  const [filter, setFilter] = useState<UsageFilter>(defaultFilter)
  const { days, endpoints, summary } = getUsage(filter, apps)
  const deliveries = webhooks
    .filter((webhook) => filter.appId === "all" || webhook.appId === filter.appId)
    .flatMap((webhook) => webhook.deliveries)
    .filter((delivery) => filter.product === "all" || delivery.event.startsWith(`${filter.product}.`)).length
  const limitedApps = apps.filter((app) => filter.appId === "all" || app.id === filter.appId)
  const stats = [
    { label: "Requests", value: numberFormat.format(summary.requests) },
    { label: "Error rate", value: summary.requests ? `${(summary.errorRate * 100).toFixed(2)}%` : "—" },
    { label: "p95 latency", value: summary.requests ? `${summary.p95Ms} ms` : "—" },
    { label: "Webhook deliveries", value: numberFormat.format(deliveries) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Usage</h2>
        <p className="text-sm text-muted-foreground">API traffic, errors, and rate limits across your apps.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={String(filter.range)} onValueChange={(value) => value && setFilter({ ...filter, range: Number(value) as UsageRange })} aria-label="Date range">
          {[7, 30, 90].map((range) => <ToggleGroupItem key={range} value={String(range)}>{range} days</ToggleGroupItem>)}
        </ToggleGroup>
        <Select value={filter.appId} onValueChange={(appId) => setFilter({ ...filter, appId })}>
          <SelectTrigger size="sm" aria-label="App" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All apps</SelectItem>
            {apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filter.product} onValueChange={(product) => setFilter({ ...filter, product: product as UsageFilter["product"] })}>
          <SelectTrigger size="sm" aria-label="Product" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {PRODUCTS.map(({ key, name }) => <SelectItem key={key} value={key}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Card key={label} className="gap-1 py-4">
            <CardHeader className="px-5"><CardDescription>{label}</CardDescription></CardHeader>
            <CardContent className="px-5"><p className="font-data text-2xl font-semibold tabular-nums">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {summary.requests === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
          <SearchXIcon className="size-5 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">No requests for this filter</h3>
            <p className="max-w-sm text-sm text-muted-foreground">The selected app has no traffic for this product yet, or the product is outside its scopes.</p>
          </div>
          <Button variant="outline" onClick={() => setFilter(defaultFilter)}>Reset filters</Button>
        </div>
      ) : (
        <>
          <Card className="gap-3">
            <CardHeader><CardTitle className="text-base">Requests per day</CardTitle><CardDescription>Successful and failed requests, last {filter.range} days</CardDescription></CardHeader>
            <CardContent><UsageAreaChart days={days} summary={`${numberFormat.format(summary.requests)} requests and ${numberFormat.format(summary.errors)} errors in the last ${filter.range} days`} /></CardContent>
          </Card>
          <Card className="gap-3">
            <CardHeader><CardTitle className="text-base">Requests by endpoint</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader><TableRow><TableHead className="pl-3">Endpoint</TableHead><TableHead className="text-right">Requests</TableHead><TableHead className="text-right">Errors</TableHead><TableHead className="w-40 pr-3">Share</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint) => {
                      const share = endpoint.requests / summary.requests
                      return (
                        <TableRow key={`${endpoint.method} ${endpoint.path}`}>
                          <TableCell className="pl-3"><span className="flex items-center gap-2"><Badge variant="outline" className="w-14 justify-center font-mono text-[10px]">{endpoint.method}</Badge><code className="font-mono text-xs">{endpoint.path}</code></span></TableCell>
                          <TableCell className="text-right tabular-nums">{numberFormat.format(endpoint.requests)}</TableCell>
                          <TableCell className="text-right tabular-nums">{numberFormat.format(endpoint.errors)}</TableCell>
                          <TableCell className="pr-3">
                            <span className="flex items-center gap-2">
                              <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-chart-2" style={{ width: `${share * 100}%` }} /></span>
                              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{Math.round(share * 100)}%</span>
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="gap-3">
        <CardHeader><CardTitle className="text-base">Rate limits</CardTitle><CardDescription>Requests today against each app&apos;s daily quota. Production apps get 50,000, development apps 10,000.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {limitedApps.map((app) => {
            const { used, quota } = getRateLimit(app, apps)
            const ratio = used / quota
            return (
              <div key={app.id} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium">{app.name}{ratio >= 0.8 && <Badge variant="outline" className="border-warning/30 bg-warning-soft text-warning">Near limit</Badge>}</span>
                  <span className="tabular-nums text-muted-foreground">{numberFormat.format(used)} / {numberFormat.format(quota)}</span>
                </div>
                <div role="progressbar" aria-label={`${app.name} daily quota used`} aria-valuemin={0} aria-valuemax={quota} aria-valuenow={used} aria-valuetext={`${Math.round(ratio * 100)}% of daily quota`} className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={ratio >= 0.8 ? "h-full bg-warning" : "h-full bg-chart-2"} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
