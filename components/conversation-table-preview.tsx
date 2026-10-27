"use client"

import { useMemo, useState, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react"
import {
  ArrowDownUpIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  Clock3Icon,
  MailIcon,
  MessageCircleMoreIcon,
  MessagesSquareIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  UserRoundIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ConversationWorkspace } from "@/components/conversation-workspace"
import { useSharedConversations } from "@/lib/conversation-state"
import {
  conversationAssignees,
  conversationChannels,
  conversationPriorities,
  conversationStatuses,
  type Conversation,
  type ConversationChannel,
  type ConversationPriority,
  type ConversationStatus,
  type SlaStatus,
} from "@/lib/conversation-table-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ConversationDemoMode = "default" | "loading" | "empty" | "no-search-results" | "action-error"
type SortMode = "latest" | "oldest" | "priority" | "customer"

const priorities: Record<ConversationPriority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 }
const priorityTone: Record<ConversationPriority, string> = {
  Urgent: "border-destructive/35 bg-destructive-soft text-destructive",
  High: "border-warning/35 bg-warning-soft text-warning",
  Medium: "border-info/35 bg-info-soft text-info",
  Low: "border-border bg-secondary text-secondary-foreground",
}
const statusTone: Record<ConversationStatus, string> = {
  Open: "border-border bg-secondary text-secondary-foreground",
  "In Progress": "border-info/35 bg-info-soft text-info",
  Pending: "border-warning/35 bg-warning-soft text-warning",
  Closed: "border-success/35 bg-success-soft text-success",
}
const slaTone: Record<SlaStatus, string> = {
  Normal: "bg-success",
  "At Risk": "bg-warning",
  Breached: "bg-destructive",
}
const demoCurrentUser = "Naomi Reed"

function channelIcon(channel: ConversationChannel) {
  if (channel === "Email") return MailIcon
  if (channel === "WhatsApp") return MessagesSquareIcon
  return MessageCircleMoreIcon
}

function ConversationAvatar({ conversation, className = "" }: { conversation: Conversation; className?: string }) {
  return <Avatar aria-label={conversation.customer} className={className}>
    <AvatarFallback className="bg-muted text-xs font-medium text-foreground">{conversation.initials}</AvatarFallback>
  </Avatar>
}

function AssigneeLabel({ name }: { name: string | null }) {
  if (!name) return <span className="text-muted-foreground">Unassigned</span>
  return <span className="inline-flex items-center gap-2">
    <Avatar aria-hidden="true" className="size-6">
      <AvatarFallback className="bg-secondary text-[10px] font-medium">{name.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
    </Avatar>
    <span>{name}</span>
  </span>
}

function SelectAssigneeItems({ onSelect }: { onSelect: (assignee: string | null) => void }) {
  return <>
    <DropdownMenuItem onSelect={() => onSelect(null)}>Unassign</DropdownMenuItem>
    {conversationAssignees.map((assignee) => <DropdownMenuItem key={assignee} onSelect={() => onSelect(assignee)}>{assignee}{assignee === demoCurrentUser && <span className="ml-auto text-xs text-muted-foreground">You</span>}</DropdownMenuItem>)}
  </>
}

function ConversationActions({
  conversation,
  onView,
  onOpenWorkspace,
  onUpdate,
}: {
  conversation: Conversation
  onView: () => void
  onOpenWorkspace: () => void
  onUpdate: (patch: Partial<Conversation>) => void
}) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${conversation.customer}`} onClick={(event) => event.stopPropagation()}>
        <MoreHorizontalIcon />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent data-parry-theme align="end" className="w-56" onClick={(event) => event.stopPropagation()}>
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={onView}>Quick preview</DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpenWorkspace}><MessagesSquareIcon data-icon="inline-start" />View conversation</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onUpdate({ assignee: demoCurrentUser })}><UserRoundIcon data-icon="inline-start" />Assign to me</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><UsersRoundIcon data-icon="inline-start" />Assign to agent</DropdownMenuSubTrigger>
          <DropdownMenuSubContent data-parry-theme><DropdownMenuGroup><SelectAssigneeItems onSelect={(assignee) => onUpdate({ assignee })} /></DropdownMenuGroup></DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent data-parry-theme>
            <DropdownMenuGroup>{conversationPriorities.map((priority) => <DropdownMenuItem key={priority} onSelect={() => onUpdate({ priority })}>{priority}{priority === conversation.priority && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent data-parry-theme>
            <DropdownMenuGroup>{conversationStatuses.map((status) => <DropdownMenuItem key={status} onSelect={() => onUpdate({ status })}>{status}{status === conversation.status && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => onUpdate({ bookmarked: !conversation.bookmarked })}>
        <BookmarkIcon data-icon="inline-start" />{conversation.bookmarked ? "Remove bookmark" : "Bookmark conversation"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

function BulkMenu({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" className="h-8">{label}<ChevronDownIcon data-icon="inline-end" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent data-parry-theme align="start" className="w-56"><DropdownMenuGroup>{children}</DropdownMenuGroup></DropdownMenuContent>
  </DropdownMenu>
}

function LoadingRows() {
  return <>{Array.from({ length: 5 }, (_, index) => <TableRow key={`skeleton-${index}`} aria-hidden="true">
    <TableCell><Skeleton className="size-4" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><div className="flex items-center gap-3"><Skeleton className="size-9 rounded-full" /><div className="flex flex-col gap-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-48" /></div></div></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="ml-auto size-7" /></TableCell>
  </TableRow>)}</>
}

function ConversationDrawer({ conversation, onClose }: { conversation: Conversation | null; onClose: () => void }) {
  return <Dialog open={Boolean(conversation)} onOpenChange={(open) => { if (!open) onClose() }}>
    {conversation && <DialogContent data-parry-theme aria-describedby="conversation-preview-description" showCloseButton={false} className="left-auto right-0 top-0 flex h-dvh w-[min(28rem,100vw)] max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-l-xl rounded-r-none p-0 sm:w-[28rem]">
      <DialogHeader className="sr-only">
        <DialogTitle>Conversation with {conversation.customer}</DialogTitle>
        <DialogDescription id="conversation-preview-description">Read-only preview of conversation {conversation.id}.</DialogDescription>
      </DialogHeader>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <ConversationAvatar conversation={conversation} className="size-11" />
          <div className="min-w-0">
            <h2 className="truncate font-heading text-lg font-semibold">{conversation.customer}</h2>
            <p className="truncate text-sm text-muted-foreground">{conversation.email}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close conversation preview" onClick={onClose}><XIcon /></Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <Badge variant="outline" className={statusTone[conversation.status]}>{conversation.status}</Badge>
        <Badge variant="outline" className={priorityTone[conversation.priority]}>{conversation.priority}</Badge>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{conversation.id}</span>
      </div>
      <section aria-label="Recent messages" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        <p className="text-center text-xs text-muted-foreground">Today · {conversation.channel}</p>
        {conversation.messages.filter(({ from }) => from !== "note").map((message, index) => <div key={`${message.time}-${index}`} className={`flex flex-col gap-1 ${message.from === "agent" ? "items-end" : "items-start"}`}>
          <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === "agent" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{message.body}</div>
          <span className="px-1 text-[11px] text-muted-foreground">{message.from === "agent" ? "Support · " : `${conversation.customer} · `}{message.time}</span>
        </div>)}
      </section>
      <section aria-label="Conversation details" className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-4">
        <h3 className="text-sm font-semibold">Conversation details</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Company</dt><dd className="text-right">{conversation.company}</dd>
          <dt className="text-muted-foreground">Channel</dt><dd className="text-right">{conversation.channel}</dd>
          <dt className="text-muted-foreground">Assignee</dt><dd className="text-right">{conversation.assignee ?? "Unassigned"}</dd>
          <dt className="text-muted-foreground">SLA</dt><dd className="text-right">{conversation.sla}</dd>
        </dl>
      </section>
    </DialogContent>}
  </Dialog>
}

export function ConversationTable({ demoMode = "default" }: { demoMode?: ConversationDemoMode }) {
  const [conversations, setConversations] = useSharedConversations()
  const [workspaceConversationId, setWorkspaceConversationId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "All">("All")
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<ConversationPriority | "all">("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [sortMode, setSortMode] = useState<SortMode>("latest")
  const [query, setQuery] = useState(demoMode === "no-search-results" ? "CNV-0000" : "")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState("")
  const [newChannel, setNewChannel] = useState<ConversationChannel>("Web Chat")
  const [newPriority, setNewPriority] = useState<ConversationPriority>("Medium")
  const [confirmClose, setConfirmClose] = useState(false)
  const [pendingBulkStatus, setPendingBulkStatus] = useState<ConversationStatus | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null)
  const [createdWhileEmpty, setCreatedWhileEmpty] = useState(false)

  const selectedConversation = conversations.find(({ id }) => id === selectedConversationId) ?? null
  const filteredConversations = useMemo(() => {
    const displayedSource = demoMode === "empty" && !createdWhileEmpty ? [] : conversations
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const filtered = displayedSource.filter((conversation) => {
              const matchesSearch = !normalizedQuery || [conversation.customer, conversation.id, conversation.preview, ...conversation.messages.filter(({ from }) => from !== "note").map(({ body }) => body)].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))

      return matchesSearch &&
        (statusFilter === "All" || conversation.status === statusFilter) &&
        (channelFilter === "all" || conversation.channel === channelFilter) &&
        (priorityFilter === "all" || conversation.priority === priorityFilter) &&
        (assigneeFilter === "all" || (assigneeFilter === "unassigned" ? !conversation.assignee : conversation.assignee === assigneeFilter))
    })
    return filtered.sort((first, second) => {
      if (sortMode === "latest") return Date.parse(second.lastMessageAt) - Date.parse(first.lastMessageAt)
      if (sortMode === "oldest") return Date.parse(first.lastMessageAt) - Date.parse(second.lastMessageAt)
      if (sortMode === "priority") return priorities[first.priority] - priorities[second.priority]
      return first.customer.localeCompare(second.customer)
    })
  }, [assigneeFilter, channelFilter, conversations, createdWhileEmpty, demoMode, priorityFilter, query, sortMode, statusFilter])
  const pageSize = 5
  const pageCount = Math.max(1, Math.ceil(filteredConversations.length / pageSize))
  const safePage = Math.min(currentPage, pageCount)
  const visibleConversations = filteredConversations.slice((safePage - 1) * pageSize, safePage * pageSize)
  const visibleIds = visibleConversations.map(({ id }) => id)
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected
  const isLoading = demoMode === "loading"
  const hasActiveFilters = query.length > 0 || statusFilter !== "All" || channelFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || sortMode !== "latest"

  function clearFeedback() {
    setActionError(null)
    setBulkSuccess(null)
  }

  function commitUpdate(ids: string[], patch: Partial<Conversation>, message?: string) {
    clearFeedback()
    if (demoMode === "action-error") {
      const error = "Demo action failed. No conversation changes were saved."
      setActionError(error)
      toast.error(error)
      return false
    }
    setConversations((current) => current.map((conversation) => ids.includes(conversation.id) ? { ...conversation, ...patch } : conversation))
    if (message) {
      setBulkSuccess(message)
      toast.success(message)
    }
    return true
  }

  function updateOne(id: string, patch: Partial<Conversation>) {
    commitUpdate([id], patch)
  }

  function updateSelected(patch: Partial<Conversation>, actionLabel: string) {
    commitUpdate([...selectedIds], patch, `${actionLabel} for ${selectedIds.size} ${selectedIds.size === 1 ? "conversation" : "conversations"}.`)
  }

  function handleStatusBulkChange(status: ConversationStatus) {
    setPendingBulkStatus(status)
    if (status === "Closed") setConfirmClose(true)
    else updateSelected({ status }, `Status changed to ${status}`)
  }

  function confirmBulkStatusChange() {
    if (!pendingBulkStatus) return
    updateSelected({ status: pendingBulkStatus }, `Status changed to ${pendingBulkStatus}`)
    setConfirmClose(false)
    setPendingBulkStatus(null)
  }

  function toggleConversation(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current)
      for (const id of visibleIds) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function clearFilters() {
    setQuery("")
    setStatusFilter("All")
    setChannelFilter("all")
    setPriorityFilter("all")
    setAssigneeFilter("all")
    setSortMode("latest")
    setCurrentPage(1)
  }

  function handleNewConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const customer = newCustomer.trim()
    if (!customer) return
    const initials = customer.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("")
    const now = new Date(Math.max(Date.now(), ...conversations.map(({ lastMessageAt }) => Date.parse(lastMessageAt) + 1)))
    const nextNumber = Math.max(0, ...conversations.map(({ id: conversationId }) => Number(conversationId.replace("CNV-", "")))) + 1
    const id = `CNV-${String(nextNumber).padStart(4, "0")}`
    const created: Conversation = {
      id,
      customer,
      initials,
      email: `${customer.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "")}@example.com`,
      company: "New customer",
      channel: newChannel,
      status: "Open",
      priority: newPriority,
      assignee: null,
      preview: "Conversation created from the demo table.",
      lastMessage: "Just now",
      lastMessageAt: now.toISOString(),
      sla: "Normal",
      bookmarked: false,
      messages: [{ from: "customer", body: "Conversation created from the demo table.", time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) }],
    }
    setConversations((current) => demoMode === "empty" && !createdWhileEmpty ? [created] : [created, ...current])
    setCreatedWhileEmpty(true)
    setCreateOpen(false)
    setNewCustomer("")
    setQuery("")
    setStatusFilter("All")
    setChannelFilter("all")
    setPriorityFilter("all")
    setAssigneeFilter("all")
    setSortMode("latest")
    setCurrentPage(1)
    toast.success("Conversation created")
  }

  function openConversationFromRow(event: MouseEvent<HTMLTableRowElement>, id: string) {
    if ((event.target as HTMLElement).closest("button, input, [role=checkbox], a")) return
    setSelectedConversationId(id)
  }

  function openConversationFromKeyboard(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if ((event.target as HTMLElement).closest("button, input, [role=checkbox], a")) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setSelectedConversationId(id)
    }
  }

  return <><section aria-label="Conversation management table" className={`flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 ${workspaceConversationId ? "hidden" : ""}`}>
    <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Conversations</h2>
          <Badge variant="secondary" className="tabular-nums">{filteredConversations.length} {filteredConversations.length === 1 ? "conversation" : "conversations"}</Badge>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Monitor customer conversations across channels, prioritize requests, and keep every follow-up on track.</p>
      </div>
      <Button type="button" className="shrink-0 self-start" onClick={() => setCreateOpen(true)} disabled={isLoading}><PlusIcon data-icon="inline-start" />New Conversation</Button>
    </header>

    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search conversations" placeholder="Search customer, ID, or message…" value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} className="pl-9" disabled={isLoading} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={channelFilter} onValueChange={(value) => { setChannelFilter(value as ConversationChannel | "all"); setCurrentPage(1) }}>
              <SelectTrigger aria-label="Filter by channel" className="h-9 w-[8.75rem]"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme><SelectGroup><SelectItem value="all">All channels</SelectItem>{conversationChannels.map((channel) => <SelectItem key={channel} value={channel}>{channel}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => { setPriorityFilter(value as ConversationPriority | "all"); setCurrentPage(1) }}>
              <SelectTrigger aria-label="Filter by priority" className="h-9 w-[8rem]"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme><SelectGroup><SelectItem value="all">All priorities</SelectItem>{conversationPriorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={(value) => { setAssigneeFilter(value); setCurrentPage(1) }}>
              <SelectTrigger aria-label="Filter by assignee" className="h-9 w-[9.5rem]"><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme><SelectGroup><SelectItem value="all">All assignees</SelectItem><SelectItem value="unassigned">Unassigned</SelectItem>{conversationAssignees.map((assignee) => <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
              <SelectTrigger aria-label="Sort conversations" className="h-9 w-[9.25rem]"><ArrowDownUpIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent data-parry-theme><SelectGroup><SelectItem value="latest">Latest activity</SelectItem><SelectItem value="oldest">Oldest activity</SelectItem><SelectItem value="priority">Priority</SelectItem><SelectItem value="customer">Customer name</SelectItem></SelectGroup></SelectContent>
            </Select>
            {hasActiveFilters && <Button type="button" variant="ghost" size="sm" className="h-9" onClick={clearFilters} disabled={isLoading}><XIcon data-icon="inline-start" />Clear filters</Button>}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => { if (value) { setStatusFilter(value as ConversationStatus | "All"); setCurrentPage(1) } }} variant="outline" size="sm" aria-label="Filter conversations by status" className="max-w-full flex-wrap justify-start">
            {(["All", ...conversationStatuses] as const).map((status) => <ToggleGroupItem key={status} value={status} aria-label={`Show ${status.toLocaleLowerCase()} conversations`} className="h-8 px-3">{status}</ToggleGroupItem>)}
          </ToggleGroup>
          <p className="shrink-0 text-xs tabular-nums text-muted-foreground" aria-live="polite">{filteredConversations.length} matching {filteredConversations.length === 1 ? "conversation" : "conversations"}</p>
        </div>
      </div>

      {demoMode === "action-error" && <div role="status" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2.5 text-sm text-destructive"><CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>Action error simulation is active. Row and bulk updates will be rejected so the error state can be inspected.</p></div>}
      {actionError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive-soft px-3 py-2.5 text-sm text-destructive"><CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>{actionError}</p></div>}
      {bulkSuccess && <div role="status" className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2.5 text-sm text-success"><CheckIcon aria-hidden="true" className="size-4 shrink-0" /><p>{bulkSuccess}</p></div>}

      {selectedIds.size > 0 && !isLoading && <div role="region" aria-label="Bulk conversation actions" className="flex flex-wrap items-center gap-2 rounded-lg border border-info/30 bg-info-soft/50 p-2.5">
        <span className="mr-auto text-sm font-medium">{selectedIds.size} selected</span>
        <BulkMenu label="Bulk assign"><DropdownMenuItem onSelect={() => updateSelected({ assignee: demoCurrentUser }, "Assigned to you")}>Assign to me</DropdownMenuItem><DropdownMenuSub><DropdownMenuSubTrigger>Assign to agent</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup><SelectAssigneeItems onSelect={(assignee) => updateSelected({ assignee }, `Assigned to ${assignee ?? "nobody"}`)} /></DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub></BulkMenu>
        <BulkMenu label="Bulk priority">{conversationPriorities.map((priority) => <DropdownMenuItem key={priority} onSelect={() => updateSelected({ priority }, `Priority changed to ${priority}`)}>{priority}</DropdownMenuItem>)}</BulkMenu>
        <BulkMenu label="Bulk status">{conversationStatuses.map((status) => <DropdownMenuItem key={status} onSelect={() => handleStatusBulkChange(status)}>{status}</DropdownMenuItem>)}</BulkMenu>
        <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setSelectedIds(new Set())}>Clear selection</Button>
      </div>}

      <div className="min-w-0 overflow-hidden rounded-lg border">
        <Table className="min-w-[1370px]">
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10"><Checkbox aria-label="Select all visible conversations" checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false} onCheckedChange={(checked) => toggleVisible(checked === true)} disabled={isLoading || visibleIds.length === 0} /></TableHead>
              <TableHead className="w-28">Conversation ID</TableHead>
              <TableHead className="w-[21rem]">Customer</TableHead>
              <TableHead className="w-32">Channel</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Priority</TableHead>
              <TableHead className="w-44">Assignee</TableHead>
              <TableHead className="w-36">Last message</TableHead>
              <TableHead className="w-28">SLA status</TableHead>
              <TableHead className="w-12 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <LoadingRows /> : visibleConversations.length === 0 ? <TableRow><TableCell colSpan={10} className="h-52 whitespace-normal">
              <div className="mx-auto flex max-w-md flex-col items-center gap-2 text-center">
                {demoMode === "empty" && !createdWhileEmpty ? <>
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">New conversations will appear here as customers get in touch.</p>
                  <Button type="button" size="sm" onClick={() => setCreateOpen(true)}><PlusIcon data-icon="inline-start" />New Conversation</Button>
                </> : <>
                  <p className="font-medium">No conversations match these filters</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">Try another customer, conversation ID, message, or filter combination.</p>
                  <Button type="button" variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                </>}
              </div>
            </TableCell></TableRow> : visibleConversations.map((conversation) => {
              const ChannelIcon = channelIcon(conversation.channel)
              return <TableRow key={conversation.id} tabIndex={0} aria-selected={selectedIds.has(conversation.id)} data-state={selectedIds.has(conversation.id) ? "selected" : undefined} className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" onClick={(event) => openConversationFromRow(event, conversation.id)} onKeyDown={(event) => openConversationFromKeyboard(event, conversation.id)}>
                <TableCell><Checkbox aria-label={`Select ${conversation.customer}`} checked={selectedIds.has(conversation.id)} onCheckedChange={(checked) => toggleConversation(conversation.id, checked === true)} onClick={(event) => event.stopPropagation()} /></TableCell>
                <TableCell><span className="font-mono text-xs text-muted-foreground">{conversation.id}</span>{conversation.bookmarked && <span className="ml-1.5 inline-flex align-middle text-primary" title="Bookmarked"><BookmarkIcon aria-label="Bookmarked" className="size-3.5 fill-current" /></span>}</TableCell>
                <TableCell><div className="flex min-w-0 items-center gap-3"><ConversationAvatar conversation={conversation} className="size-9 shrink-0" /><div className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-medium text-foreground">{conversation.customer}</span><span className="max-w-[19rem] truncate text-xs text-muted-foreground">{conversation.preview}</span></div></div></TableCell>
                <TableCell><span className="inline-flex items-center gap-2 text-sm"><ChannelIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />{conversation.channel}</span></TableCell>
                <TableCell><Badge variant="outline" className={statusTone[conversation.status]}>{conversation.status}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={priorityTone[conversation.priority]}>{conversation.priority}</Badge></TableCell>
                <TableCell className="text-sm"><AssigneeLabel name={conversation.assignee} /></TableCell>
                <TableCell><div className="flex flex-col gap-0.5"><span className="text-sm">{conversation.lastMessage}</span><span className="max-w-36 truncate text-xs text-muted-foreground">{conversation.preview}</span></div></TableCell>
                <TableCell><span className="inline-flex items-center gap-2 text-sm"><span aria-hidden="true" className={`size-2 rounded-full ${slaTone[conversation.sla]}`} /><span className={conversation.sla === "Normal" ? "text-muted-foreground" : conversation.sla === "At Risk" ? "text-warning" : "text-destructive"}>{conversation.sla}</span></span></TableCell>
                <TableCell className="text-right"><ConversationActions conversation={conversation} onView={() => setSelectedConversationId(conversation.id)} onOpenWorkspace={() => { setSelectedConversationId(null); setWorkspaceConversationId(conversation.id) }} onUpdate={(patch) => updateOne(conversation.id, patch)} /></TableCell>
              </TableRow>
            })}
          </TableBody>
        </Table>
      </div>

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs tabular-nums text-muted-foreground">{isLoading ? "Loading conversations…" : filteredConversations.length === 0 ? "0 conversations" : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filteredConversations.length)} of ${filteredConversations.length} conversations`}</p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-muted-foreground">5 per page</span>
          <span className="min-w-20 text-center text-xs tabular-nums text-muted-foreground">Page {safePage} of {pageCount}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isLoading || safePage <= 1}><ChevronLeftIcon /></Button>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={isLoading || safePage >= pageCount}><ChevronRightIcon /></Button>
          </div>
        </div>
      </footer>
      <p className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground"><Clock3Icon aria-hidden="true" className="size-3.5" />Demo workspace · fictional conversations · changes last for this session.</p>

      <ConversationDrawer conversation={selectedConversation} onClose={() => setSelectedConversationId(null)} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-parry-theme aria-describedby="new-conversation-description" className="sm:max-w-md">
          <DialogHeader><DialogTitle>New conversation</DialogTitle><DialogDescription id="new-conversation-description">Create a fictional conversation record for this demo.</DialogDescription></DialogHeader>
          <form onSubmit={handleNewConversation} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2"><Label htmlFor="new-conversation-customer">Customer name</Label><Input id="new-conversation-customer" value={newCustomer} onChange={(event) => setNewCustomer(event.target.value)} placeholder="e.g. Jordan Lee" required autoFocus /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2"><Label htmlFor="new-conversation-channel">Channel</Label><Select value={newChannel} onValueChange={(value) => setNewChannel(value as ConversationChannel)}><SelectTrigger id="new-conversation-channel" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup>{conversationChannels.map((channel) => <SelectItem key={channel} value={channel}>{channel}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label htmlFor="new-conversation-priority">Priority</Label><Select value={newPriority} onValueChange={(value) => setNewPriority(value as ConversationPriority)}><SelectTrigger id="new-conversation-priority" className="w-full"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup>{conversationPriorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={!newCustomer.trim()}>Create conversation</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClose} onOpenChange={(open) => { setConfirmClose(open); if (!open) setPendingBulkStatus(null) }}>
        <DialogContent data-parry-theme aria-describedby="bulk-close-description" className="sm:max-w-md">
          <DialogHeader><DialogTitle>Close selected conversations?</DialogTitle><DialogDescription id="bulk-close-description">This will close {selectedIds.size} selected {selectedIds.size === 1 ? "conversation" : "conversations"}. You can reopen them later from the table.</DialogDescription></DialogHeader>
          <DialogFooter><Button type="button" variant="outline" onClick={() => { setConfirmClose(false); setPendingBulkStatus(null) }}>Cancel</Button><Button type="button" variant="destructive" onClick={confirmBulkStatusChange}>Close conversations</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </section>{workspaceConversationId && <ConversationWorkspace initialConversationId={workspaceConversationId} embedded onReturnToTable={() => setWorkspaceConversationId(null)} />}</>
}

export function ConversationTablePreview() {
  const [mode, setMode] = useState<ConversationDemoMode>("default")
  return <div className="flex min-w-0 flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-primary" /><p className="text-sm font-medium">Interactive demo</p><span className="hidden text-sm text-muted-foreground sm:inline">Explore the table and its feedback states.</span></div>
      <div className="flex items-center gap-2"><Label htmlFor="conversation-demo-state" className="text-xs text-muted-foreground">Preview state</Label><Select value={mode} onValueChange={(value) => setMode(value as ConversationDemoMode)}><SelectTrigger id="conversation-demo-state" aria-label="Choose conversation table demo state" className="h-8 w-48"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup><SelectItem value="default">Default</SelectItem><SelectItem value="loading">Loading</SelectItem><SelectItem value="empty">Empty</SelectItem><SelectItem value="no-search-results">No search results</SelectItem><SelectItem value="action-error">Action error</SelectItem></SelectGroup></SelectContent></Select></div>
    </div>
    <ConversationTable key={mode} demoMode={mode} />
  </div>
}
