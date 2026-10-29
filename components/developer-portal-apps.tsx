"use client"

import { useMemo, useState, type FormEvent } from "react"
import { CheckIcon, ClipboardIcon, CodeXmlIcon, EllipsisIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, PlusIcon, RotateCwIcon, SearchIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { createDemoSecret, type AppEnvironment, type DeveloperApp, type WebhookEndpoint } from "@/lib/developer-portal-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const defaultForm = { name: "", environment: "Development" as AppEnvironment, redirectUris: "" }

function environmentBadge(environment: AppEnvironment) {
  return environment === "Production"
    ? "border-success/30 bg-success-soft text-success"
    : "border-info/30 bg-info-soft text-info"
}

function CredentialRow({ label, value, masked = false, onReveal, revealed, onCopy }: {
  label: string
  value: string
  masked?: boolean
  onReveal?: () => void
  revealed?: boolean
  onCopy: () => void
}) {
  const displayValue = masked && !revealed ? "•".repeat(Math.min(value.length, 30)) : value
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-2"><Label className="text-xs text-muted-foreground">{label}</Label><div className="flex items-center gap-1">{onReveal ? <Button type="button" variant="ghost" size="icon-sm" aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`} onClick={onReveal}>{revealed ? <EyeOffIcon /> : <EyeIcon />}</Button> : null}<Button type="button" variant="ghost" size="icon-sm" aria-label={`Copy ${label}`} onClick={onCopy}><ClipboardIcon /></Button></div></div>
      <code className="block break-all font-mono text-xs leading-relaxed">{displayValue}</code>
    </div>
  )
}

export function DeveloperPortalApps({
  apps,
  webhooks,
  selectedApp,
  onSelectedAppChange,
  onSave,
  onDelete,
  createRequested = false,
  onCreateRequestHandled,
}: {
  apps: DeveloperApp[]
  webhooks: WebhookEndpoint[]
  selectedApp: DeveloperApp | null
  onSelectedAppChange: (app: DeveloperApp | null) => void
  onSave: (app: DeveloperApp) => void
  onDelete: (app: DeveloperApp) => void
  createRequested?: boolean
  onCreateRequestHandled: () => void
}) {
  const [query, setQuery] = useState("")
  const [environment, setEnvironment] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(createRequested)
  const [editingApp, setEditingApp] = useState<DeveloperApp | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteTarget, setDeleteTarget] = useState<DeveloperApp | null>(null)
  const [secretVisible, setSecretVisible] = useState(false)
  const [regenerateOpen, setRegenerateOpen] = useState(false)

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return apps.filter((app) => {
      const matchesQuery = !normalized || [app.name, app.id, app.clientId].some((value) => value.toLocaleLowerCase().includes(normalized))
      const matchesEnvironment = environment === "all" || app.environment === environment
      return matchesQuery && matchesEnvironment
    })
  }, [apps, environment, query])

  function openCreate() {
    setEditingApp(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(app: DeveloperApp) {
    setEditingApp(app)
    setForm({ name: app.name, environment: app.environment, redirectUris: app.redirectUris.join("\n") })
    setDialogOpen(true)
  }

  function closeForm() {
    setDialogOpen(false)
    if (createRequested) onCreateRequestHandled()
  }

  function saveApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = form.name.trim()
    if (!normalizedName) return
    const redirectUris = form.redirectUris.split("\n").map((uri) => uri.trim()).filter(Boolean)
    if (editingApp) {
      onSave({ ...editingApp, name: normalizedName, environment: form.environment, redirectUris })
      toast.success("Application updated", { position: "bottom-right" })
    } else {
      const suffix = Math.random().toString(36).slice(2, 8)
      const app: DeveloperApp = {
        id: `app_${suffix}`,
        name: normalizedName,
        environment: form.environment,
        clientId: `demo_client_${suffix}`,
        clientSecret: createDemoSecret(),
        redirectUris,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      onSave(app)
      onSelectedAppChange(app)
      toast.success("Demo application created", { description: "Credentials are simulated and work only in this preview.", position: "bottom-right" })
    }
    closeForm()
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`, { position: "bottom-right" })
    } catch {
      toast.error("Clipboard access is unavailable", { description: "Select and copy the demo value manually.", position: "bottom-right" })
    }
  }

  function confirmRegeneration() {
    if (!selectedApp) return
    const updated = { ...selectedApp, clientSecret: createDemoSecret() }
    onSave(updated)
    onSelectedAppChange(updated)
    setSecretVisible(false)
    setRegenerateOpen(false)
    toast.success("Demo secret regenerated", { description: "The previous demo secret is no longer shown in this preview.", position: "bottom-right" })
  }

  const selectedWebhookRows = selectedApp ? webhooks.filter((webhook) => webhook.appId === selectedApp.id) : []

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-info">Workspace</p><h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">Applications</h1><p className="text-sm leading-relaxed text-muted-foreground">Manage app environments, redirect URIs, and demo credentials.</p></div>
        <Button onClick={openCreate}><PlusIcon data-icon="inline-start" />Create app</Button>
      </header>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><CardTitle className="text-base">Application directory</CardTitle><CardDescription className="mt-1">{filteredApps.length} of {apps.length} applications</CardDescription></div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-0 flex-1 sm:w-64"><SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps or IDs" aria-label="Search applications" className="pl-9" /></div>
            <Select value={environment} onValueChange={setEnvironment}><SelectTrigger className="w-full sm:w-40" aria-label="Filter by environment"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All environments</SelectItem><SelectItem value="Development">Development</SelectItem><SelectItem value="Production">Production</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApps.length ? <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Application</TableHead><TableHead>Environment</TableHead><TableHead>App ID</TableHead><TableHead>Credentials</TableHead><TableHead className="w-12"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{filteredApps.map((app) => <TableRow key={app.id}>
            <TableCell><button type="button" className="flex min-w-40 flex-col items-start gap-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" onClick={() => { setSecretVisible(false); onSelectedAppChange(app) }}><span className="font-medium text-foreground">{app.name}</span><span className="text-xs text-muted-foreground">Created {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${app.createdAt}T12:00:00Z`))}</span></button></TableCell>
            <TableCell><Badge variant="outline" className={environmentBadge(app.environment)}>{app.environment}</Badge></TableCell>
            <TableCell><code className="font-mono text-xs text-muted-foreground">{app.id}</code></TableCell>
            <TableCell><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><KeyRoundIcon className="size-3.5" />Client ID + secret</span></TableCell>
            <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${app.name}`}><EllipsisIcon /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => { setSecretVisible(false); onSelectedAppChange(app) }}><CodeXmlIcon />View details</DropdownMenuItem><DropdownMenuItem onSelect={() => openEdit(app)}>Edit application</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleteTarget(app)}><Trash2Icon />Delete application</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
          </TableRow>)}</TableBody></Table></div> : <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-10 text-center"><span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground"><SearchIcon className="size-5" /></span><div className="flex max-w-sm flex-col gap-1"><p className="text-sm font-medium">{apps.length ? "No applications match your search" : "No applications yet"}</p><p className="text-sm leading-relaxed text-muted-foreground">{apps.length ? "Try another search term or clear the environment filter." : "Create an application to generate demo credentials and configure redirect URIs."}</p></div><div className="flex flex-wrap justify-center gap-2">{apps.length ? <Button variant="outline" size="sm" onClick={() => { setQuery(""); setEnvironment("all") }}>Clear filters</Button> : null}<Button size="sm" onClick={openCreate}><PlusIcon data-icon="inline-start" />Create app</Button></div></div>}
        </CardContent>
      </Card>

      <Card className="gap-0 border-warning/30 bg-warning-soft/30 py-0"><CardContent className="flex items-start gap-3 px-4 py-3.5"><ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-warning" /><p className="text-xs leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">Demo credentials only.</span> These values are fictional, stored in local component state, and are not valid API keys. Do not use them in a real integration.</p></CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open && createRequested) onCreateRequestHandled() }}><DialogContent><form onSubmit={saveApp} className="flex flex-col gap-5"><DialogHeader><DialogTitle>{editingApp ? "Edit application" : "Create application"}</DialogTitle><DialogDescription>{editingApp ? "Update app metadata and callback URLs." : "Create a demo app with a generated client ID and secret."}</DialogDescription></DialogHeader>
        <div className="flex flex-col gap-2"><Label htmlFor="developer-app-name">Application name <span className="text-destructive">*</span></Label><Input id="developer-app-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Customer Portal" required autoFocus /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="developer-app-environment">Environment</Label><Select value={form.environment} onValueChange={(value) => setForm((current) => ({ ...current, environment: value as AppEnvironment }))}><SelectTrigger id="developer-app-environment"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Development">Development</SelectItem><SelectItem value="Production">Production</SelectItem></SelectContent></Select></div>
        <div className="flex flex-col gap-2"><Label htmlFor="developer-app-redirects">Redirect URIs</Label><Textarea id="developer-app-redirects" value={form.redirectUris} onChange={(event) => setForm((current) => ({ ...current, redirectUris: event.target.value }))} placeholder="https://example.test/callback" rows={3} /><p className="text-xs text-muted-foreground">One URI per line. Leave blank if your app does not use redirects.</p></div>
        <DialogFooter><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={!form.name.trim()}>{editingApp ? "Save changes" : "Create app"}</Button></DialogFooter>
      </form></DialogContent></Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}><DialogContent><DialogHeader><DialogTitle>Delete {deleteTarget?.name}?</DialogTitle><DialogDescription>This removes the application and its demo credentials from this preview. Existing request logs remain available.</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button type="button" variant="destructive" onClick={() => { if (deleteTarget) { onDelete(deleteTarget); if (selectedApp?.id === deleteTarget.id) onSelectedAppChange(null); toast.success("Application deleted", { position: "bottom-right" }) } setDeleteTarget(null) }}>Delete application</Button></DialogFooter></DialogContent></Dialog>

      <Sheet open={Boolean(selectedApp)} onOpenChange={(open) => { if (!open) { onSelectedAppChange(null); setSecretVisible(false) } }}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {selectedApp ? <><SheetHeader className="border-b pb-4"><div className="flex flex-wrap items-center gap-2"><SheetTitle>{selectedApp.name}</SheetTitle><Badge variant="outline" className={environmentBadge(selectedApp.environment)}>{selectedApp.environment}</Badge></div><SheetDescription>Application details and demo-only API credentials.</SheetDescription></SheetHeader>
          <div className="flex flex-col gap-5 px-5 pb-6">
            <section className="flex flex-col gap-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Application</h3><Button variant="outline" size="sm" onClick={() => openEdit(selectedApp)}>Edit</Button></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">App ID</p><code className="mt-1 block break-all font-mono text-xs">{selectedApp.id}</code></div><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Created</p><p className="mt-1 text-sm">{selectedApp.createdAt}</p></div></div></section>
            <section className="flex flex-col gap-3"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">API credentials</h3><p className="mt-1 text-xs text-muted-foreground">Fictional values for preview interactions only.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setRegenerateOpen(true)}><RotateCwIcon data-icon="inline-start" />Regenerate</Button></div><CredentialRow label="Client ID" value={selectedApp.clientId} onCopy={() => void copyValue(selectedApp.clientId, "Client ID")} /><CredentialRow label="Client secret · demo only" value={selectedApp.clientSecret} masked revealed={secretVisible} onReveal={() => setSecretVisible((visible) => !visible)} onCopy={() => void copyValue(selectedApp.clientSecret, "Client secret")} /><p className="rounded-md bg-warning-soft px-3 py-2 text-xs leading-relaxed text-warning">Never use these generated demo values as real credentials.</p></section>
            <section className="flex flex-col gap-3"><div className="flex items-center gap-2"><CodeXmlIcon className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Redirect URIs</h3></div>{selectedApp.redirectUris.length ? <div className="flex flex-col gap-2">{selectedApp.redirectUris.map((uri) => <CredentialRow key={uri} label="Callback URL" value={uri} onCopy={() => void copyValue(uri, "Redirect URI")} />)}</div> : <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">No redirect URIs configured.</p>}</section>
            <section className="flex flex-col gap-3"><div className="flex items-center gap-2"><CheckIcon className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Webhook configuration</h3></div>{selectedWebhookRows.length ? selectedWebhookRows.map((webhook) => <div key={webhook.id} className="flex flex-col gap-2 rounded-lg border bg-background p-3"><div className="flex items-center justify-between gap-2"><Badge variant={webhook.enabled ? "default" : "secondary"}>{webhook.enabled ? "Enabled" : "Disabled"}</Badge><code className="font-mono text-[11px] text-muted-foreground">{webhook.id}</code></div><p className="break-all text-xs">{webhook.url}</p><p className="text-xs leading-relaxed text-muted-foreground">{webhook.events.join(" · ")}</p></div>) : <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">No webhook endpoints are associated with this app.</p>}</section>
          </div></> : null}
      </SheetContent></Sheet>

      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}><DialogContent><DialogHeader><DialogTitle>Regenerate demo secret?</DialogTitle><DialogDescription>The current secret for {selectedApp?.name} will be replaced. This action only changes local preview state.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setRegenerateOpen(false)}>Cancel</Button><Button onClick={confirmRegeneration}>Regenerate secret</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
