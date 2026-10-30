"use client"

import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react"
import { toast } from "sonner"
import { ArrowLeftIcon, PlusIcon, SendIcon, WebhookIcon } from "lucide-react"

import { PRODUCTS, WEBHOOK_EVENTS, eventsForScopes, randomToken, simulateDelivery, validateWebhookDraft, type PortalApp, type Webhook, type WebhookDelivery, type WebhookDraft, type WebhookDraftErrors } from "@/lib/developer-portal-data"
import { ConfirmDialog, SecretRevealDialog, type Confirmation, type RevealedSecret } from "@/components/developer-portal-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function DeliveryStatus({ delivery }: { delivery?: WebhookDelivery }) {
  if (!delivery) return <span className="text-sm text-muted-foreground">No deliveries</span>
  const ok = delivery.status < 300
  return <Badge variant="outline" className={ok ? "border-success/30 bg-success-soft text-success" : "border-destructive/30 bg-destructive-soft text-destructive"}>{delivery.status} {ok ? "OK" : "Failed"}</Badge>
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ")
}

export function WebhooksSection({ webhooks, setWebhooks, apps, onDirtyChange }: { webhooks: Webhook[]; setWebhooks: Dispatch<SetStateAction<Webhook[]>>; apps: PortalApp[]; onDirtyChange?: (dirty: boolean) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<{ editingId: string | null; draft: WebhookDraft; initial: WebhookDraft } | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [errors, setErrors] = useState<WebhookDraftErrors>({})
  const [secret, setSecret] = useState<RevealedSecret | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const selected = webhooks.find((webhook) => webhook.id === selectedId)
  const appName = (id: string) => apps.find((app) => app.id === id)?.name ?? "Unknown app"
  const dirty = Boolean(editorOpen && editor && JSON.stringify(editor.draft) !== JSON.stringify(editor.initial))
  const editorApp = apps.find((app) => app.id === editor?.draft.appId)
  const allowedEvents = editorApp ? eventsForScopes(editorApp.scopes) : []

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange])

  function update(id: string, change: (webhook: Webhook) => Webhook) {
    setWebhooks((current) => current.map((webhook) => (webhook.id === id ? change(webhook) : webhook)))
  }

  function openEditor(webhook?: Webhook) {
    const draft: WebhookDraft = webhook ? { url: webhook.url, appId: webhook.appId, events: webhook.events } : { url: "", appId: apps[0]?.id ?? "", events: [] }
    setErrors({})
    setEditor({ editingId: webhook?.id ?? null, draft, initial: draft })
    setEditorOpen(true)
  }

  function updateDraft(patch: Partial<WebhookDraft>) {
    setEditor((current) => current && { ...current, draft: { ...current.draft, ...patch } })
    setErrors((current) => ({ ...current, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!editor) return
    const nextErrors = validateWebhookDraft(editor.draft, apps)
    setErrors(nextErrors)
    if (nextErrors.url) return urlRef.current?.focus()
    if (nextErrors.appId) return document.getElementById("webhook-app")?.focus()
    if (nextErrors.events) return document.getElementById("webhook-events")?.focus()

    const draft = { ...editor.draft, url: editor.draft.url.trim() }
    if (editor.editingId) {
      update(editor.editingId, (webhook) => ({ ...webhook, ...draft }))
      toast.success("Endpoint updated")
    } else {
      const signingSecret = `whsec_${randomToken(32)}`
      const webhook: Webhook = { ...draft, id: `wh-${randomToken(8)}`, enabled: true, secretLast4: signingSecret.slice(-4), deliveries: [] }
      setWebhooks((current) => [...current, webhook])
      setSecret({ title: "Endpoint added", description: "Verify the X-Ivosights-Signature header on every delivery with this signing secret.", items: [{ label: "Signing secret", value: signingSecret, secret: true }] })
    }
    setEditorOpen(false)
  }

  function sendTest(webhook: Webhook) {
    const event = webhook.events[0]
    const result = simulateDelivery(webhook.url, webhook.deliveries.length + 1)
    update(webhook.id, (current) => ({ ...current, deliveries: [{ id: `d-${randomToken(6)}`, at: nowStamp(), event, ...result }, ...current.deliveries] }))
    if (result.status < 300) toast.success("Test event delivered", { description: `${event} returned ${result.status}.` })
    else toast.error("Test event failed", { description: `The endpoint returned ${result.status}. Check that it is reachable and returns 2xx.` })
  }

  function rotateSecret(webhook: Webhook) {
    setConfirmation({
      title: "Rotate signing secret?",
      description: "Deliveries are signed with the new secret immediately. Update your signature check first.",
      action: "Rotate secret",
      onConfirm: () => {
        const value = `whsec_${randomToken(32)}`
        update(webhook.id, (current) => ({ ...current, secretLast4: value.slice(-4) }))
        setSecret({ title: "New signing secret", description: "Use this secret to verify deliveries from now on.", items: [{ label: "Signing secret", value, secret: true }] })
      },
    })
  }

  function requestDelete(webhook: Webhook) {
    setConfirmation({
      title: "Delete endpoint?",
      description: `${webhook.url} stops receiving events immediately.`,
      action: "Delete endpoint",
      onConfirm: () => {
        setWebhooks((current) => current.filter((item) => item.id !== webhook.id))
        setSelectedId(null)
        toast.success("Endpoint deleted")
      },
    })
  }

  const enabledSwitch = (webhook: Webhook) => (
    <Switch
      checked={webhook.enabled}
      aria-label={`${webhook.enabled ? "Pause" : "Resume"} ${webhook.url}`}
      onCheckedChange={(enabled) => update(webhook.id, (current) => ({ ...current, enabled }))}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      {selected ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Button variant="ghost" size="sm" className="self-start" onClick={() => setSelectedId(null)}><ArrowLeftIcon data-icon="inline-start" />Webhooks</Button>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="truncate font-mono text-lg font-semibold">{selected.url}</h2>
                <span className="text-sm text-muted-foreground">Owned by {appName(selected.appId)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-2 font-normal">{enabledSwitch(selected)}{selected.enabled ? "Active" : "Paused"}</Label>
                <Button variant="outline" onClick={() => openEditor(selected)}>Edit</Button>
                <Button variant="outline" className="text-destructive" onClick={() => requestDelete(selected)}>Delete</Button>
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Subscribed events</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-1">{selected.events.map((event) => <Badge key={event} variant="outline" className="font-mono text-xs">{event}</Badge>)}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Signing secret</CardTitle><CardDescription>Sent as an HMAC-SHA256 signature in X-Ivosights-Signature.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <code className="font-mono text-sm" aria-label={`Secret ending in ${selected.secretLast4}`}>whsec_••••••••••••{selected.secretLast4}</code>
                <Button variant="outline" size="sm" onClick={() => rotateSecret(selected)}>Rotate secret</Button>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Recent deliveries</CardTitle>
                <CardDescription>{selected.enabled ? `Test events send ${selected.events[0]} with sample data.` : "Resume the endpoint to send test events."}</CardDescription>
              </div>
              <Button size="sm" variant="outline" disabled={!selected.enabled} onClick={() => sendTest(selected)}><SendIcon data-icon="inline-start" />Send test event</Button>
            </CardHeader>
            <CardContent>
              {selected.deliveries.length ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader><TableRow><TableHead className="pl-3">Time (UTC)</TableHead><TableHead>Event</TableHead><TableHead>Status</TableHead><TableHead className="text-right pr-3">Latency</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selected.deliveries.map((delivery) => (
                        <TableRow key={delivery.id}>
                          <TableCell className="pl-3 font-mono text-xs">{delivery.at}</TableCell>
                          <TableCell className="font-mono text-xs">{delivery.event}</TableCell>
                          <TableCell><DeliveryStatus delivery={delivery} /></TableCell>
                          <TableCell className="pr-3 text-right tabular-nums">{delivery.latencyMs} ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : <p className="text-sm text-muted-foreground">No deliveries yet.</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Webhooks</h2>
              <p className="text-sm text-muted-foreground">Receive real-time events from Ivosights products at your own endpoint.</p>
            </div>
            {webhooks.length > 0 && <Button disabled={!apps.length} onClick={() => openEditor()}><PlusIcon data-icon="inline-start" />Add endpoint</Button>}
          </div>
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary"><WebhookIcon className="size-5" /></span>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">No endpoints yet</h3>
                <p className="max-w-sm text-sm text-muted-foreground">{apps.length ? "Add an endpoint to receive events as they happen." : "Create an app first. Endpoints receive events for the products in its scopes."}</p>
              </div>
              <Button disabled={!apps.length} onClick={() => openEditor()}><PlusIcon data-icon="inline-start" />Add endpoint</Button>
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader><TableRow><TableHead className="pl-4">Endpoint</TableHead><TableHead>App</TableHead><TableHead>Events</TableHead><TableHead>Last delivery</TableHead><TableHead>Enabled</TableHead></TableRow></TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="max-w-72 pl-4">
                        <button type="button" onClick={() => setSelectedId(webhook.id)} className="block max-w-full truncate rounded-sm font-mono text-sm text-link hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{webhook.url}</button>
                      </TableCell>
                      <TableCell>{appName(webhook.appId)}</TableCell>
                      <TableCell>{webhook.events.length}</TableCell>
                      <TableCell>{webhook.enabled ? <DeliveryStatus delivery={webhook.deliveries[0]} /> : <Badge variant="secondary">Paused</Badge>}</TableCell>
                      <TableCell>{enabledSwitch(webhook)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent data-parry-theme className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{editor?.editingId ? "Edit endpoint" : "Add endpoint"}</DialogTitle>
            <DialogDescription>Events are limited to the products the owning app can read.</DialogDescription>
          </DialogHeader>
          {editor && (
            <form id="webhook-editor" noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook-url">Endpoint URL</Label>
                <Input ref={urlRef} id="webhook-url" placeholder="https://example.com/webhooks/ivosights" value={editor.draft.url} onChange={(event) => updateDraft({ url: event.target.value })} aria-invalid={Boolean(errors.url)} aria-describedby={errors.url ? "webhook-url-error" : undefined} />
                {errors.url && <p id="webhook-url-error" className="text-sm text-destructive">{errors.url}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook-app">App</Label>
                <Select value={editor.draft.appId} onValueChange={(appId) => {
                  const allowed = eventsForScopes(apps.find((app) => app.id === appId)?.scopes ?? [])
                  updateDraft({ appId, events: editor.draft.events.filter((event) => allowed.includes(event)) })
                }}>
                  <SelectTrigger id="webhook-app" className="w-full" aria-invalid={Boolean(errors.appId)}><SelectValue placeholder="Choose an app" /></SelectTrigger>
                  <SelectContent>{apps.map((app) => <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.appId && <p className="text-sm text-destructive">{errors.appId}</p>}
              </div>
              <fieldset id="webhook-events" tabIndex={-1} aria-describedby={errors.events ? "webhook-events-error" : undefined} className="flex flex-col gap-3 outline-none">
                <legend className="mb-2 text-sm font-medium">Events</legend>
                {PRODUCTS.filter(({ key }) => WEBHOOK_EVENTS[key].some((event) => allowedEvents.includes(event))).map(({ key, name }) => (
                  <div key={key} className="flex flex-col gap-2 rounded-lg border p-3">
                    <span className="text-xs font-medium text-muted-foreground">{name}</span>
                    {WEBHOOK_EVENTS[key].map((event) => (
                      <Label key={event} className="flex items-center gap-2 font-mono text-xs font-normal">
                        <Checkbox
                          checked={editor.draft.events.includes(event)}
                          onCheckedChange={(checked) => updateDraft({ events: checked === true ? [...editor.draft.events, event] : editor.draft.events.filter((item) => item !== event) })}
                        />
                        {event}
                      </Label>
                    ))}
                  </div>
                ))}
                {!allowedEvents.length && <p className="text-sm text-muted-foreground">This app has no scopes with events.</p>}
                {errors.events && <p id="webhook-events-error" className="text-sm text-destructive">{errors.events}</p>}
              </fieldset>
            </form>
          )}
          <DialogFooter className="mx-0 mb-0 px-6 py-4">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button type="submit" form="webhook-editor">{editor?.editingId ? "Save changes" : "Add endpoint"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SecretRevealDialog secret={secret} onClose={() => setSecret(null)} />
      <ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  )
}
