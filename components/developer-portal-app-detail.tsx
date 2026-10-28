"use client"

import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { ArrowLeftIcon, KeyRoundIcon, PlusIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { PORTAL_END_DATE, isScopeSubset, randomToken, trimKeys, validateRedirectUri, type ApiKey, type PortalApp, type Scope } from "@/lib/developer-portal-data"
import { ConfirmDialog, ScopeBadges, ScopeMatrix, SecretRevealDialog, type Confirmation, type RevealedSecret } from "@/components/developer-portal-shared"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type KeyDraft = { name: string; scopes: Scope[]; expiry: "30" | "90" | "never" }
const emptyKeyDraft: KeyDraft = { name: "", scopes: [], expiry: "90" }

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function AppDetail({ app, onBack, onChange, onEdit, onDelete, onDirtyChange }: { app: PortalApp; onBack: () => void; onChange: (app: PortalApp) => void; onEdit: () => void; onDelete: () => void; onDirtyChange: (dirty: boolean) => void }) {
  const [secret, setSecret] = useState<RevealedSecret | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [redirectDraft, setRedirectDraft] = useState("")
  const [redirectError, setRedirectError] = useState<string | null>(null)
  const [keyDraft, setKeyDraft] = useState<KeyDraft | null>(null)
  const [keyErrors, setKeyErrors] = useState<{ name?: string; scopes?: string }>({})
  // null means "not editing": the tab shows the saved scopes, including edits made in the app editor.
  const [editedScopes, setEditedScopes] = useState<Scope[] | null>(null)
  const [scopeError, setScopeError] = useState<string | null>(null)
  const scopeDraft = editedScopes ?? app.scopes
  const scopesChanged = JSON.stringify(scopeDraft) !== JSON.stringify(app.scopes)
  const trimPreview = trimKeys(app.keys, scopeDraft)
  const dirty = scopesChanged || Boolean(redirectDraft.trim()) || Boolean(keyDraft && JSON.stringify(keyDraft) !== JSON.stringify(emptyKeyDraft))

  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])

  function rotateSecret() {
    setConfirmation({
      title: "Rotate client secret?",
      description: "The current secret stops working immediately. Update every service that uses it.",
      action: "Rotate secret",
      onConfirm: () => {
        const value = `ivs_${randomToken(32)}`
        onChange({ ...app, secretLast4: value.slice(-4) })
        setSecret({ title: "New client secret", description: `Replace the old secret for ${app.name}.`, items: [{ label: "Client secret", value, secret: true }] })
      },
    })
  }

  function addRedirect(event: FormEvent) {
    event.preventDefault()
    const error = validateRedirectUri(redirectDraft, app.redirectUris)
    setRedirectError(error)
    if (error) return
    onChange({ ...app, redirectUris: [...app.redirectUris, new URL(redirectDraft.trim()).href] })
    setRedirectDraft("")
  }

  function createKey(event: FormEvent) {
    event.preventDefault()
    if (!keyDraft) return
    const errors = {
      name: keyDraft.name.trim() ? undefined : "Enter a key name.",
      scopes: !keyDraft.scopes.length ? "Select at least one scope." : !isScopeSubset(keyDraft.scopes, app.scopes) ? "Keys can only use the app's scopes." : undefined,
    }
    setKeyErrors(errors)
    if (errors.name || errors.scopes) return document.getElementById(errors.name ? "key-name" : "key-scopes-fieldset")?.focus()
    const value = `ivk_${app.environment === "Production" ? "live" : "test"}_${randomToken(32)}`
    const key: ApiKey = {
      id: `key-${randomToken(8)}`,
      name: keyDraft.name.trim(),
      last4: value.slice(-4),
      scopes: keyDraft.scopes,
      createdAt: PORTAL_END_DATE,
      lastUsed: null,
      expiresAt: keyDraft.expiry === "never" ? null : addDays(PORTAL_END_DATE, Number(keyDraft.expiry)),
      revoked: false,
    }
    onChange({ ...app, keys: [...app.keys, key] })
    setKeyDraft(null)
    setSecret({ title: "API key created", description: "Send it in the Authorization header as a Bearer token.", items: [{ label: "API key", value, secret: true }] })
  }

  function revokeKey(key: ApiKey) {
    setConfirmation({
      title: `Revoke ${key.name}?`,
      description: "Requests that use this key will be rejected. Revoked keys stay listed for audit.",
      action: "Revoke key",
      onConfirm: () => {
        onChange({ ...app, keys: app.keys.map((item) => (item.id === key.id ? { ...item, revoked: true } : item)) })
        toast.success(`${key.name} revoked`)
      },
    })
  }

  function saveScopes() {
    if (!scopeDraft.length) return setScopeError("Select at least one scope.")
    onChange({ ...app, scopes: scopeDraft, keys: trimPreview.keys })
    setEditedScopes(null)
    toast.success("Scopes saved", trimPreview.affected ? { description: `${trimPreview.affected} API key${trimPreview.affected > 1 ? "s were" : " was"} narrowed to match.` } : undefined)
  }

  const activeKeys = app.keys.filter((key) => !key.revoked).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="self-start" onClick={onBack}><ArrowLeftIcon data-icon="inline-start" />Apps</Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">{app.name}</h2>
              <Badge variant={app.environment === "Production" ? "default" : "secondary"}>{app.environment}</Badge>
            </div>
            <span className="font-mono text-xs text-muted-foreground">App ID {app.id}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>Edit</Button>
            <Button variant="outline" className="text-destructive" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="scopes">Scopes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {[
                  ["Description", app.description || "No description"],
                  ["Authentication", app.authMethod === "oauth" ? "OAuth 2.0" : `API keys (${activeKeys} active)`],
                  ["Created", app.createdAt],
                  ["Client ID", app.clientId],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1"><dt className="text-muted-foreground">{label}</dt><dd className={label === "Client ID" ? "font-mono" : undefined}>{value}</dd></div>
                ))}
                <div className="flex flex-col gap-1 sm:col-span-2"><dt className="text-muted-foreground">Scopes</dt><dd><ScopeBadges scopes={app.scopes} /></dd></div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="flex flex-col gap-4">
          {app.authMethod === "oauth" ? (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Client credentials</CardTitle><CardDescription>Exchange these for access tokens at the token endpoint.</CardDescription></CardHeader>
                <CardContent className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col gap-1"><span className="text-muted-foreground">Client ID</span><code className="font-mono">{app.clientId}</code></div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1"><span className="text-muted-foreground">Client secret</span><code className="font-mono" aria-label={`Secret ending in ${app.secretLast4}`}>ivs_••••••••••••{app.secretLast4}</code></div>
                    <Button variant="outline" size="sm" onClick={rotateSecret}>Rotate secret</Button>
                  </div>
                  <div className="flex flex-col gap-1.5"><span className="text-muted-foreground">Grant types</span><span className="flex flex-wrap gap-1">{["authorization_code", "refresh_token", "client_credentials"].map((grant) => <Badge key={grant} variant="outline" className="font-mono text-xs">{grant}</Badge>)}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Redirect URIs</CardTitle><CardDescription>Users return here after they authorize the app.</CardDescription></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {app.redirectUris.length ? (
                    <ul className="flex flex-col divide-y rounded-lg border">
                      {app.redirectUris.map((uri) => (
                        <li key={uri} className="flex items-center justify-between gap-2 px-3 py-2">
                          <code className="min-w-0 truncate font-mono text-sm">{uri}</code>
                          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${uri}`} onClick={() => onChange({ ...app, redirectUris: app.redirectUris.filter((item) => item !== uri) })}><XIcon /></Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No redirect URIs yet. Add one before using the authorization code flow.</p>}
                  <form noValidate onSubmit={addRedirect} className="flex flex-col gap-2">
                    <Label htmlFor="redirect-uri" className="sr-only">Redirect URI</Label>
                    <div className="flex gap-2">
                      <Input id="redirect-uri" placeholder="https://example.com/oauth/callback" value={redirectDraft} onChange={(event) => { setRedirectDraft(event.target.value); setRedirectError(null) }} aria-invalid={Boolean(redirectError)} aria-describedby={redirectError ? "redirect-uri-error" : undefined} />
                      <Button type="submit" variant="outline">Add</Button>
                    </div>
                    {redirectError && <p id="redirect-uri-error" className="text-sm text-destructive">{redirectError}</p>}
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1"><CardTitle className="text-base">API keys</CardTitle><CardDescription>Each key can use some or all of the app&apos;s scopes.</CardDescription></div>
                <Button size="sm" onClick={() => { setKeyErrors({}); setKeyDraft(emptyKeyDraft) }}><PlusIcon data-icon="inline-start" />Create key</Button>
              </CardHeader>
              <CardContent>
                {app.keys.length ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader><TableRow><TableHead className="pl-3">Name</TableHead><TableHead>Key</TableHead><TableHead>Scopes</TableHead><TableHead>Last used</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {app.keys.map((key) => (
                          <TableRow key={key.id} className={key.revoked ? "text-muted-foreground" : undefined}>
                            <TableCell className="pl-3 font-medium">{key.name}</TableCell>
                            <TableCell><code className="font-mono text-xs">ivk_••••{key.last4}</code></TableCell>
                            <TableCell><ScopeBadges scopes={key.scopes} /></TableCell>
                            <TableCell>{key.lastUsed ?? "Never"}</TableCell>
                            <TableCell>{key.expiresAt ?? "Never"}</TableCell>
                            <TableCell><Badge variant={key.revoked ? "outline" : "secondary"}>{key.revoked ? "Revoked" : "Active"}</Badge></TableCell>
                            <TableCell>{!key.revoked && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revokeKey(key)}>Revoke</Button>}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
                    <KeyRoundIcon className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No API keys yet. Create one to call the API from a server.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scopes">
          <Card>
            <CardHeader><CardTitle className="text-base">App scopes</CardTitle><CardDescription>The Ivosights products and access levels this app can use. Tokens and keys never exceed these.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ScopeMatrix id="scope-tab" value={scopeDraft} onChange={(scopes) => { setEditedScopes(scopes); setScopeError(null) }} error={scopeError ?? undefined} />
              {scopesChanged && trimPreview.affected > 0 && (
                <Alert>
                  <TriangleAlertIcon />
                  <AlertDescription>Saving removes scopes from {trimPreview.affected} active API key{trimPreview.affected > 1 ? "s" : ""} that use the access you unchecked.</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" disabled={!scopesChanged} onClick={() => { setEditedScopes(null); setScopeError(null) }}>Reset</Button>
                <Button disabled={!scopesChanged} onClick={saveScopes}>Save scopes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(keyDraft)} onOpenChange={(open) => !open && setKeyDraft(null)}>
        <DialogContent data-parry-theme className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Keys can only use scopes that {app.name} already has.</DialogDescription>
          </DialogHeader>
          {keyDraft && (
            <form id="key-editor" noValidate onSubmit={createKey} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="key-name">Name</Label>
                <Input id="key-name" placeholder="e.g. Nightly sync" value={keyDraft.name} onChange={(event) => { setKeyDraft({ ...keyDraft, name: event.target.value }); setKeyErrors((current) => ({ ...current, name: undefined })) }} aria-invalid={Boolean(keyErrors.name)} aria-describedby={keyErrors.name ? "key-name-error" : undefined} />
                {keyErrors.name && <p id="key-name-error" className="text-sm text-destructive">{keyErrors.name}</p>}
              </div>
              <div id="key-scopes-fieldset" tabIndex={-1} className="outline-none">
                <ScopeMatrix id="key-scopes" value={keyDraft.scopes} allowed={app.scopes} onChange={(scopes) => { setKeyDraft({ ...keyDraft, scopes }); setKeyErrors((current) => ({ ...current, scopes: undefined })) }} error={keyErrors.scopes} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="key-expiry">Expires</Label>
                <Select value={keyDraft.expiry} onValueChange={(value) => setKeyDraft({ ...keyDraft, expiry: value as KeyDraft["expiry"] })}>
                  <SelectTrigger id="key-expiry" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">In 30 days</SelectItem>
                    <SelectItem value="90">In 90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyDraft(null)}>Cancel</Button>
            <Button type="submit" form="key-editor">Create key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SecretRevealDialog secret={secret} onClose={() => setSecret(null)} />
      <ConfirmDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />
    </div>
  )
}
