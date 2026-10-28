"use client"

import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react"
import { toast } from "sonner"
import { AppWindowIcon, EllipsisIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"

import { PORTAL_END_DATE, randomToken, trimKeys, validateAppDraft, type AppDraft, type AppDraftErrors, type PortalApp } from "@/lib/developer-portal-data"
import { AppDetail } from "@/components/developer-portal-app-detail"
import { ConfirmDialog, ScopeBadges, ScopeMatrix, SecretRevealDialog, type Confirmation, type RevealedSecret } from "@/components/developer-portal-shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

export type AppsIntent = { create: true } | { appId: string } | null

const emptyDraft: AppDraft = { name: "", description: "", environment: "Development", authMethod: "oauth", scopes: [] }
const authLabel = { oauth: "OAuth 2.0", "api-key": "API key" } as const

export function AppsSection({ apps, setApps, intent, onDirtyChange }: { apps: PortalApp[]; setApps: Dispatch<SetStateAction<PortalApp[]>>; intent: AppsIntent; onDirtyChange?: (dirty: boolean) => void }) {
  const [editor, setEditor] = useState<{ editingId: string | null; draft: AppDraft; initial: AppDraft } | null>(() => (intent && "create" in intent ? { editingId: null, draft: emptyDraft, initial: emptyDraft } : null))
  const [editorOpen, setEditorOpen] = useState(Boolean(intent && "create" in intent))
  const [selectedId, setSelectedId] = useState<string | null>(intent && "appId" in intent ? intent.appId : null)
  const [detailDirty, setDetailDirty] = useState(false)
  const [errors, setErrors] = useState<AppDraftErrors>({})
  const [secret, setSecret] = useState<RevealedSecret | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const dirty = Boolean(editorOpen && editor && JSON.stringify(editor.draft) !== JSON.stringify(editor.initial))

  const selectedApp = apps.find((app) => app.id === selectedId)
  const editingApp = apps.find((app) => app.id === editor?.editingId)
  const editorTrim = editingApp && editor ? trimKeys(editingApp.keys, editor.draft.scopes) : null

  useEffect(() => {
    onDirtyChange?.(dirty || (Boolean(selectedApp) && detailDirty))
  }, [dirty, detailDirty, selectedApp, onDirtyChange])

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange])

  function openEditor(app?: PortalApp) {
    const draft: AppDraft = app ? { name: app.name, description: app.description, environment: app.environment, authMethod: app.authMethod, scopes: app.scopes } : emptyDraft
    setErrors({})
    setEditor({ editingId: app?.id ?? null, draft, initial: draft })
    setEditorOpen(true)
  }

  function updateDraft(patch: Partial<AppDraft>) {
    setEditor((current) => current && { ...current, draft: { ...current.draft, ...patch } })
    setErrors((current) => ({ ...current, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!editor) return
    const nextErrors = validateAppDraft(editor.draft, apps, editor.editingId)
    setErrors(nextErrors)
    if (nextErrors.name) return nameRef.current?.focus()
    if (nextErrors.scopes) return document.getElementById("app-scopes-cognivo-read")?.focus()

    const draft = { ...editor.draft, name: editor.draft.name.trim(), description: editor.draft.description.trim() }
    if (editor.editingId) {
      setApps((current) => current.map((app) => (app.id === editor.editingId ? { ...app, ...draft, keys: trimKeys(app.keys, draft.scopes).keys } : app)))
      toast.success(`${draft.name} updated`)
    } else {
      const clientSecret = `ivs_${randomToken(32)}`
      const app: PortalApp = {
        ...draft,
        id: String(10_000_000 + Math.floor(Math.random() * 89_999_999)),
        createdAt: PORTAL_END_DATE,
        clientId: `ivc_${randomToken(12).toLowerCase()}`,
        secretLast4: clientSecret.slice(-4),
        redirectUris: [],
        keys: [],
      }
      setApps((current) => [...current, app])
      if (app.authMethod === "oauth") {
        setSecret({
          title: `${app.name} created`,
          description: "Use these OAuth 2.0 client credentials to request access tokens.",
          items: [{ label: "Client ID", value: app.clientId }, { label: "Client secret", value: clientSecret, secret: true }],
        })
      } else {
        toast.success(`${app.name} created`, { description: "Create an API key from the app's Authentication tab." })
      }
    }
    setEditorOpen(false)
  }

  function requestDelete(app: PortalApp) {
    setConfirmation({
      title: `Delete ${app.name}?`,
      description: "Its client credentials and API keys stop working immediately. This cannot be undone in the preview.",
      action: "Delete app",
      onConfirm: () => {
        setApps((current) => current.filter((item) => item.id !== app.id))
        setSelectedId(null)
        toast.success(`${app.name} deleted`)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {!selectedApp && <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Apps</h2>
          <p className="text-sm text-muted-foreground">Each app has its own credentials and scopes for Ivosights products.</p>
        </div>
        {apps.length > 0 && <Button onClick={() => openEditor()}><PlusIcon data-icon="inline-start" />Create app</Button>}
      </div>}

      {selectedApp ? (
        <AppDetail
          key={selectedApp.id}
          app={selectedApp}
          onBack={() => setSelectedId(null)}
          onChange={(next) => setApps((current) => current.map((app) => (app.id === next.id ? next : app)))}
          onEdit={() => openEditor(selectedApp)}
          onDelete={() => requestDelete(selectedApp)}
          onDirtyChange={setDetailDirty}
        />
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-secondary"><AppWindowIcon className="size-5" /></span>
          <div className="flex flex-col gap-1">
            <h3 className="font-medium">No apps yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">Create an app to get OAuth credentials or API keys for the Ivosights API.</p>
          </div>
          <Button onClick={() => openEditor()}><PlusIcon data-icon="inline-start" />Create your first app</Button>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">App</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="pl-4">
                    <span className="flex flex-col">
                      <button type="button" onClick={() => setSelectedId(app.id)} className="self-start rounded-sm font-medium text-link hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{app.name}</button>
                      <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={app.environment === "Production" ? "default" : "secondary"}>{app.environment}</Badge></TableCell>
                  <TableCell>{authLabel[app.authMethod]}</TableCell>
                  <TableCell><ScopeBadges scopes={app.scopes} /></TableCell>
                  <TableCell className="text-muted-foreground">{app.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${app.name}`}><EllipsisIcon /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedId(app.id)}>Open</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openEditor(app)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => requestDelete(app)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent data-parry-theme className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{editor?.editingId ? "Edit app" : "Create app"}</DialogTitle>
            <DialogDescription>Choose how the app authenticates and which Ivosights products it can access.</DialogDescription>
          </DialogHeader>
          {editor && (
            <form id="app-editor" noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-name">Name</Label>
                <Input ref={nameRef} id="app-name" value={editor.draft.name} onChange={(event) => updateDraft({ name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "app-name-error" : undefined} />
                {errors.name && <p id="app-name-error" className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Textarea id="app-description" rows={2} value={editor.draft.description} onChange={(event) => updateDraft({ description: event.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="app-environment">Environment</Label>
                <Select value={editor.draft.environment} onValueChange={(value) => updateDraft({ environment: value as AppDraft["environment"] })}>
                  <SelectTrigger id="app-environment" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Authentication</legend>
                <RadioGroup value={editor.draft.authMethod} onValueChange={(value) => updateDraft({ authMethod: value as AppDraft["authMethod"] })} className="grid gap-2 sm:grid-cols-2">
                  {([["oauth", "OAuth 2.0", "Client ID and secret for user-authorized or server-to-server tokens."], ["api-key", "API keys", "Static keys for server-side jobs, each with its own scopes."]] as const).map(([value, title, hint]) => (
                    <Label key={value} htmlFor={`auth-${value}`} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-ring">
                      <RadioGroupItem id={`auth-${value}`} value={value} className="mt-0.5" />
                      <span className="flex flex-col gap-1"><span className="font-medium">{title}</span><span className="text-xs text-muted-foreground">{hint}</span></span>
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>
              <ScopeMatrix id="app-scopes" value={editor.draft.scopes} onChange={(scopes) => updateDraft({ scopes })} error={errors.scopes} />
              {editorTrim && editorTrim.affected > 0 && (
                <Alert>
                  <TriangleAlertIcon />
                  <AlertDescription>Saving removes scopes from {editorTrim.affected} active API key{editorTrim.affected > 1 ? "s" : ""} that use the access you unchecked.</AlertDescription>
                </Alert>
              )}
            </form>
          )}
          <DialogFooter className="mx-0 mb-0 px-6 py-4">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button type="submit" form="app-editor">{editor?.editingId ? "Save changes" : "Create app"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SecretRevealDialog secret={secret} onClose={() => setSecret(null)} />
      <ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  )
}
