"use client"

import { Fragment, useMemo, useState, type FormEvent } from "react"
import { CheckCircle2Icon, EllipsisIcon, Link2Icon, PlusIcon, SendIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { availableWebhookEvents, type DeveloperApp, type WebhookEndpoint } from "@/lib/developer-portal-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const formDefault = { appId: "", url: "", events: [] as string[] }

function deliveryBadge(status: WebhookEndpoint["lastDeliveryStatus"]) {
  if (status === "Success") return "border-success/30 bg-success-soft text-success"
  if (status === "Failed") return "border-destructive/30 bg-destructive-soft text-destructive"
  return "border-warning/30 bg-warning-soft text-warning"
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value))
}

export function DeveloperPortalWebhooks({
  apps,
  webhooks,
  onUpdate,
  onDelete,
  onTestDelivery,
}: {
  apps: DeveloperApp[]
  webhooks: WebhookEndpoint[]
  onUpdate: (webhook: WebhookEndpoint) => void
  onDelete: (webhook: WebhookEndpoint) => void
  onTestDelivery: (webhook: WebhookEndpoint, shouldFail: boolean) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null)
  const [form, setForm] = useState(formDefault)
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpoint | null>(null)
  const enabledCount = useMemo(() => webhooks.filter((webhook) => webhook.enabled).length, [webhooks])

  function openCreate() {
    setEditingWebhook(null)
    setForm({ ...formDefault, appId: apps[0]?.id ?? "" })
    setDialogOpen(true)
  }

  function openEdit(webhook: WebhookEndpoint) {
    setEditingWebhook(webhook)
    setForm({ appId: webhook.appId, url: webhook.url, events: [...webhook.events] })
    setDialogOpen(true)
  }

  function toggleEvent(eventName: string) {
    setForm((current) => ({ ...current, events: current.events.includes(eventName) ? current.events.filter((event) => event !== eventName) : [...current.events, eventName] }))
  }

  function saveWebhook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const url = form.url.trim()
    if (!form.appId || !url || form.events.length === 0) return
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") return
    } catch {
      return
    }
    if (editingWebhook) {
      onUpdate({ ...editingWebhook, appId: form.appId, url, events: form.events })
      toast.success("Webhook updated", { position: "bottom-right" })
    } else {
      const suffix = Math.random().toString(36).slice(2, 7)
      onUpdate({ id: `wh_${suffix}`, appId: form.appId, url, events: form.events, enabled: true, lastDeliveryAt: new Date().toISOString(), lastDeliveryStatus: "Pending" })
      toast.success("Webhook endpoint added", { position: "bottom-right" })
    }
    setDialogOpen(false)
  }

  function testDelivery(webhook: WebhookEndpoint, shouldFail: boolean) {
    onTestDelivery(webhook, shouldFail)
    toast[shouldFail ? "error" : "success"](shouldFail ? "Simulated delivery failed" : "Test delivery succeeded", {
      description: shouldFail ? "The endpoint returned HTTP 503. Review the response and retry." : "The endpoint returned HTTP 200 in 142 ms.",
      position: "bottom-right",
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-col gap-1.5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Integrations</p><h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Webhooks</h1><p className="text-sm leading-relaxed text-muted-foreground">Send event notifications to endpoints you control.</p></div><Button onClick={openCreate} disabled={!apps.length}><PlusIcon data-icon="inline-start" />Add endpoint</Button></header>

      <section aria-label="Webhook status" className="grid gap-3 sm:grid-cols-3"><Card className="gap-0 py-0"><CardContent className="flex items-center gap-3 px-4 py-4"><span className="grid size-9 place-items-center rounded-lg bg-info-soft text-info"><Link2Icon className="size-4" /></span><div><p className="text-xs text-muted-foreground">Total endpoints</p><p className="font-data text-xl font-semibold tabular-nums">{webhooks.length}</p></div></CardContent></Card><Card className="gap-0 py-0"><CardContent className="flex items-center gap-3 px-4 py-4"><span className="grid size-9 place-items-center rounded-lg bg-success-soft text-success"><CheckCircle2Icon className="size-4" /></span><div><p className="text-xs text-muted-foreground">Enabled</p><p className="font-data text-xl font-semibold tabular-nums">{enabledCount}</p></div></CardContent></Card><Card className="gap-0 py-0"><CardContent className="flex items-center gap-3 px-4 py-4"><span className="grid size-9 place-items-center rounded-lg bg-warning-soft text-warning"><SendIcon className="size-4" /></span><div><p className="text-xs text-muted-foreground">Delivery mode</p><p className="text-sm font-semibold">Simulated</p></div></CardContent></Card></section>

      <Card className="gap-0 py-0"><CardHeader className="px-4 py-4 sm:px-5"><CardTitle className="text-base">Endpoint directory</CardTitle><CardDescription>Configure event subscriptions and inspect recent delivery status.</CardDescription></CardHeader><CardContent className="p-0">{webhooks.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Endpoint</TableHead><TableHead>Application</TableHead><TableHead>Events</TableHead><TableHead>Last delivery</TableHead><TableHead>Status</TableHead><TableHead>Enabled</TableHead><TableHead className="w-12"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{webhooks.map((webhook) => {
        const appName = apps.find((app) => app.id === webhook.appId)?.name ?? "Deleted app"
        return <Fragment key={webhook.id}><TableRow>
          <TableCell className="min-w-56"><div className="flex flex-col gap-1"><span className="break-all font-mono text-xs font-medium">{webhook.url}</span><span className="font-mono text-[10px] text-muted-foreground">{webhook.id}</span></div></TableCell>
          <TableCell className="min-w-32 text-sm">{appName}</TableCell>
          <TableCell className="min-w-40"><div className="flex max-w-56 flex-wrap gap-1">{webhook.events.slice(0, 2).map((eventName) => <Badge key={eventName} variant="secondary" className="font-mono text-[10px]">{eventName}</Badge>)}{webhook.events.length > 2 ? <Badge variant="outline" className="text-[10px]">+{webhook.events.length - 2}</Badge> : null}</div></TableCell>
          <TableCell className="min-w-32"><div className="flex flex-col gap-1"><span className="text-xs">{formatTimestamp(webhook.lastDeliveryAt)}</span><Badge variant="outline" className={`w-fit ${deliveryBadge(webhook.lastDeliveryStatus)}`}>{webhook.lastDeliveryStatus}</Badge></div></TableCell>
          <TableCell><Badge variant={webhook.enabled ? "default" : "secondary"}>{webhook.enabled ? "Active" : "Disabled"}</Badge></TableCell>
          <TableCell><Switch checked={webhook.enabled} onCheckedChange={(enabled) => onUpdate({ ...webhook, enabled })} aria-label={`${webhook.enabled ? "Disable" : "Enable"} webhook ${webhook.id}`} /></TableCell>
          <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${webhook.url}`}><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => testDelivery(webhook, false)}><SendIcon />Simulate success</DropdownMenuItem><DropdownMenuItem onSelect={() => testDelivery(webhook, true)}><TriangleAlertIcon />Simulate failure</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => openEdit(webhook)}>Edit endpoint</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleteTarget(webhook)}><Trash2Icon />Delete endpoint</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
        </TableRow>{webhook.lastDeliveryStatus === "Failed" && webhook.lastDeliveryError ? <TableRow><TableCell colSpan={7} className="bg-destructive-soft/30 py-2 text-xs text-destructive"><span className="inline-flex items-center gap-2"><TriangleAlertIcon className="size-3.5" />{webhook.lastDeliveryError}</span></TableCell></TableRow> : null}</Fragment>
      })}</TableBody></Table></div> : <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-10 text-center"><span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><Link2Icon className="size-5" /></span><div className="flex max-w-sm flex-col gap-1"><p className="text-sm font-medium">No webhook endpoints</p><p className="text-sm leading-relaxed text-muted-foreground">Add an endpoint to subscribe an application to platform events.</p></div><Button size="sm" onClick={openCreate} disabled={!apps.length}><PlusIcon data-icon="inline-start" />Add endpoint</Button>{!apps.length ? <p className="text-xs text-muted-foreground">Create an application before adding webhook endpoints.</p> : null}</div>}</CardContent></Card>

      <Card className="gap-0 border-info/20 bg-info-soft/30 py-0"><CardContent className="flex items-start gap-3 px-4 py-3.5"><TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-info" /><p className="text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Local simulation.</span> Test deliveries do not contact these URLs. Choose a success or failure outcome to explore the delivery states.</p></CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><form onSubmit={saveWebhook} className="flex flex-col gap-5"><DialogHeader><DialogTitle>{editingWebhook ? "Edit webhook endpoint" : "Add webhook endpoint"}</DialogTitle><DialogDescription>Choose an application, endpoint URL, and event subscriptions.</DialogDescription></DialogHeader>
        <div className="flex flex-col gap-2"><Label htmlFor="webhook-app">Application <span className="text-destructive">*</span></Label><Select value={form.appId} onValueChange={(appId) => setForm((current) => ({ ...current, appId }))}><SelectTrigger id="webhook-app"><SelectValue placeholder="Select an application" /></SelectTrigger><SelectContent>{apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex flex-col gap-2"><Label htmlFor="webhook-url">Endpoint URL <span className="text-destructive">*</span></Label><Input id="webhook-url" type="url" value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://api.example.com/webhooks" required /><p className="text-xs text-muted-foreground">Use HTTPS, or localhost for a local development endpoint.</p></div>
        <fieldset className="flex flex-col gap-3"><legend className="text-sm font-medium">Subscribed events <span className="text-destructive">*</span></legend><div className="grid gap-2 sm:grid-cols-2">{availableWebhookEvents.map((eventName) => <label key={eventName} className="flex items-center gap-2 rounded-md border px-3 py-2.5 text-xs"><Checkbox checked={form.events.includes(eventName)} onCheckedChange={() => toggleEvent(eventName)} /><span className="font-mono">{eventName}</span></label>)}</div><p className="text-xs text-muted-foreground">Select at least one event.</p></fieldset>
        <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={!form.appId || !form.url.trim() || form.events.length === 0}>{editingWebhook ? "Save changes" : "Add endpoint"}</Button></DialogFooter>
      </form></DialogContent></Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}><DialogContent><DialogHeader><DialogTitle>Delete webhook endpoint?</DialogTitle><DialogDescription>Remove this endpoint and its event subscriptions from the local demo workspace.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" onClick={() => { if (deleteTarget) { onDelete(deleteTarget); toast.success("Webhook endpoint deleted", { position: "bottom-right" }) } setDeleteTarget(null) }}>Delete endpoint</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
