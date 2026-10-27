"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  Code2Icon,
  Globe2Icon,
  Link2Icon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UnplugIcon,
  WebhookIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ConnectionType = "REST API" | "Webhook" | "OAuth Application"
type AuthMethod = "None" | "API Key" | "Basic Auth" | "OAuth 2.0"
type ConnectionStatus = "Connected" | "Disconnected" | "Error"
type ConnectionFilter = "All" | ConnectionStatus
type CredentialKey = "apiKey" | "username" | "password" | "clientId" | "clientSecret" | "authorizationUrl" | "tokenUrl" | "scopes"
type Credentials = Partial<Record<CredentialKey, string>>

type Connection = {
  id: string
  name: string
  description: string
  type: ConnectionType
  endpoint: string
  authMethod: AuthMethod
  credentials: Credentials
  status: ConnectionStatus
  lastTestedAt?: string
}

type ConnectionDraft = Omit<Connection, "id" | "status" | "lastTestedAt" | "credentials"> & {
  credentials: Credentials
}
type FieldErrors = Record<string, string>
type TestFeedback = { status: "Connected" | "Error"; title: string; message: string; testedAt: string }
type Confirmation =
  | { kind: "discard" }
  | { kind: "delete" | "disconnect"; connectionId: string; connectionName: string }

const initialConnections: Connection[] = [
  {
    id: "northstar-crm",
    name: "Northstar CRM",
    description: "Customer and account records for the Northstar workspace.",
    type: "REST API",
    endpoint: "https://api.northstar.example/v1",
    authMethod: "API Key",
    credentials: { apiKey: "demo-northstar-key" },
    status: "Connected",
    lastTestedAt: "4 minutes ago",
  },
  {
    id: "meridian-events",
    name: "Meridian Events",
    description: "Receives notification events from internal workflows.",
    type: "Webhook",
    endpoint: "https://hooks.meridian.example/events",
    authMethod: "None",
    credentials: {},
    status: "Connected",
    lastTestedAt: "Today, 9:42 AM",
  },
  {
    id: "atlas-identity",
    name: "Atlas Identity",
    description: "OAuth application for identity and profile lookups.",
    type: "OAuth Application",
    endpoint: "https://identity.atlas.example/api",
    authMethod: "OAuth 2.0",
    credentials: {
      clientId: "atlas-demo-client",
      clientSecret: "demo-atlas-secret",
      authorizationUrl: "https://identity.atlas.example/authorize",
      tokenUrl: "https://identity.atlas.example/token",
      scopes: "profile email",
    },
    status: "Disconnected",
    lastTestedAt: "Yesterday, 4:18 PM",
  },
  {
    id: "redline-ledger",
    name: "Redline Ledger",
    description: "Sandbox ledger endpoint. Its fictional host is configured to fail the preview test.",
    type: "REST API",
    endpoint: "https://offline.redline.example/v2",
    authMethod: "Basic Auth",
    credentials: { username: "demo-user", password: "demo-password" },
    status: "Error",
    lastTestedAt: "Yesterday, 1:07 PM",
  },
]

const credentialDefinitions: Record<AuthMethod, { key: CredentialKey; label: string; type: "text" | "password" | "url"; required: boolean }[]> = {
  None: [],
  "API Key": [{ key: "apiKey", label: "API key", type: "password", required: true }],
  "Basic Auth": [
    { key: "username", label: "Username", type: "text", required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ],
  "OAuth 2.0": [
    { key: "clientId", label: "Client ID", type: "text", required: true },
    { key: "clientSecret", label: "Client secret", type: "password", required: true },
    { key: "authorizationUrl", label: "Authorization URL", type: "url", required: true },
    { key: "tokenUrl", label: "Token URL", type: "url", required: true },
    { key: "scopes", label: "Scopes", type: "text", required: false },
  ],
}

function createEmptyDraft(): ConnectionDraft {
  return {
    name: "",
    description: "",
    type: "REST API",
    endpoint: "",
    authMethod: "None",
    credentials: {},
  }
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

function getStatusClasses(status: ConnectionStatus) {
  if (status === "Connected") return "border-success/30 bg-success-soft text-success"
  if (status === "Error") return "border-destructive/30 bg-destructive-soft text-destructive"
  return "border-border bg-muted text-muted-foreground"
}

function StatusBadge({ status, testing = false }: { status: ConnectionStatus; testing?: boolean }) {
  if (testing) {
    return <Badge variant="outline" className="gap-1.5"><LoaderCircleIcon className="animate-spin" />Testing</Badge>
  }
  const Icon = status === "Connected" ? CheckCircle2Icon : status === "Error" ? AlertCircleIcon : UnplugIcon
  return <Badge variant="outline" className={`gap-1.5 ${getStatusClasses(status)}`}><Icon />{status}</Badge>
}

function TypeIcon({ type }: { type: ConnectionType }) {
  const Icon = type === "Webhook" ? WebhookIcon : type === "OAuth Application" ? ShieldCheckIcon : Globe2Icon
  return <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><Icon aria-hidden="true" className="size-5" /></span>
}

function validateDraft(draft: ConnectionDraft, connections: Connection[], editingId: string | null, effectiveCredentials: Credentials): FieldErrors {
  const errors: FieldErrors = {}
  const normalizedName = draft.name.trim().toLocaleLowerCase()
  if (!draft.name.trim()) errors.name = "Connection name is required."
  else if (connections.some((connection) => connection.id !== editingId && connection.name.trim().toLocaleLowerCase() === normalizedName)) {
    errors.name = "A connection with this name already exists."
  }
  if (!draft.endpoint.trim()) errors.endpoint = "Endpoint URL is required."
  else if (!isValidUrl(draft.endpoint.trim())) errors.endpoint = "Enter a valid HTTP or HTTPS URL."

  for (const field of credentialDefinitions[draft.authMethod]) {
    const value = effectiveCredentials[field.key]?.trim() ?? ""
    if (field.required && !value) errors[field.key] = `${field.label} is required.`
    if (field.required && field.type === "url" && value && !isValidUrl(value)) errors[field.key] = `Enter a valid URL for ${field.label.toLocaleLowerCase()}.`
  }
  return errors
}

function simulateTest(endpoint: string): TestFeedback {
  const testedAt = `Today, ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
  let shouldFail = false
  try {
    const parsed = new URL(endpoint)
    shouldFail = parsed.hostname.includes("offline") || parsed.hostname.includes("unreachable") || parsed.searchParams.get("simulate") === "fail"
  } catch {
    shouldFail = true
  }

  return shouldFail
    ? {
        status: "Error",
        title: "Simulated test failed",
        message: "The preview marked this endpoint as unavailable. Check the URL and try again; no request was sent.",
        testedAt,
      }
    : {
        status: "Connected",
        title: "Simulated test passed",
        message: "The preview accepted this configuration. This is a local simulation only; no external service was contacted.",
        testedAt,
      }
}

export function IntegrationConnectionPreview({ onDirtyChange }: { onDirtyChange?: (dirty: boolean) => void }) {
  const [connections, setConnections] = useState<Connection[]>(() => initialConnections.map((connection) => ({ ...connection, credentials: { ...connection.credentials } })))
  const [filter, setFilter] = useState<ConnectionFilter>("All")
  const [query, setQuery] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [draft, setDraft] = useState<ConnectionDraft>(createEmptyDraft)
  const [initialDraft, setInitialDraft] = useState<ConnectionDraft>(createEmptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [testFeedback, setTestFeedback] = useState<TestFeedback | null>(null)
  const [draftTesting, setDraftTesting] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [showSamples, setShowSamples] = useState(true)

  const hasUnsavedChanges = JSON.stringify(draft) !== JSON.stringify(initialDraft)
  const filteredConnections = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return connections.filter((connection) => {
      const matchesStatus = filter === "All" || connection.status === filter
      const matchesQuery = !normalizedQuery || connection.name.toLocaleLowerCase().includes(normalizedQuery)
      return matchesStatus && matchesQuery
    })
  }, [connections, filter, query])

  const previousConnection = editingId ? connections.find((connection) => connection.id === editingId) : undefined
  const canKeepSavedCredentials = previousConnection?.authMethod === draft.authMethod
  const effectiveCredentials = useMemo(() => {
    const result: Credentials = {}
    for (const field of credentialDefinitions[draft.authMethod]) {
      const enteredValue = draft.credentials[field.key]?.trim()
      const savedValue = canKeepSavedCredentials ? previousConnection?.credentials[field.key] : undefined
      if (enteredValue) result[field.key] = enteredValue
      else if (savedValue) result[field.key] = savedValue
    }
    return result
  }, [draft.authMethod, draft.credentials, canKeepSavedCredentials, previousConnection])
  const validationErrors = validateDraft(draft, connections, editingId, effectiveCredentials)
  const canSave = Object.keys(validationErrors).length === 0

  useEffect(() => {
    onDirtyChange?.(editorOpen && hasUnsavedChanges)
  }, [editorOpen, hasUnsavedChanges, onDirtyChange])

  function openCreate() {
    const nextDraft = createEmptyDraft()
    setEditingId(null)
    setDraft(nextDraft)
    setInitialDraft(nextDraft)
    setFieldErrors({})
    setTestFeedback(null)
    setEditorOpen(true)
  }

  function openEdit(connection: Connection) {
    const nextDraft: ConnectionDraft = {
      name: connection.name,
      description: connection.description,
      type: connection.type,
      endpoint: connection.endpoint,
      authMethod: connection.authMethod,
      credentials: {},
    }
    setEditingId(connection.id)
    setDraft(nextDraft)
    setInitialDraft(nextDraft)
    setFieldErrors({})
    setTestFeedback(null)
    setEditorOpen(true)
  }

  function handleEditorOpenChange(open: boolean) {
    if (open) {
      setEditorOpen(true)
      return
    }
    if (hasUnsavedChanges) {
      setConfirmation({ kind: "discard" })
      return
    }
    setEditorOpen(false)
  }

  function updateDraft(update: Partial<ConnectionDraft>) {
    setDraft((current) => ({
      ...current,
      ...update,
      credentials: update.credentials ? { ...current.credentials, ...update.credentials } : current.credentials,
    }))
    setFieldErrors({})
    setTestFeedback(null)
  }

  function setCredential(key: CredentialKey, value: string) {
    updateDraft({ credentials: { [key]: value } })
  }

  function changeAuthMethod(authMethod: AuthMethod) {
    setDraft((current) => ({ ...current, authMethod, credentials: {} }))
    setFieldErrors({})
    setTestFeedback(null)
  }

  function runValidation() {
    const errors = validateDraft(draft, connections, editingId, effectiveCredentials)
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function testDraftConnection() {
    if (draftTesting) return
    if (!runValidation()) {
      setTestFeedback({
        status: "Error",
        title: "Configuration needs attention",
        message: "Complete the required fields below before testing. Nothing has been sent.",
        testedAt: "",
      })
      return
    }

    setDraftTesting(true)
    setTestFeedback(null)
    await new Promise<void>((resolve) => window.setTimeout(resolve, 900))
    const result = simulateTest(draft.endpoint.trim())
    setTestFeedback(result)
    setDraftTesting(false)
  }

  function saveConnection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!runValidation() || draftTesting) return

    const nextConnection: Connection = {
      id: editingId ?? `connection-${Date.now()}`,
      name: draft.name.trim(),
      description: draft.description.trim(),
      type: draft.type,
      endpoint: draft.endpoint.trim(),
      authMethod: draft.authMethod,
      credentials: effectiveCredentials,
      status: testFeedback?.status ?? "Disconnected",
      lastTestedAt: testFeedback?.testedAt || undefined,
    }

    setConnections((current) => editingId
      ? current.map((connection) => connection.id === editingId ? nextConnection : connection)
      : [nextConnection, ...current])
    setEditorOpen(false)
    setConfirmation(null)
    setFieldErrors({})
    setTestFeedback(null)
    toast.success(editingId ? "Connection updated" : "Connection saved", {
      description: nextConnection.status === "Disconnected" ? "Saved as disconnected. Test it when you are ready." : "Saved in this local preview.",
      position: "bottom-right",
    })
  }

  async function testSavedConnection(connection: Connection) {
    if (testingId) return
    setTestingId(connection.id)
    await new Promise<void>((resolve) => window.setTimeout(resolve, 900))
    const result = simulateTest(connection.endpoint)
    setConnections((current) => current.map((item) => item.id === connection.id
      ? { ...item, status: result.status, lastTestedAt: result.testedAt }
      : item))
    setTestingId(null)
    if (result.status === "Connected") {
      toast.success("Simulated test passed", { description: "No external request was made.", position: "bottom-right" })
    } else {
      toast.error("Simulated test failed", { description: "Review the endpoint URL; no external request was made.", position: "bottom-right" })
    }
  }

  function restoreSamples() {
    setConnections(initialConnections.map((connection) => ({ ...connection, credentials: { ...connection.credentials } })))
    setShowSamples(true)
    setFilter("All")
    setQuery("")
    toast.success("Demo connections restored", { description: "Fictional sample data is back in the preview.", position: "bottom-right" })
  }

  function confirmAction() {
    if (!confirmation) return
    if (confirmation.kind === "discard") {
      setEditorOpen(false)
      setFieldErrors({})
      setTestFeedback(null)
      setConfirmation(null)
      return
    }
    if (confirmation.kind === "delete") {
      if (connections.length === 1) setShowSamples(false)
      setConnections((current) => current.filter((connection) => connection.id !== confirmation.connectionId))
      toast.success("Connection deleted", { description: "The demo connection was removed from this preview.", position: "bottom-right" })
    } else {
      setConnections((current) => current.map((connection) => connection.id === confirmation.connectionId
        ? { ...connection, status: "Disconnected" }
        : connection))
      toast.success("Connection disconnected", { description: "It can be tested or reconnected at any time.", position: "bottom-right" })
    }
    setConfirmation(null)
  }

  const confirmationTitle = confirmation?.kind === "discard"
    ? "Discard unsaved changes?"
    : confirmation?.kind === "delete"
      ? "Delete this connection?"
      : "Disconnect this connection?"
  const confirmationDescription = confirmation?.kind === "discard"
    ? "Your connection settings have not been saved. Keep editing or discard this draft."
    : confirmation?.kind === "delete"
      ? `“${confirmation.connectionName}” will be removed from this local preview.`
      : `“${confirmation?.kind === "disconnect" ? confirmation.connectionName : "this connection"}” will be marked disconnected. Its saved configuration stays in the preview.`

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-2 sm:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-data text-2xl font-semibold tracking-tight sm:text-3xl">Integrations</h1>
            <Badge variant="secondary">{connections.length} {connections.length === 1 ? "connection" : "connections"}</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Configure and monitor external service connection settings in one place.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />Add Connection
        </Button>
      </header>

      <Alert>
        <CircleHelpIcon aria-hidden="true" />
        <AlertTitle>Local simulation only</AlertTitle>
        <AlertDescription>Credentials stay in this browser preview. Tests are simulated and never contact an external service.</AlertDescription>
      </Alert>

      <section className="flex flex-col gap-4" aria-label="Integration connections">
        <div className="flex flex-col gap-3 border-b pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search connections by name"
                placeholder="Search connections..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(value) => { if (value) setFilter(value as ConnectionFilter) }}
              variant="outline"
              size="sm"
              aria-label="Filter connections by status"
              className="w-full justify-start overflow-x-auto lg:w-auto"
            >
              {(["All", "Connected", "Disconnected", "Error"] as const).map((status) => (
                <ToggleGroupItem key={status} value={status} className="flex-1 px-2.5 sm:flex-none">{status}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Showing {`${filteredConnections.length} of ${connections.length} ${connections.length === 1 ? "connection" : "connections"}`}
          </p>
        </div>

        {filteredConnections.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredConnections.map((connection) => (
              <Card key={connection.id} className="gap-0 py-0">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                  <TypeIcon type={connection.type} />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-data text-base font-semibold">{connection.name}</h2>
                          <StatusBadge status={connection.status} testing={testingId === connection.id} />
                        </div>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{connection.description || "No description provided."}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" size="icon-sm" aria-label={`Actions for ${connection.name}`} disabled={testingId === connection.id}>
                            <MoreHorizontalIcon aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => openEdit(connection)}><Code2Icon data-icon="inline-start" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => void testSavedConnection(connection)}><CheckCircle2Icon data-icon="inline-start" />Test Connection</DropdownMenuItem>
                            {connection.status !== "Connected" && (
                              <DropdownMenuItem onSelect={() => void testSavedConnection(connection)}><Link2Icon data-icon="inline-start" />Reconnect</DropdownMenuItem>
                            )}
                            {connection.status === "Connected" && (
                              <DropdownMenuItem onSelect={() => setConfirmation({ kind: "disconnect", connectionId: connection.id, connectionName: connection.name })}>
                                <UnplugIcon data-icon="inline-start" />Disconnect
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmation({ kind: "delete", connectionId: connection.id, connectionName: connection.name })}>
                            <Trash2Icon data-icon="inline-start" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Separator />
                    <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Connection type</span>
                        <span className="truncate">{connection.type}</span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Authentication</span>
                        <span className="truncate">{connection.authMethod}</span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Endpoint</span>
                        <span className="truncate font-mono text-xs" title={connection.endpoint}>{connection.endpoint}</span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Last tested</span>
                        <span className="truncate">{connection.lastTestedAt ?? "Not tested"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : connections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 px-5 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><Link2Icon aria-hidden="true" className="size-5" /></span>
              <div className="flex max-w-md flex-col gap-1.5">
                <h2 className="font-data text-lg font-semibold">No connections yet</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">Add a connection to configure an endpoint and authentication method. This preview uses fictional local data only.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={openCreate}><PlusIcon data-icon="inline-start" />Add Connection</Button>
                {!showSamples && <Button type="button" variant="outline" onClick={restoreSamples}>Restore demo connections</Button>}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <h2 className="font-data font-semibold">No matching connections</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">Try another name or clear the selected status filter.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => { setQuery(""); setFilter("All") }}>Clear search and filters</Button>
            </CardContent>
          </Card>
        )}
      </section>

      <Dialog open={editorOpen} onOpenChange={handleEditorOpenChange}>
        <DialogContent
          data-parry-theme
          className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[90dvh] sm:max-w-[42rem]"
        >
          <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
            <div className="flex items-center gap-2">
              <DialogTitle className="font-data text-lg font-semibold">{editingId ? "Edit connection" : "Add connection"}</DialogTitle>
              {hasUnsavedChanges && <Badge variant="outline" className="border-warning/30 bg-warning-soft text-warning">Unsaved</Badge>}
            </div>
            <DialogDescription>Configure a reusable endpoint and authentication profile. Changes stay in this local preview.</DialogDescription>
          </DialogHeader>

          <form onSubmit={saveConnection} className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="connection-name">Connection name <span className="text-destructive">*</span></Label>
                  <Input id="connection-name" value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "connection-name-error" : undefined} autoComplete="off" />
                  {fieldErrors.name && <p id="connection-name-error" className="text-sm text-destructive">{fieldErrors.name}</p>}
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="connection-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Textarea id="connection-description" value={draft.description} onChange={(event) => updateDraft({ description: event.target.value })} rows={2} placeholder="What is this connection used for?" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="connection-type">Connection type</Label>
                  <Select value={draft.type} onValueChange={(value) => updateDraft({ type: value as ConnectionType })}>
                    <SelectTrigger id="connection-type"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectGroup>
                      <SelectItem value="REST API">REST API</SelectItem>
                      <SelectItem value="Webhook">Webhook</SelectItem>
                      <SelectItem value="OAuth Application">OAuth Application</SelectItem>
                    </SelectGroup></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="connection-auth">Authentication method</Label>
                  <Select value={draft.authMethod} onValueChange={(value) => changeAuthMethod(value as AuthMethod)}>
                    <SelectTrigger id="connection-auth"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectGroup>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="API Key">API Key</SelectItem>
                      <SelectItem value="Basic Auth">Basic Auth</SelectItem>
                      <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
                    </SelectGroup></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="connection-endpoint">Endpoint URL <span className="text-destructive">*</span></Label>
                  <Input id="connection-endpoint" type="url" inputMode="url" placeholder="https://api.example.com/v1" value={draft.endpoint} onChange={(event) => updateDraft({ endpoint: event.target.value })} aria-invalid={Boolean(fieldErrors.endpoint)} aria-describedby={fieldErrors.endpoint ? "connection-endpoint-error" : "endpoint-help"} />
                  {fieldErrors.endpoint
                    ? <p id="connection-endpoint-error" className="text-sm text-destructive">{fieldErrors.endpoint}</p>
                    : <p id="endpoint-help" className="text-xs leading-relaxed text-muted-foreground">Use an HTTP or HTTPS URL. This demo never sends a request to it.</p>}
                </div>
              </div>

              {draft.authMethod !== "None" && (
                <section className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4" aria-labelledby="credentials-heading">
                  <div className="flex flex-col gap-1">
                    <h3 id="credentials-heading" className="text-sm font-semibold">{draft.authMethod} credentials</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">Sensitive values are masked. Leave a saved value blank to keep it unchanged.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {credentialDefinitions[draft.authMethod].map((field) => {
                      const savedValue = canKeepSavedCredentials ? previousConnection?.credentials[field.key] : undefined
                      const error = fieldErrors[field.key]
                      const inputId = `credential-${field.key}`
                      const errorId = `${inputId}-error`
                      return (
                        <div key={field.key} className={`flex flex-col gap-2 ${field.key === "scopes" ? "sm:col-span-2" : ""}`}>
                          <Label htmlFor={inputId}>{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                          <Input
                            id={inputId}
                            type={field.type}
                            value={draft.credentials[field.key] ?? ""}
                            placeholder={savedValue ? "••••••••••••  ·  Saved value" : field.key === "scopes" ? "profile email" : undefined}
                            onChange={(event) => setCredential(field.key, event.target.value)}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : savedValue ? `${inputId}-hint` : undefined}
                            autoComplete="off"
                          />
                          {error
                            ? <p id={errorId} className="text-sm text-destructive">{error}</p>
                            : savedValue && <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">Saved locally; leave blank to keep.</p>}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {testFeedback && (
                <Alert variant={testFeedback.status === "Error" ? "destructive" : "success"} role="status">
                  {testFeedback.status === "Connected" ? <CheckCircle2Icon aria-hidden="true" /> : <AlertCircleIcon aria-hidden="true" />}
                  <AlertTitle>{testFeedback.title}</AlertTitle>
                  <AlertDescription>{testFeedback.message}</AlertDescription>
                </Alert>
              )}
              {draftTesting && (
                <Alert role="status">
                  <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
                  <AlertTitle>Testing configuration</AlertTitle>
                  <AlertDescription>Running a local simulation. No network request is being made.</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t bg-card px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheckIcon aria-hidden="true" className="size-4 shrink-0" />Credentials remain in local React state only.
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => handleEditorOpenChange(false)} disabled={draftTesting}>Cancel</Button>
                <Button type="button" variant="secondary" onClick={() => void testDraftConnection()} disabled={draftTesting}>
                  {draftTesting ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <CheckCircle2Icon data-icon="inline-start" />}
                  Test Connection
                </Button>
                <Button type="submit" disabled={!canSave || draftTesting} title={!canSave ? "Complete the required fields to save." : undefined}>
                  {editingId ? "Save Connection" : "Save Connection"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmation !== null} onOpenChange={(open) => { if (!open) setConfirmation(null) }}>
        {confirmation && (
          <DialogContent data-parry-theme>
            <DialogHeader>
              <DialogTitle>{confirmationTitle}</DialogTitle>
              <DialogDescription>{confirmationDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col-reverse sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>Cancel</Button>
              <Button type="button" variant={confirmation.kind === "delete" || confirmation.kind === "discard" ? "destructive" : "default"} onClick={confirmAction}>
                {confirmation.kind === "discard" ? "Discard changes" : confirmation.kind === "delete" ? "Delete connection" : "Disconnect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
