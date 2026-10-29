"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  ActivityIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  Clock3Icon,
  CopyIcon,
  FileTextIcon,
  FolderKanbanIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Settings2Icon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export type TabbedDetailWorkspaceDemoState = "default" | "archived" | "validation-error" | "loading" | "empty-activity" | "not-found"
type WorkspaceStatus = "Active" | "Archived"
type ActivityType = "record" | "configuration" | "access"
type AccessRole = "Owner" | "Admin" | "Editor" | "Viewer"
type WorkspaceTab = "overview" | "configuration" | "activity" | "access"
type WorkspaceConfig = {
  workspaceCode: string
  visibility: "Private" | "Organization"
  region: string
  retentionDays: string
  notifications: boolean
}
type WorkspaceMember = { id: string; name: string; email: string; role: AccessRole }
type WorkspaceActivity = { id: string; type: ActivityType; actor: string; action: string; detail: string; time: string }
type WorkspaceRecord = {
  id: string
  name: string
  description: string
  status: WorkspaceStatus
  owner: string
  createdAt: string
  updatedAt: string
  config: WorkspaceConfig
  members: WorkspaceMember[]
  activities: WorkspaceActivity[]
  relatedIds: string[]
}
type EditDetails = { name: string; description: string; owner: string }
type Destination = { kind: "tab"; tab: WorkspaceTab } | { kind: "list" } | { kind: "record"; id: string }
type Confirmation = { title: string; description: string; confirmLabel: string; destructive?: boolean; action: () => void }

const initialConfig: WorkspaceConfig = {
  workspaceCode: "northstar-ops",
  visibility: "Organization",
  region: "US East",
  retentionDays: "365",
  notifications: true,
}

const membersSeed: WorkspaceMember[] = [
  { id: "jordan", name: "Jordan Lee", email: "jordan.lee@example.com", role: "Owner" },
  { id: "samira", name: "Samira Patel", email: "samira.patel@example.com", role: "Admin" },
  { id: "ben", name: "Ben Carter", email: "ben.carter@example.com", role: "Editor" },
]

const inviteOptions: WorkspaceMember[] = [
  { id: "noah", name: "Noah Kim", email: "noah.kim@example.com", role: "Viewer" },
  { id: "maya", name: "Maya Chen", email: "maya.chen@example.com", role: "Editor" },
]

function createActivity(id: string, type: ActivityType, action: string, detail: string, index: number): WorkspaceActivity {
  return { id: `${id}-activity-${index}`, type, actor: "Jordan Lee", action, detail, time: index === 1 ? "Today, 10:42 AM" : "Just now" }
}

function createRecord(record: Omit<WorkspaceRecord, "members" | "activities"> & { members?: WorkspaceMember[]; activities?: WorkspaceActivity[] }): WorkspaceRecord {
  return {
    ...record,
    members: record.members ?? membersSeed.map((member) => ({ ...member })),
    activities: record.activities ?? [
      createActivity(record.id, "record", "Workspace created", "Workspace details and ownership were set up.", 1),
      createActivity(record.id, "access", "Access reviewed", "Jordan Lee confirmed the current workspace members.", 2),
      createActivity(record.id, "configuration", "Configuration updated", "Visibility and retention settings were last reviewed.", 3),
    ],
  }
}

function initialRecords(demoState: TabbedDetailWorkspaceDemoState): WorkspaceRecord[] {
  const primaryConfig = { ...initialConfig, ...(demoState === "validation-error" ? { retentionDays: "0" } : {}) }
  const primary = createRecord({
    id: "northstar",
    name: "Northstar Operations",
    description: "A shared home for service delivery, escalation paths, and operational readiness.",
    status: demoState === "archived" ? "Archived" : "Active",
    owner: "Jordan Lee",
    createdAt: "Apr 12, 2024",
    updatedAt: "Today, 10:42 AM",
    config: primaryConfig,
    relatedIds: ["meridian"],
    activities: demoState === "empty-activity" ? [] : undefined,
  })
  const secondary = createRecord({
    id: "meridian",
    name: "Meridian Research",
    description: "A secure workspace for cross-functional research and customer insights.",
    status: "Active",
    owner: "Samira Patel",
    createdAt: "Feb 08, 2024",
    updatedAt: "Yesterday, 4:18 PM",
    config: { ...initialConfig, workspaceCode: "meridian-research", region: "EU West", visibility: "Private", retentionDays: "180", notifications: false },
    members: membersSeed.map((member) => ({ ...member, role: member.id === "jordan" ? "Admin" : member.role })),
    relatedIds: ["northstar"],
  })
  return [primary, secondary]
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function statusStyles(status: WorkspaceStatus) {
  return status === "Active"
    ? "border-success/30 bg-success-soft text-success"
    : "border-border bg-secondary text-secondary-foreground"
}

function detailDate() {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date("2025-03-12T12:00:00.000Z"))
}

function DetailValue({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-1"><dt className="text-sm font-medium text-muted-foreground">{label}</dt><dd className="break-words text-sm leading-relaxed">{children}</dd></div>
}

function LoadingPreview() {
  return (
    <div aria-label="Loading workspace" aria-busy="true" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 @2xl:p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Separator className="my-3" />
        <div className="grid gap-4 @2xl:grid-cols-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      </div>
      <p role="status" className="sr-only">Loading workspace details</p>
    </div>
  )
}

export function TabbedDetailWorkspace({
  demoState = "default",
  onDirtyChange,
}: {
  demoState?: TabbedDetailWorkspaceDemoState
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [records, setRecords] = useState(() => initialRecords(demoState))
  const [selectedId, setSelectedId] = useState("northstar")
  const [listOpen, setListOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(demoState === "validation-error" ? "configuration" : "overview")
  const [configDraft, setConfigDraft] = useState<WorkspaceConfig>(() => ({ ...initialRecords(demoState)[0].config }))
  const [configErrors, setConfigErrors] = useState<Record<string, string>>((): Record<string, string> => demoState === "validation-error" ? { retentionDays: "Enter a whole number from 1 to 3,650 days." } : {})
  const [activityFilter, setActivityFilter] = useState("all")
  const [editOpen, setEditOpen] = useState(false)
  const [detailsDraft, setDetailsDraft] = useState<EditDetails | null>(null)
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [actionsOpen, setActionsOpen] = useState(false)

  const selectedRecord = records.find((record) => record.id === selectedId) ?? null
  const configDirty = Boolean(selectedRecord && JSON.stringify(configDraft) !== JSON.stringify(selectedRecord.config))
  const detailsDirty = Boolean(selectedRecord && detailsDraft && JSON.stringify(detailsDraft) !== JSON.stringify({ name: selectedRecord.name, description: selectedRecord.description, owner: selectedRecord.owner }))
  const visibleActivities = selectedRecord?.activities.filter((item) => activityFilter === "all" || item.type === activityFilter) ?? []
  const invalidRetention = !Number.isInteger(Number(configDraft.retentionDays)) || Number(configDraft.retentionDays) < 1 || Number(configDraft.retentionDays) > 3650
  const invalidWorkspaceCode = !/^[a-z0-9-]{3,32}$/i.test(configDraft.workspaceCode.trim())

  useEffect(() => {
    onDirtyChange?.(configDirty || detailsDirty)
  }, [configDirty, detailsDirty, onDirtyChange])

  function updateRecord(id: string, update: (record: WorkspaceRecord) => WorkspaceRecord) {
    setRecords((current) => current.map((record) => record.id === id ? update(record) : record))
  }

  function requestNavigation(destination: Destination) {
    if (activeTab === "configuration" && configDirty) {
      setConfirmation({
        title: "Discard configuration changes?",
        description: "Your configuration edits have not been saved. Discard them and continue?",
        confirmLabel: "Discard changes",
        destructive: true,
        action: () => {
          if (selectedRecord) setConfigDraft({ ...selectedRecord.config })
          setConfigErrors({})
          if (destination.kind === "tab") setActiveTab(destination.tab)
          if (destination.kind === "list") setListOpen(true)
          if (destination.kind === "record") {
            const nextRecord = records.find((record) => record.id === destination.id)
            if (nextRecord) {
              setSelectedId(nextRecord.id)
              setConfigDraft({ ...nextRecord.config })
              setActiveTab("overview")
              setListOpen(false)
            }
          }
        },
      })
      return
    }
    if (destination.kind === "tab") setActiveTab(destination.tab)
    if (destination.kind === "list") setListOpen(true)
    if (destination.kind === "record") {
      const nextRecord = records.find((record) => record.id === destination.id)
      if (nextRecord) {
        setSelectedId(nextRecord.id)
        setConfigDraft({ ...nextRecord.config })
        setConfigErrors({})
        setActiveTab("overview")
        setListOpen(false)
      }
    }
  }

  function saveConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors: Record<string, string> = {}
    if (invalidWorkspaceCode) errors.workspaceCode = "Use 3–32 letters, numbers, or hyphens."
    if (invalidRetention) errors.retentionDays = "Enter a whole number from 1 to 3,650 days."
    setConfigErrors(errors)
    if (Object.keys(errors).length > 0 || !selectedRecord) return
    const eventItem = createActivity(selectedRecord.id, "configuration", "Configuration saved", "Workspace settings were updated.", selectedRecord.activities.length + 1)
    updateRecord(selectedRecord.id, (record) => ({ ...record, config: { ...configDraft }, updatedAt: "Just now", activities: [eventItem, ...record.activities] }))
    toast.success("Configuration saved.", { position: "bottom-right" })
  }

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRecord || !detailsDraft) return
    const errors: Record<string, string> = {}
    if (!detailsDraft.name.trim()) errors.name = "Enter a workspace name."
    if (!detailsDraft.description.trim()) errors.description = "Add a short workspace description."
    setDetailsErrors(errors)
    if (Object.keys(errors).length > 0) return
    const eventItem = createActivity(selectedRecord.id, "record", "Workspace details updated", "Name, description, or owner details changed.", selectedRecord.activities.length + 1)
    updateRecord(selectedRecord.id, (record) => ({ ...record, ...detailsDraft, name: detailsDraft.name.trim(), description: detailsDraft.description.trim(), updatedAt: "Just now", activities: [eventItem, ...record.activities] }))
    setEditOpen(false)
    setDetailsDraft(null)
    setDetailsErrors({})
    toast.success("Workspace details saved.", { position: "bottom-right" })
  }

  function duplicateRecord() {
    if (!selectedRecord) return
    let suffix = records.length + 1
    while (records.some((record) => record.id === `workspace-${suffix}`)) suffix += 1
    const id = `workspace-${suffix}`
    const duplicate = {
      ...selectedRecord,
      id,
      name: `${selectedRecord.name} copy`,
      status: "Active" as const,
      createdAt: detailDate(),
      updatedAt: "Just now",
      config: { ...selectedRecord.config, workspaceCode: `${selectedRecord.config.workspaceCode}-copy` },
      members: selectedRecord.members.map((member) => ({ ...member })),
      relatedIds: [selectedRecord.id],
      activities: [createActivity(id, "record", "Workspace duplicated", `Copied from ${selectedRecord.name}.`, 1)],
    }
    setRecords((current) => [...current, duplicate])
    setSelectedId(id)
    setConfigDraft({ ...duplicate.config })
    setActiveTab("overview")
    setListOpen(false)
    toast.success("Workspace duplicated.", { position: "bottom-right" })
  }

  function toggleArchive() {
    if (!selectedRecord) return
    const nextStatus = selectedRecord.status === "Archived" ? "Active" : "Archived"
    const eventItem = createActivity(selectedRecord.id, "record", nextStatus === "Archived" ? "Workspace archived" : "Workspace restored", `Status changed to ${nextStatus}.`, selectedRecord.activities.length + 1)
    updateRecord(selectedRecord.id, (record) => ({ ...record, status: nextStatus, updatedAt: "Just now", activities: [eventItem, ...record.activities] }))
    toast.success(nextStatus === "Archived" ? "Workspace archived." : "Workspace restored.", { position: "bottom-right" })
  }

  function confirmDelete() {
    if (!selectedRecord) return
    setConfirmation({
      title: "Delete this workspace?",
      description: `“${selectedRecord.name}” will be removed from this demo. This action cannot be undone.`,
      confirmLabel: "Delete workspace",
      destructive: true,
      action: () => {
        setRecords((current) => current.filter((record) => record.id !== selectedRecord.id))
        setSelectedId("")
        setListOpen(true)
        setActiveTab("overview")
        toast.success("Workspace deleted.", { position: "bottom-right" })
      },
    })
  }

  function changeRole(memberId: string, role: AccessRole) {
    if (!selectedRecord) return
    const member = selectedRecord.members.find((item) => item.id === memberId)
    if (!member || member.role === "Owner" || member.role === role) return
    const eventItem = createActivity(selectedRecord.id, "access", "Access role changed", `${member.name} is now a ${role.toLowerCase()}.`, selectedRecord.activities.length + 1)
    updateRecord(selectedRecord.id, (record) => ({
      ...record,
      updatedAt: "Just now",
      members: record.members.map((item) => item.id === memberId ? { ...item, role } : item),
      activities: [eventItem, ...record.activities],
    }))
    toast.success(`${member.name} now has the ${role.toLowerCase()} role.`, { position: "bottom-right" })
  }

  function addAccess() {
    if (!selectedRecord) return
    const option = inviteOptions.find((candidate) => !selectedRecord.members.some((member) => member.id === candidate.id))
    if (!option) return
    const eventItem = createActivity(selectedRecord.id, "access", "Workspace access added", `${option.name} was added as a ${option.role.toLowerCase()}.`, selectedRecord.activities.length + 1)
    updateRecord(selectedRecord.id, (record) => ({ ...record, members: [...record.members, { ...option }], activities: [eventItem, ...record.activities] }))
    toast.success(`${option.name} added to this workspace.`, { position: "bottom-right" })
  }

  function confirmRemoveAccess(memberId: string) {
    if (!selectedRecord) return
    const member = selectedRecord.members.find((item) => item.id === memberId)
    if (!member || member.role === "Owner") return
    setConfirmation({
      title: "Remove workspace access?",
      description: `${member.name} will no longer be able to access this workspace.`,
      confirmLabel: "Remove access",
      destructive: true,
      action: () => {
        const eventItem = createActivity(selectedRecord.id, "access", "Workspace access removed", `${member.name} was removed from the workspace.`, selectedRecord.activities.length + 1)
        updateRecord(selectedRecord.id, (record) => ({ ...record, members: record.members.filter((item) => item.id !== memberId), activities: [eventItem, ...record.activities] }))
        toast.success(`${member.name} removed from this workspace.`, { position: "bottom-right" })
      },
    })
  }

  function cancelConfiguration() {
    if (!selectedRecord || !configDirty) return
    setConfirmation({
      title: "Discard configuration changes?",
      description: "Your edits have not been saved. Discard them and return to the overview?",
      confirmLabel: "Discard changes",
      destructive: true,
      action: () => {
        setConfigDraft({ ...selectedRecord.config })
        setConfigErrors({})
        setActiveTab("overview")
      },
    })
  }

  function setConfigValue<K extends keyof WorkspaceConfig>(key: K, value: WorkspaceConfig[K]) {
    setConfigDraft((current) => ({ ...current, [key]: value }))
    setConfigErrors((current) => ({ ...current, [key]: "" }))
  }

  if (demoState === "loading") return <LoadingPreview />

  if (demoState === "not-found" && !listOpen) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-xl border bg-card p-6 @2xl:p-8" aria-labelledby="not-found-title">
        <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FolderKanbanIcon aria-hidden="true" /></div>
        <div className="flex flex-col gap-2"><h2 id="not-found-title" className="font-heading text-xl font-semibold">Workspace not found</h2><p className="text-sm leading-relaxed text-muted-foreground">This preview state represents a stale or deleted record. Return to the demo list to select an available workspace.</p></div>
        <Button type="button" variant="outline" className="w-fit" onClick={() => setListOpen(true)}><ArrowLeftIcon data-icon="inline-start" />Back to workspaces</Button>
      </section>
    )
  }

  if (listOpen || !selectedRecord) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5" aria-labelledby="workspace-list-title">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
          <div className="flex flex-col gap-1"><p className="text-sm text-muted-foreground">Demo directory</p><h2 id="workspace-list-title" className="font-heading text-2xl font-semibold">Workspaces</h2><p className="text-sm leading-relaxed text-muted-foreground">Select a workspace to open its details, settings, activity, and access controls.</p></div>
          <Badge variant="secondary">{records.length} {records.length === 1 ? "workspace" : "workspaces"}</Badge>
        </div>
        {records.length ? <div className="flex flex-col divide-y rounded-xl border bg-card">{records.map((record) => <button key={record.id} type="button" onClick={() => requestNavigation({ kind: "record", id: record.id })} className="flex min-w-0 items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring @2xl:p-5"><span className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FolderKanbanIcon aria-hidden="true" /></span><span className="flex min-w-0 flex-col gap-1"><span className="truncate text-sm font-semibold">{record.name}</span><span className="truncate text-sm text-muted-foreground">{record.description}</span></span></span><span className="flex shrink-0 items-center gap-3"><Badge variant="outline" className={statusStyles(record.status)}>{record.status}</Badge><ChevronRightIcon aria-hidden="true" className="size-4 text-muted-foreground" /></span></button>)}</div> : <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6"><div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"><FolderKanbanIcon aria-hidden="true" /></div><h3 className="font-heading text-lg font-semibold">No workspaces remain</h3><p className="text-sm text-muted-foreground">Restore the fictional sample records to continue exploring this template.</p><Button type="button" variant="outline" onClick={() => { setRecords(initialRecords("default")); setSelectedId("northstar"); setConfigDraft({ ...initialConfig }); setListOpen(false) }}>Restore sample workspaces</Button></div>}
      </section>
    )
  }

  const relatedRecords = records.filter((record) => selectedRecord.relatedIds.includes(record.id))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 @2xl:gap-6">
      <header className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground"><button type="button" onClick={() => requestNavigation({ kind: "list" })} className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Workspaces</button><ChevronRightIcon aria-hidden="true" className="size-3.5" /><span aria-current="page" className="max-w-[55vw] truncate text-foreground">{selectedRecord.name}</span></nav>
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-between">
          <div className="flex min-w-0 items-start gap-3"><Avatar className="mt-0.5 size-11 shrink-0 rounded-lg"><AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">{initials(selectedRecord.name)}</AvatarFallback></Avatar><div className="flex min-w-0 flex-col gap-1.5"><div className="flex flex-wrap items-center gap-2"><h1 className="font-heading text-xl font-semibold tracking-tight text-balance @2xl:text-2xl">{selectedRecord.name}</h1><Badge variant="outline" className={statusStyles(selectedRecord.status)}>{selectedRecord.status}</Badge></div><p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{selectedRecord.description}</p></div></div>
          <div className="flex shrink-0 items-center gap-2 @2xl:pl-4"><Button type="button" size="sm" onClick={() => { setDetailsDraft({ name: selectedRecord.name, description: selectedRecord.description, owner: selectedRecord.owner }); setDetailsErrors({}); setEditOpen(true) }}>Edit Details</Button><DropdownMenu open={actionsOpen} onOpenChange={setActionsOpen}><DropdownMenuTrigger asChild><Button type="button" variant="outline" size="icon" aria-label="More workspace actions"><MoreHorizontalIcon /></Button></DropdownMenuTrigger><DropdownMenuContent data-parry-theme align="end" className="w-48"><DropdownMenuItem onSelect={() => { setActionsOpen(false); duplicateRecord() }}><CopyIcon data-icon="inline-start" />Duplicate</DropdownMenuItem><DropdownMenuItem onSelect={() => { setActionsOpen(false); toggleArchive() }}><ArchiveIcon data-icon="inline-start" />{selectedRecord.status === "Archived" ? "Restore" : "Archive"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => { setActionsOpen(false); confirmDelete() }}><Trash2Icon data-icon="inline-start" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl border bg-card px-4 py-4 @2xl:grid-cols-4 @2xl:px-5"><DetailValue label="Workspace owner">{selectedRecord.owner}</DetailValue><DetailValue label="Created">{selectedRecord.createdAt}</DetailValue><DetailValue label="Last updated">{selectedRecord.updatedAt}</DetailValue><DetailValue label="Visibility">{selectedRecord.config.visibility}</DetailValue></dl>
      </header>

      <Tabs value={activeTab} onValueChange={(value) => requestNavigation({ kind: "tab", tab: value as WorkspaceTab })} className="flex min-w-0 flex-col gap-5">
        <div className="-mx-1 px-1 pt-1"><TabsList aria-label="Workspace detail sections" className="grid h-12 w-full grid-cols-[repeat(4,minmax(0,1fr))] @3xl:flex @3xl:w-fit @3xl:justify-start">
          <TabsTrigger value="overview" className="min-w-0 px-1 text-xs @3xl:px-4 @3xl:text-sm"><LayoutDashboardIcon className="hidden @3xl:block" data-icon="inline-start" /><span>Overview</span></TabsTrigger>
          <TabsTrigger value="configuration" aria-label="Configuration" className="min-w-0 px-1 text-xs @3xl:px-4 @3xl:text-sm"><FileTextIcon className="hidden @3xl:block" data-icon="inline-start" /><span className="hidden @3xl:inline">Configuration</span><span className="@3xl:hidden">Setup</span></TabsTrigger>
          <TabsTrigger value="activity" className="min-w-0 px-1 text-xs @3xl:px-4 @3xl:text-sm"><HistoryIcon className="hidden @3xl:block" data-icon="inline-start" /><span>Activity</span></TabsTrigger>
          <TabsTrigger value="access" aria-label="Access and permissions" className="min-w-0 px-1 text-xs @3xl:px-4 @3xl:text-sm"><UsersRoundIcon className="hidden @3xl:block" data-icon="inline-start" /><span className="hidden @3xl:inline">Access &amp; permissions</span><span className="@3xl:hidden">Access</span></TabsTrigger>
        </TabsList></div>

        <TabsContent value="overview" className="mt-0 flex flex-col gap-5 focus-visible:outline-none">
          <section className="grid gap-5 @5xl:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.85fr)]">
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex items-start justify-between gap-4"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Workspace summary</h2><p className="text-sm text-muted-foreground">A quick view of ownership, visibility, and operational settings.</p></div><FolderKanbanIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /></div><Separator /><dl className="grid gap-x-6 gap-y-4 @2xl:grid-cols-2"><DetailValue label="Workspace code"><span className="font-mono text-sm">{selectedRecord.config.workspaceCode}</span></DetailValue><DetailValue label="Workspace owner">{selectedRecord.owner}</DetailValue><DetailValue label="Access">{selectedRecord.config.visibility}</DetailValue><DetailValue label="Data retention">{selectedRecord.config.retentionDays} days</DetailValue></dl><div className="flex flex-wrap gap-2 pt-1"><Button type="button" size="sm" variant="outline" onClick={() => requestNavigation({ kind: "tab", tab: "configuration" })}><Settings2Icon data-icon="inline-start" />Configure workspace</Button><Button type="button" size="sm" variant="ghost" onClick={() => requestNavigation({ kind: "tab", tab: "activity" })}><ActivityIcon data-icon="inline-start" />View activity</Button></div></div>
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex items-start justify-between gap-4"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Related workspaces</h2><p className="text-sm text-muted-foreground">Open connected workspace details.</p></div><ArrowRightIcon aria-hidden="true" className="size-4 text-muted-foreground" /></div><Separator />{relatedRecords.length ? <ul className="flex flex-col divide-y">{relatedRecords.map((record) => <li key={record.id}><button type="button" onClick={() => requestNavigation({ kind: "record", id: record.id })} className="flex w-full items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex min-w-0 flex-col gap-1"><span className="truncate text-sm font-medium">{record.name}</span><span className="truncate text-sm text-muted-foreground">Owned by {record.owner}</span></span><ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /></button></li>)}</ul> : <p className="text-sm text-muted-foreground">No related workspaces are linked.</p>}</div>
          </section>
          <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex items-center justify-between gap-4"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Workspace at a glance</h2><p className="text-sm text-muted-foreground">Details stay in sync across each workspace section.</p></div><ShieldCheckIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div><Separator /><div className="grid gap-4 @2xl:grid-cols-3"><div className="flex flex-col gap-1"><span className="text-sm font-medium text-muted-foreground">People with access</span><span className="text-lg font-semibold">{selectedRecord.members.length}</span></div><div className="flex flex-col gap-1"><span className="text-sm font-medium text-muted-foreground">Recent activity</span><span className="text-lg font-semibold">{selectedRecord.activities.length}</span></div><div className="flex flex-col gap-1"><span className="text-sm font-medium text-muted-foreground">Notifications</span><span className="text-lg font-semibold">{selectedRecord.config.notifications ? "Enabled" : "Paused"}</span></div></div></section>
        </TabsContent>

        <TabsContent value="configuration" className="mt-0 focus-visible:outline-none">
          <form onSubmit={saveConfiguration} noValidate className="flex flex-col gap-5">
            <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Workspace configuration</h2><p className="text-sm leading-relaxed text-muted-foreground">Manage the workspace identifier, visibility, and data lifecycle rules.</p></div><Separator /><div className="grid gap-5 @2xl:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="workspace-code">Workspace code</Label><Input id="workspace-code" value={configDraft.workspaceCode} onChange={(event) => setConfigValue("workspaceCode", event.target.value)} aria-invalid={Boolean(configErrors.workspaceCode || (configDirty && invalidWorkspaceCode))} aria-describedby={configErrors.workspaceCode ? "workspace-code-error" : "workspace-code-hint"} /><p id={configErrors.workspaceCode ? "workspace-code-error" : "workspace-code-hint"} className={configErrors.workspaceCode ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{configErrors.workspaceCode || "Use 3–32 letters, numbers, and hyphens."}</p></div><div className="flex flex-col gap-2"><Label htmlFor="workspace-visibility">Visibility</Label><Select value={configDraft.visibility} onValueChange={(value) => setConfigValue("visibility", value as WorkspaceConfig["visibility"])}><SelectTrigger id="workspace-visibility" aria-label="Workspace visibility"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="Private">Private</SelectItem><SelectItem value="Organization">Organization</SelectItem></SelectGroup></SelectContent></Select><p className="text-sm text-muted-foreground">Choose who can discover this workspace.</p></div><div className="flex flex-col gap-2"><Label htmlFor="workspace-region">Data region</Label><Select value={configDraft.region} onValueChange={(value) => setConfigValue("region", value)}><SelectTrigger id="workspace-region"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="US East">US East</SelectItem><SelectItem value="US West">US West</SelectItem><SelectItem value="EU West">EU West</SelectItem><SelectItem value="Asia Pacific">Asia Pacific</SelectItem></SelectGroup></SelectContent></Select><p className="text-sm text-muted-foreground">Region used for workspace data storage.</p></div><div className="flex flex-col gap-2"><Label htmlFor="retention-days">Retention period (days)</Label><Input id="retention-days" type="number" min="1" max="3650" value={configDraft.retentionDays} onChange={(event) => setConfigValue("retentionDays", event.target.value)} aria-invalid={Boolean(configErrors.retentionDays || (configDirty && invalidRetention))} aria-describedby="retention-days-help" /><p id="retention-days-help" className={configErrors.retentionDays ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{configErrors.retentionDays || "Choose a value between 1 and 3,650 days."}</p></div></div><Separator /><div className="flex flex-col gap-3"><div className="flex items-center justify-between gap-4"><div className="flex flex-col gap-1"><Label htmlFor="workspace-notifications">Activity notifications</Label><p className="text-sm text-muted-foreground">Notify workspace members about important updates.</p></div><Switch id="workspace-notifications" checked={configDraft.notifications} onCheckedChange={(checked) => setConfigValue("notifications", checked)} aria-label="Activity notifications" /></div></div></section>
            <div className="flex flex-col-reverse gap-2 @2xl:flex-row @2xl:justify-end"><Button type="button" variant="outline" onClick={cancelConfiguration}>Cancel</Button><Button type="submit" disabled={!configDirty}><CheckIcon data-icon="inline-start" />Save Changes</Button></div>
          </form>
        </TabsContent>

        <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
          <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Activity history</h2><p className="text-sm text-muted-foreground">A timeline of record, configuration, and access changes.</p></div><div className="flex items-center gap-2"><Label htmlFor="activity-filter" className="shrink-0 text-sm text-muted-foreground">Filter</Label><Select value={activityFilter} onValueChange={setActivityFilter}><SelectTrigger id="activity-filter" className="w-40"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="all">All activity</SelectItem><SelectItem value="record">Record</SelectItem><SelectItem value="configuration">Configuration</SelectItem><SelectItem value="access">Access</SelectItem></SelectGroup></SelectContent></Select></div></div><Separator />
            {visibleActivities.length ? <ol className="flex flex-col">{visibleActivities.map((item, index) => <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">{item.type === "access" ? <UsersRoundIcon aria-hidden="true" className="size-4" /> : item.type === "configuration" ? <Settings2Icon aria-hidden="true" className="size-4" /> : <FolderKanbanIcon aria-hidden="true" className="size-4" />}</span>{index < visibleActivities.length - 1 && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />}</div><div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-sm font-medium">{item.action}</span><Badge variant="secondary" className="text-sm capitalize">{item.type}</Badge></div><p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Avatar className="size-6"><AvatarFallback className="text-sm">{initials(item.actor)}</AvatarFallback></Avatar><span>{item.actor}</span><span aria-hidden="true">·</span><Clock3Icon aria-hidden="true" className="size-3.5" /><span>{item.time}</span></p></div></li>)}</ol> : <div className="flex flex-col items-start gap-3 rounded-lg bg-muted/50 p-5"><div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground"><HistoryIcon aria-hidden="true" /></div><div className="flex flex-col gap-1"><h3 className="text-sm font-semibold">No activity to show</h3><p className="text-sm text-muted-foreground">{selectedRecord.activities.length === 0 ? "Workspace changes will appear here as they happen." : "No events match this activity filter."}</p></div>{activityFilter !== "all" && <Button type="button" variant="outline" size="sm" onClick={() => setActivityFilter("all")}>Clear filter</Button>}</div>}
          </section>
        </TabsContent>

        <TabsContent value="access" className="mt-0 focus-visible:outline-none">
          <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 @2xl:p-5"><div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between"><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">Access &amp; permissions</h2><p className="text-sm leading-relaxed text-muted-foreground">Manage who can open this workspace and the actions they can take.</p></div><Button type="button" size="sm" variant="outline" onClick={addAccess} disabled={inviteOptions.every((option) => selectedRecord.members.some((member) => member.id === option.id))}><PlusIcon data-icon="inline-start" />Add access</Button></div><Separator /><ul className="flex flex-col divide-y">{selectedRecord.members.map((member) => <li key={member.id} className="grid gap-3 py-3 @2xl:grid-cols-[minmax(0,1fr)_auto_auto] @2xl:items-center"><div className="flex min-w-0 items-center gap-3"><Avatar className="size-9 shrink-0"><AvatarFallback className="bg-muted text-sm font-semibold">{initials(member.name)}</AvatarFallback></Avatar><div className="flex min-w-0 flex-col gap-0.5"><span className="truncate text-sm font-medium">{member.name}</span><span className="truncate text-sm text-muted-foreground">{member.email}</span></div></div><div className="flex items-center gap-3"><Label htmlFor={`role-${member.id}`} className="text-sm text-muted-foreground @2xl:sr-only">Role</Label><Select value={member.role} onValueChange={(value) => changeRole(member.id, value as AccessRole)} disabled={member.role === "Owner"}><SelectTrigger id={`role-${member.id}`} aria-label={`Change role for ${member.name}`} className="w-36"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup>{member.role === "Owner" && <SelectItem value="Owner">Owner</SelectItem>}<SelectItem value="Admin">Admin</SelectItem><SelectItem value="Editor">Editor</SelectItem><SelectItem value="Viewer">Viewer</SelectItem></SelectGroup></SelectContent></Select></div><div className="flex items-center justify-end gap-2"><Badge variant="outline" className="hidden @2xl:inline-flex">{member.role === "Owner" ? "Full access" : member.role === "Admin" ? "Manage workspace" : member.role === "Editor" ? "Edit content" : "View only"}</Badge><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${member.name} from workspace`} disabled={member.role === "Owner"} onClick={() => confirmRemoveAccess(member.id)}><XIcon /></Button></div></li>)}</ul><div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground"><ShieldCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>Owners have full control. Admins manage settings and access; editors update workspace content; viewers have read-only access.</p></div></section>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setDetailsDraft(null); setDetailsErrors({}) } }}>
        <DialogContent data-parry-theme className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Edit workspace details</DialogTitle><DialogDescription>Update the shared record details. Changes will also appear in its activity history.</DialogDescription></DialogHeader><form onSubmit={saveDetails} noValidate className="flex flex-col gap-4"><div className="flex flex-col gap-2"><Label htmlFor="details-name">Workspace name</Label><Input id="details-name" value={detailsDraft?.name ?? ""} onChange={(event) => setDetailsDraft((current) => current ? { ...current, name: event.target.value } : current)} aria-invalid={Boolean(detailsErrors.name)} />{detailsErrors.name && <p className="text-sm text-destructive">{detailsErrors.name}</p>}</div><div className="flex flex-col gap-2"><Label htmlFor="details-description">Description</Label><Textarea id="details-description" rows={3} value={detailsDraft?.description ?? ""} onChange={(event) => setDetailsDraft((current) => current ? { ...current, description: event.target.value } : current)} aria-invalid={Boolean(detailsErrors.description)} />{detailsErrors.description && <p className="text-sm text-destructive">{detailsErrors.description}</p>}</div><div className="flex flex-col gap-2"><Label htmlFor="details-owner">Owner</Label><Select value={detailsDraft?.owner ?? ""} onValueChange={(owner) => setDetailsDraft((current) => current ? { ...current, owner } : current)}><SelectTrigger id="details-owner"><SelectValue placeholder="Select owner" /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="Jordan Lee">Jordan Lee</SelectItem><SelectItem value="Samira Patel">Samira Patel</SelectItem><SelectItem value="Ben Carter">Ben Carter</SelectItem></SelectGroup></SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" onClick={() => { setEditOpen(false); setDetailsDraft(null); setDetailsErrors({}) }}>Cancel</Button><Button type="submit"><CheckIcon data-icon="inline-start" />Save details</Button></DialogFooter></form></DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) { setConfirmation(null) } }}>
        {confirmation && <DialogContent data-parry-theme><DialogHeader><DialogTitle>{confirmation.title}</DialogTitle><DialogDescription>{confirmation.description}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => { setConfirmation(null) }}>Cancel</Button><Button type="button" variant={confirmation.destructive ? "destructive" : "default"} onClick={() => { const action = confirmation.action; setConfirmation(null); action() }}>{confirmation.confirmLabel}</Button></DialogFooter></DialogContent>}
      </Dialog>
    </div>
  )
}
