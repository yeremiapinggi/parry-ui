"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from "react"
import {
  ArrowLeftIcon,
  ArrowRightLeftIcon,
  AtSignIcon,
  BookmarkIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  FileIcon,
  MailIcon,
  MessageCircleMoreIcon,
  MessagesSquareIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PhoneIcon,
  SearchIcon,
  SendIcon,
  UserRoundIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  conversationAssignees,
  conversationPriorities,
  conversationStatuses,
  type Conversation,
  type ConversationAttachment,
  type ConversationChannel,
  type ConversationMessage,
  type ConversationPriority,
  type ConversationStatus,
} from "@/lib/conversation-table-data"
import { setSharedConversations, useSharedConversations } from "@/lib/conversation-state"
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
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type ConversationWorkspaceDemoState = "default" | "no-selection" | "empty-thread" | "loading" | "send-failed"

type ConversationWorkspaceProps = {
  initialConversationId?: string
  onReturnToTable?: () => void
  demoState?: ConversationWorkspaceDemoState
  embedded?: boolean
}

type ConfirmationAction = "close" | "reopen" | "transfer" | null
type MessageMode = "reply" | "note"

const statusTone: Record<ConversationStatus, string> = {
  Open: "border-border bg-secondary text-secondary-foreground",
  "In Progress": "border-info/35 bg-info-soft text-info",
  Pending: "border-warning/35 bg-warning-soft text-warning",
  Closed: "border-success/35 bg-success-soft text-success",
}

const priorityTone: Record<ConversationPriority, string> = {
  Urgent: "border-destructive/35 bg-destructive-soft text-destructive",
  High: "border-warning/35 bg-warning-soft text-warning",
  Medium: "border-info/35 bg-info-soft text-info",
  Low: "border-border bg-secondary text-secondary-foreground",
}

function ChannelIcon({ channel, className }: { channel: ConversationChannel; className?: string }) {
  if (channel === "Email") return <MailIcon aria-hidden="true" className={className} />
  if (channel === "WhatsApp") return <MessagesSquareIcon aria-hidden="true" className={className} />
  return <MessageCircleMoreIcon aria-hidden="true" className={className} />
}

function dateLabel(value: string) {
  if (value === "2026-10-27") return "Today · October 27"
  if (value === "2026-10-26") return "Yesterday · October 26"
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })
}

function AssigneeSelect({ value, onValueChange, id, disabled = false }: { value: string | null; onValueChange: (value: string | null) => void; id: string; disabled?: boolean }) {
  return <Select value={value ?? "unassigned"} onValueChange={(next) => onValueChange(next === "unassigned" ? null : next)} disabled={disabled}>
    <SelectTrigger id={id} className="h-9 w-full"><SelectValue /></SelectTrigger>
    <SelectContent data-parry-theme><SelectGroup><SelectItem value="unassigned">Unassigned</SelectItem>{conversationAssignees.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>
}

function PrioritySelect({ value, onValueChange, id, disabled = false }: { value: ConversationPriority; onValueChange: (value: ConversationPriority) => void; id: string; disabled?: boolean }) {
  return <Select value={value} onValueChange={(next) => onValueChange(next as ConversationPriority)} disabled={disabled}>
    <SelectTrigger id={id} className="h-9 w-full"><SelectValue /></SelectTrigger>
    <SelectContent data-parry-theme><SelectGroup>{conversationPriorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectGroup></SelectContent>
  </Select>
}

function ConversationList({
  conversations,
  selectedId,
  loading,
  onSelect,
}: {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<ConversationStatus | "All">("All")
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return conversations.filter((conversation) => {
      const matchesQuery = !normalized || [conversation.customer, conversation.id, conversation.preview, ...conversation.messages.map(({ body }) => body)].some((value) => value.toLocaleLowerCase().includes(normalized))
      return matchesQuery && (status === "All" || conversation.status === status)
    })
  }, [conversations, query, status])

  return <section aria-label="Conversation list" className="flex min-h-0 min-w-0 flex-1 flex-col">
    <div className="flex flex-col gap-3 border-b px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5"><h2 className="font-heading text-base font-semibold">Inbox</h2><p className="text-xs text-muted-foreground">{conversations.length} conversations</p></div>
      </div>
      <div className="relative">
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search conversations" placeholder="Search conversations" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
      </div>
      <ToggleGroup type="single" value={status} onValueChange={(value) => { if (value) setStatus(value as ConversationStatus | "All") }} variant="outline" size="sm" aria-label="Filter conversations by status" className="max-w-full flex-wrap justify-start">
        {(["All", ...conversationStatuses] as const).map((value) => <ToggleGroupItem key={value} value={value} className="h-7 px-2.5 text-xs">{value}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {loading ? <div aria-label="Loading conversations" className="flex flex-col gap-2 p-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex gap-3 rounded-lg p-3"><Skeleton className="size-9 shrink-0 rounded-full" /><div className="flex min-w-0 flex-1 flex-col gap-2"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>)}</div> : filtered.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 text-center"><SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" /><p className="text-sm font-medium">No conversations found</p><p className="text-xs leading-relaxed text-muted-foreground">Try a different search or status filter.</p></div> : <ul className="flex flex-col p-2">
        {filtered.map((conversation) => {
          const active = conversation.id === selectedId
          return <li key={conversation.id}>
            <button type="button" onClick={() => onSelect(conversation.id)} aria-current={active ? "true" : undefined} className={`flex w-full min-w-0 items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"}`}>
              <Avatar aria-hidden="true" className="mt-0.5 size-9 shrink-0"><AvatarFallback className="bg-muted text-xs font-medium text-foreground">{conversation.initials}</AvatarFallback></Avatar>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex min-w-0 items-center gap-2"><span className="truncate text-sm font-semibold">{conversation.customer}</span><span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{conversation.lastMessage}</span></span>
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"><ChannelIcon channel={conversation.channel} className="size-3.5 shrink-0" /><span className="truncate">{conversation.channel}</span><span aria-hidden="true">·</span><span className="truncate">{conversation.status}</span></span>
                <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{conversation.preview}</span>
                <span className="flex min-w-0 items-center gap-2 pt-0.5"><Badge variant="outline" className={`${statusTone[conversation.status]} h-5 px-1.5 text-[10px]`}>{conversation.status}</Badge>{conversation.bookmarked && <BookmarkIcon aria-label="Bookmarked" className="size-3.5 fill-current text-primary" />}{(conversation.unreadCount ?? 0) > 0 && <Badge aria-label={`${conversation.unreadCount} unread messages`} className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]">{conversation.unreadCount}</Badge>}</span>
              </span>
            </button>
          </li>
        })}
      </ul>}
    </div>
  </section>
}

function AttachmentPreview({ attachment }: { attachment: ConversationAttachment }) {
  const isImage = attachment.type.startsWith("image/") && Boolean(attachment.url)
  return <div className="flex max-w-full items-center gap-3 rounded-lg border bg-background/70 p-2.5">
    {isImage ? <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted"><Image src={attachment.url!} alt={attachment.name} fill sizes="64px" unoptimized className="object-cover" /></div> : <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted"><FileIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div>}
    <span className="flex min-w-0 flex-col gap-1"><span className="truncate text-xs font-medium">{attachment.name}</span><span className="text-[11px] text-muted-foreground">{attachment.sizeLabel ?? "Demo attachment"}</span></span>
  </div>
}

function MessageTimeline({
  conversation,
  messages,
  endRef,
}: {
  conversation: Conversation
  messages: ConversationMessage[]
  endRef: RefObject<HTMLDivElement | null>
}) {
  if (messages.length === 0) return <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><MessageCircleMoreIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div><div className="flex flex-col gap-1"><p className="font-medium">No messages yet</p><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Start the conversation with a reply or add an internal note for your team.</p></div></div>
  return <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
    {messages.map((message, index) => {
      const date = message.date ?? "2026-10-27"
      const previousDate = index > 0 ? messages[index - 1].date ?? "2026-10-27" : ""
      const showDate = date !== previousDate
      const isNote = message.from === "note"
      const isAgent = message.from === "agent"
      const sender = isNote ? "Internal note" : isAgent ? "Support team" : conversation.customer
      return <div key={message.id ?? `${date}-${message.time}-${index}`} className="flex flex-col gap-2">
        {showDate && <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-border" /><span className="text-[11px] text-muted-foreground">{dateLabel(date)}</span><span className="h-px flex-1 bg-border" /></div>}
        <div className={`flex flex-col gap-1.5 ${isAgent ? "items-end" : "items-start"}`}>
          <span className="px-1 text-[11px] text-muted-foreground">{sender}{isNote ? " · Workspace only" : ""}</span>
          <div className={`max-w-[min(86%,34rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isNote ? "border border-warning/35 bg-warning-soft text-foreground" : isAgent ? "bg-primary text-primary-foreground" : "border bg-card text-card-foreground"}`}>
            {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
            {message.attachments?.length ? <div className="mt-2 flex flex-col gap-2">{message.attachments.map((attachment, attachmentIndex) => <AttachmentPreview key={`${attachment.name}-${attachmentIndex}`} attachment={attachment} />)}</div> : null}
          </div>
          <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">{message.time}{isAgent && message.delivery === "sent" && <CheckCheckIcon aria-label="Sent" className="size-3.5 text-primary" />}{isAgent && message.delivery === "failed" && <CircleHelpIcon aria-label="Failed to send" className="size-3.5 text-destructive" />}</span>
        </div>
      </div>
    })}
    <div ref={endRef} aria-hidden="true" />
  </div>
}

function CustomerDetails({
  conversation,
  readOnly,
  onAssigneeChange,
  onPriorityChange,
  onTransfer,
}: {
  conversation: Conversation
  readOnly: boolean
  onAssigneeChange: (value: string | null) => void
  onPriorityChange: (value: ConversationPriority) => void
  onTransfer: () => void
}) {
  const tags = conversation.tags?.length ? conversation.tags : ["Customer", conversation.channel]
  const phone = conversation.phone ?? "+1 (555) 014-0284"
  return <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
    <div className="flex flex-col items-center gap-3 border-b px-5 py-5 text-center">
      <Avatar aria-label={conversation.customer} className="size-14"><AvatarFallback className="bg-muted text-base font-semibold text-foreground">{conversation.initials}</AvatarFallback></Avatar>
      <div className="flex min-w-0 flex-col gap-1"><h3 className="truncate font-heading text-base font-semibold">{conversation.customer}</h3><p className="truncate text-sm text-muted-foreground">{conversation.company}</p></div>
      <div className="flex items-center gap-2"><Button asChild variant="outline" size="icon-sm" aria-label={`Email ${conversation.customer}`}><a href={`mailto:${conversation.email}`}><AtSignIcon /></a></Button><Button asChild variant="outline" size="icon-sm" aria-label={`Call ${conversation.customer}`}><a href={`tel:${phone.replace(/[^\d+]/g, "")}`}><PhoneIcon /></a></Button></div>
    </div>
    <div className="flex flex-col gap-4 p-4">
      <details open className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>Contact information</span><ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
        <dl className="flex flex-col gap-3 border-t px-3 py-3 text-sm"><div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Email</dt><dd className="break-all">{conversation.email}</dd></div><div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Phone</dt><dd>{phone}</dd></div><div className="flex flex-col gap-1"><dt className="text-xs text-muted-foreground">Company</dt><dd>{conversation.company}</dd></div></dl>
      </details>
      <details open className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>Conversation details</span><ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
        <div className="flex flex-col gap-3 border-t px-3 py-3">
          <div className="flex flex-col gap-1.5"><Label htmlFor={`assignee-${conversation.id}`} className="text-xs text-muted-foreground">Assignee</Label><AssigneeSelect id={`assignee-${conversation.id}`} value={conversation.assignee} onValueChange={onAssigneeChange} disabled={readOnly} />
</div>
          <div className="flex flex-col gap-1.5"><Label htmlFor={`priority-${conversation.id}`} className="text-xs text-muted-foreground">Priority</Label><PrioritySelect id={`priority-${conversation.id}`} value={conversation.priority} onValueChange={onPriorityChange} disabled={readOnly} />
</div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t pt-3 text-xs"><dt className="text-muted-foreground">Channel</dt><dd className="text-right">{conversation.channel}</dd><dt className="text-muted-foreground">Conversation ID</dt><dd className="text-right font-mono">{conversation.id}</dd><dt className="text-muted-foreground">Category</dt><dd className="text-right">{conversation.category ?? "General support"}</dd></dl>
          <Button type="button" variant="outline" size="sm" onClick={onTransfer} disabled={readOnly}><ArrowRightLeftIcon data-icon="inline-start" />Transfer conversation</Button>
        </div>
      </details>
      <details open className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>Tags</span><ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
        <div className="flex flex-wrap gap-1.5 border-t px-3 py-3">{tags.map((tag) => <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>)}</div>
      </details>
      <details className="group rounded-lg border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>Recent activity</span><ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
        <ul className="flex flex-col gap-3 border-t px-3 py-3 text-xs leading-relaxed"><li className="flex gap-2"><span className="mt-1 size-2 shrink-0 rounded-full bg-primary" /><span><strong className="font-medium">{conversation.assignee ?? "Unassigned"}</strong> {conversation.assignee ? "is assigned to this conversation" : "needs an owner"}<span className="block text-muted-foreground">{conversation.lastMessage}</span></span></li><li className="flex gap-2"><span className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground" /><span>Customer contacted support via {conversation.channel}<span className="block text-muted-foreground">Today · {conversation.lastMessage}</span></span></li></ul>
      </details>
    </div>
  </div>
}

function ConversationHeader({
  conversation,
  canReply,
  onStatusChange,
  onAssignToMe,
  onAssign,
  onPriorityChange,
  onBookmark,
  onTransfer,
  onShowDetails,
  onBack,
}: {
  conversation: Conversation
  canReply: boolean
  onStatusChange: (status: ConversationStatus) => void
  onAssignToMe: () => void
  onAssign: (name: string | null) => void
  onPriorityChange: (priority: ConversationPriority) => void
  onBookmark: () => void
  onTransfer: () => void
  onShowDetails: () => void
  onBack?: () => void
}) {
  return <header className="flex min-w-0 items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5">
    {onBack && <Button type="button" variant="ghost" size="icon-sm" aria-label="Back to conversation list" onClick={onBack} className="md:hidden"><ArrowLeftIcon /></Button>}
    <Avatar aria-hidden="true" className="hidden size-9 shrink-0 sm:flex"><AvatarFallback className="bg-muted text-xs font-medium text-foreground">{conversation.initials}</AvatarFallback></Avatar>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><h2 className="truncate font-heading text-sm font-semibold sm:text-base">{conversation.customer}</h2><Badge variant="outline" className={`${statusTone[conversation.status]} h-5 px-1.5 text-[10px]`}>{conversation.status}</Badge></div>
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground"><ChannelIcon channel={conversation.channel} className="size-3.5 shrink-0" /><span>{conversation.channel}</span><span aria-hidden="true">·</span><span className="truncate font-mono">{conversation.id}</span><span className="hidden min-w-0 items-center gap-1 sm:flex"><UserRoundIcon aria-hidden="true" className="size-3.5 shrink-0" /><span className="truncate">{conversation.assignee ?? "Unassigned"}</span></span></div>
    </div>
    <Button type="button" variant="ghost" size="sm" className="hidden shrink-0 text-xs lg:flex" onClick={onAssignToMe} disabled={!canReply}><UserRoundIcon data-icon="inline-start" />Assign to me</Button>
    <Button type="button" variant="ghost" size="icon-sm" aria-label="Open customer details" className="lg:hidden" onClick={onShowDetails}><UserRoundIcon /></Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label="Conversation actions"><MoreHorizontalIcon /></Button></DropdownMenuTrigger>
      <DropdownMenuContent data-parry-theme align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onAssignToMe} disabled={!canReply}><UserRoundIcon data-icon="inline-start" />Assign to me</DropdownMenuItem>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}><UsersRoundIcon data-icon="inline-start" />Assign to agent</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup><DropdownMenuItem disabled={!canReply} onSelect={() => onAssign(null)}>Unassign</DropdownMenuItem>{conversationAssignees.map((name) => <DropdownMenuItem key={name} disabled={!canReply} onSelect={() => onAssign(name)}>{name}{name === conversation.assignee && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}>Change priority</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup>{conversationPriorities.map((priority) => <DropdownMenuItem key={priority} disabled={!canReply} onSelect={() => onPriorityChange(priority)}>{priority}{priority === conversation.priority && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}>Change status</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup>{conversationStatuses.map((status) => <DropdownMenuItem key={status} disabled={!canReply} onSelect={() => onStatusChange(status)}>{status}{status === conversation.status && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onBookmark} disabled={!canReply}><BookmarkIcon data-icon="inline-start" />{conversation.bookmarked ? "Remove bookmark" : "Bookmark conversation"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={onTransfer} disabled={!canReply}><ArrowRightLeftIcon data-icon="inline-start" />Transfer conversation</DropdownMenuItem>
        {conversation.status === "Closed" && <DropdownMenuItem onSelect={() => onStatusChange("Open")}>Reopen conversation</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    {!canReply && <span className="sr-only">This closed conversation is read-only.</span>}
  </header>
}

export function ConversationWorkspace({
  initialConversationId,
  onReturnToTable,
  demoState = "default",
  embedded = false,
}: ConversationWorkspaceProps) {
  const [conversations] = useSharedConversations()
  const initialId = demoState === "no-selection" ? null : initialConversationId ?? conversations[0]?.id ?? null
  const [selectedId, setSelectedId] = useState<string | null>(initialId)
  const [mobileView, setMobileView] = useState<"list" | "thread">("list")
  const [showDetails, setShowDetails] = useState(false)
  const [messageMode, setMessageMode] = useState<MessageMode>("reply")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [attachmentsByConversation, setAttachmentsByConversation] = useState<Record<string, ConversationAttachment[]>>({})
  const [sendingByConversation, setSendingByConversation] = useState<Record<string, boolean>>({})
  const [sendFailed, setSendFailed] = useState<Record<string, boolean>>({})
  const [confirmation, setConfirmation] = useState<ConfirmationAction>(null)
  const [transferAssignee, setTransferAssignee] = useState<string>(conversationAssignees[0])
  const [messageSent, setMessageSent] = useState<Record<string, boolean>>({})
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedConversation = conversations.find(({ id }) => id === selectedId) ?? null
  const activeMessages = selectedConversation ? demoState === "empty-thread" ? [] : selectedConversation.messages : []
  const currentDraft = selectedId ? drafts[selectedId] ?? "" : ""
  const currentAttachments = selectedId ? attachmentsByConversation[selectedId] ?? [] : []
  const isSending = selectedId ? Boolean(sendingByConversation[selectedId]) : false
  const isClosed = selectedConversation?.status === "Closed"

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [selectedId, activeMessages.length])

  useEffect(() => {
    if (selectedConversation && (selectedConversation.unreadCount ?? 0) > 0) {
      setSharedConversations((current) => current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreadCount: 0 } : conversation))
    }
  }, [selectedConversation])

  function updateConversation(id: string, patch: Partial<Conversation>) {
    setSharedConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, ...patch } : conversation))
  }

  function openConversation(id: string) {
    setSelectedId(id)
    setMobileView("thread")
    setSendFailed((current) => ({ ...current, [id]: false }))
    updateConversation(id, { unreadCount: 0 })
  }

  function changeStatus(status: ConversationStatus) {
    if (!selectedConversation || status === selectedConversation.status) return
    if (selectedConversation.status === "Closed") {
      if (status === "Open") setConfirmation("reopen")
      return
    }
    if (status === "Closed") {
      setConfirmation("close")
      return
    }
    updateConversation(selectedConversation.id, { status })
    toast.success(`Conversation moved to ${status}`)
  }

  function confirmManagementAction() {
    if (!selectedConversation) return
    if (confirmation === "close") {
      updateConversation(selectedConversation.id, { status: "Closed" })
      toast.success("Conversation closed")
    } else if (confirmation === "reopen") {
      updateConversation(selectedConversation.id, { status: "Open" })
      toast.success("Conversation reopened")
    } else if (confirmation === "transfer") {
      updateConversation(selectedConversation.id, { assignee: transferAssignee })
      toast.success(`Conversation transferred to ${transferAssignee}`)
    }
    setConfirmation(null)
  }

  function assignToMe() {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { assignee: "Naomi Reed" })
    toast.success("Conversation assigned to you")
  }

  function updateAssignment(value: string | null) {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { assignee: value })
    toast.success(value ? `Assigned to ${value}` : "Conversation unassigned")
  }

  function updatePriority(value: ConversationPriority) {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { priority: value })
    toast.success(`Priority changed to ${value}`)
  }

  function toggleBookmark() {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    const nextValue = !selectedConversation.bookmarked
    updateConversation(selectedConversation.id, { bookmarked: nextValue })
    toast.success(nextValue ? "Conversation bookmarked" : "Bookmark removed")
  }

  function handleDraftChange(value: string) {
    if (!selectedId) return
    setDrafts((current) => ({ ...current, [selectedId]: value }))
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const conversationId = selectedId
    event.target.value = ""
    if (!conversationId || files.length === 0) return
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"])
    files.forEach((file) => {
      if (!allowedTypes.has(file.type)) {
        toast.error(`${file.name} is not a supported file type`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than the 5 MB demo limit`)
        return
      }
      const addFile = (url?: string) => {
        const attachment: ConversationAttachment = { name: file.name, type: file.type, size: file.size, sizeLabel: `${(file.size / 1024).toFixed(0)} KB`, url }
        setAttachmentsByConversation((current) => ({ ...current, [conversationId]: [...(current[conversationId] ?? []), attachment] }))
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => addFile(typeof reader.result === "string" ? reader.result : undefined)
        reader.onerror = () => toast.error(`Could not read ${file.name}`)
        reader.readAsDataURL(file)
      } else addFile()
    })
  }

  function removeAttachment(index: number) {
    if (!selectedId) return
    setAttachmentsByConversation((current) => ({ ...current, [selectedId]: (current[selectedId] ?? []).filter((_, itemIndex) => itemIndex !== index) }))
  }

  function sendMessage() {
    if (!selectedConversation || isClosed || isSending || (!currentDraft.trim() && currentAttachments.length === 0)) return
    const conversationId = selectedConversation.id
    const nextMessage: ConversationMessage = {
      id: `${conversationId}-${Date.now()}`,
      from: messageMode === "note" ? "note" : "agent",
      body: currentDraft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      date: new Date().toISOString().slice(0, 10),
      delivery: messageMode === "note" ? undefined : "sent",
      attachments: currentAttachments,
    }
    setSendFailed((current) => ({ ...current, [conversationId]: false }))
    if (demoState === "send-failed" && messageMode === "reply") {
      nextMessage.delivery = "failed"
      updateConversation(conversationId, { messages: [...selectedConversation.messages, nextMessage] })
      setSendFailed((current) => ({ ...current, [conversationId]: true }))
      toast.error("Demo send failed. Your draft is still available to edit.")
      return
    }
    setSendingByConversation((current) => ({ ...current, [conversationId]: true }))
    window.setTimeout(() => {
      const sentAt = new Date().toISOString()
      setSharedConversations((current) => current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation
        const status = messageMode === "reply" && (conversation.status === "Open" || conversation.status === "Pending") ? "In Progress" : conversation.status
        const latestText = nextMessage.body || (nextMessage.attachments?.[0]?.name ? `Attachment: ${nextMessage.attachments[0].name}` : "Message sent")
        return {
          ...conversation,
          messages: [...conversation.messages, { ...nextMessage, delivery: "sent" }],
          status,
          ...(messageMode === "reply" ? { lastMessageAt: sentAt, lastMessage: "Just now", preview: latestText } : {}),
        }
      }))
      setDrafts((current) => ({ ...current, [conversationId]: "" }))
      setAttachmentsByConversation((current) => ({ ...current, [conversationId]: [] }))
      setSendingByConversation((current) => ({ ...current, [conversationId]: false }))
      setMessageSent((current) => ({ ...current, [conversationId]: true }))
      window.setTimeout(() => setMessageSent((current) => ({ ...current, [conversationId]: false })), 1800)
      toast.success(messageMode === "note" ? "Internal note added to demo workspace" : "Message sent in the demo")
    }, 350)
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      sendMessage()
    }
  }

  const confirmationTitle = confirmation === "close" ? "Close this conversation?" : confirmation === "reopen" ? "Reopen this conversation?" : confirmation === "transfer" ? "Transfer conversation?" : ""
  const confirmationDescription = confirmation === "close"
    ? `This will close ${selectedConversation?.customer ?? "this conversation"}. You can reopen it later.`
    : confirmation === "reopen"
      ? `This will move ${selectedConversation?.customer ?? "this conversation"} back to Open so the team can reply again.`
      : confirmation === "transfer"
        ? `Transfer ${selectedConversation?.customer ?? "this conversation"} to the selected agent? The assignment will update in the shared demo table.`
        : ""

  return <div data-parry-theme className={`flex ${embedded ? "h-[calc(90dvh-9rem)] min-h-[460px]" : "h-[min(76vh,900px)] min-h-[620px]"} min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm`}>
    <div className="flex min-h-0 flex-1">
      <div className={`${mobileView === "list" ? "flex" : "hidden"} w-full shrink-0 flex-col border-r md:flex md:w-[260px] lg:w-[270px] xl:w-[300px]`}>
        <div className="flex items-center justify-between border-b px-4 py-3"><div className="flex flex-col gap-0.5"><span className="font-heading text-sm font-semibold">Conversation Workspace</span><span className="text-[11px] text-muted-foreground">Demo inbox · simulated messaging</span></div>{onReturnToTable && <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onReturnToTable}><ArrowLeftIcon data-icon="inline-start" />Table</Button>}</div>
        <ConversationList conversations={conversations} selectedId={selectedId} loading={demoState === "loading"} onSelect={openConversation} />
      </div>
      <main className={`${mobileView === "thread" ? "flex" : "hidden"} min-w-0 flex-1 flex-col md:flex`} aria-label="Conversation thread">
        {selectedConversation ? <>
          <ConversationHeader
            conversation={selectedConversation}
            canReply={!isClosed}
            onStatusChange={changeStatus}
            onAssignToMe={assignToMe}
            onAssign={updateAssignment}
            onPriorityChange={updatePriority}
            onBookmark={toggleBookmark}
            onTransfer={() => { setTransferAssignee(selectedConversation.assignee ?? conversationAssignees[0]); setConfirmation("transfer") }}
            onShowDetails={() => setShowDetails(true)}
            onBack={() => setMobileView("list")}
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" aria-label="Message timeline">
            <MessageTimeline conversation={selectedConversation} messages={activeMessages} endRef={threadEndRef} />
          </div>
          <section aria-label="Message composer" className="shrink-0 border-t bg-background px-3 py-3 sm:px-5 sm:py-4">
            {isClosed ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/50 px-3 py-3"><div className="flex flex-col gap-0.5"><span className="text-sm font-medium">This conversation is closed</span><span className="text-xs text-muted-foreground">Reopen it to send a message or internal note.</span></div><Button type="button" variant="outline" size="sm" onClick={() => setConfirmation("reopen")}>Reopen conversation</Button></div> : <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ToggleGroup type="single" value={messageMode} onValueChange={(value) => { if (value) setMessageMode(value as MessageMode) }} variant="outline" size="sm" aria-label="Message mode">
                  <ToggleGroupItem value="reply" className="h-8 px-3 text-xs"><MessageCircleMoreIcon data-icon="inline-start" />Reply</ToggleGroupItem>
                  <ToggleGroupItem value="note" className="h-8 px-3 text-xs"><FileIcon data-icon="inline-start" />Internal note</ToggleGroupItem>
                </ToggleGroup>
                <span className="hidden text-[11px] text-muted-foreground sm:inline">Enter to send · Shift+Enter for a new line</span>
              </div>
              {messageMode === "note" && <div role="status" className="rounded-md border border-warning/35 bg-warning-soft px-3 py-2 text-xs text-foreground">Internal notes are visible only in this workspace demo.</div>}
              {currentAttachments.length > 0 && <ul aria-label="Selected attachments" className="flex flex-wrap gap-2">{currentAttachments.map((attachment, index) => <li key={`${attachment.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs"><span className="truncate">{attachment.name}</span><span className="shrink-0 text-muted-foreground">{attachment.sizeLabel}</span><Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${attachment.name}`} onClick={() => removeAttachment(index)}><XIcon /></Button></li>)}</ul>}
              <div className={`flex flex-col gap-2 rounded-xl border p-2 ${messageMode === "note" ? "border-warning/40 bg-warning-soft/30" : "bg-card"}`}>
                <Textarea ref={composerRef} aria-label={messageMode === "note" ? "Write an internal note" : "Write a message"} placeholder={messageMode === "note" ? "Add a note for your team…" : "Write a reply…"} value={currentDraft} onChange={(event) => handleDraftChange(event.target.value)} onKeyDown={handleComposerKeyDown} disabled={isSending || demoState === "loading"} rows={2} className="min-h-16 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0" />
                {sendFailed[selectedConversation.id] && <p role="alert" className="px-2 text-xs text-destructive">Could not send. Your draft is still available to edit and retry.</p>}
                <div className="flex items-center justify-between gap-2 border-t pt-2">
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} className="sr-only" id={`attachment-${selectedConversation.id}`} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,.doc,.docx" onChange={handleAttachmentChange} disabled={isSending} />
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()} disabled={isSending}><PaperclipIcon data-icon="inline-start" />Attach</Button>
                    <span className="hidden text-[11px] text-muted-foreground sm:inline">Images, PDF, DOC or TXT · max 5 MB each</span>
                  </div>
                  <Button type="button" size="sm" className="h-8" onClick={sendMessage} disabled={isSending || demoState === "loading" || (!currentDraft.trim() && currentAttachments.length === 0)}>{isSending ? "Sending…" : messageSent[selectedConversation.id] ? <><CheckIcon data-icon="inline-start" />Sent</> : <><SendIcon data-icon="inline-start" />{messageMode === "note" ? "Add note" : "Send message"}</>}</Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground"><span>Fictional demo · messages are not delivered to a real channel</span><span className="hidden sm:inline">Drafts stay with each conversation</span></div>
            </div>}
          </section>
        </> : <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><MessagesSquareIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">No conversation selected</h2><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Choose a conversation from the inbox to read its messages and customer details.</p></div></div>}
      </main>
      {selectedConversation && <aside aria-label="Customer details" className="hidden w-[268px] shrink-0 flex-col border-l lg:flex"><div className="flex h-[57px] items-center justify-between border-b px-4"><h2 className="font-heading text-sm font-semibold">Customer details</h2><Badge variant="outline" className={priorityTone[selectedConversation.priority]}>{selectedConversation.priority}</Badge></div><CustomerDetails conversation={selectedConversation} readOnly={selectedConversation.status === "Closed"} onAssigneeChange={updateAssignment} onPriorityChange={updatePriority} onTransfer={() => { setTransferAssignee(selectedConversation.assignee ?? conversationAssignees[0]); setConfirmation("transfer") }} /></aside>}
    </div>
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent data-parry-theme aria-describedby="workspace-customer-details-description" showCloseButton={false} className="left-auto right-0 top-0 flex h-dvh w-[min(24rem,100vw)] max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-l-xl rounded-r-none p-0 sm:w-96 lg:hidden">
        <DialogHeader className="sr-only"><DialogTitle>Customer details</DialogTitle><DialogDescription id="workspace-customer-details-description">Contact, assignment, priority, and activity for the selected customer.</DialogDescription></DialogHeader>
        {selectedConversation && <><div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-heading text-sm font-semibold">Customer details</h2><Button type="button" variant="ghost" size="icon-sm" aria-label="Close customer details" onClick={() => setShowDetails(false)}><XIcon /></Button></div><CustomerDetails conversation={selectedConversation} readOnly={selectedConversation.status === "Closed"} onAssigneeChange={updateAssignment} onPriorityChange={updatePriority} onTransfer={() => { setShowDetails(false); setTransferAssignee(selectedConversation.assignee ?? conversationAssignees[0]); setConfirmation("transfer") }} /></>}
      </DialogContent>
    </Dialog>
    <Dialog open={confirmation !== null} onOpenChange={(open) => { if (!open) { setConfirmation(null) } }}>
      <DialogContent data-parry-theme aria-describedby="conversation-action-description" className="sm:max-w-md">
        <DialogHeader><DialogTitle>{confirmationTitle}</DialogTitle><DialogDescription id="conversation-action-description">{confirmationDescription}</DialogDescription></DialogHeader>
        {confirmation === "transfer" && <div className="flex flex-col gap-2"><Label htmlFor="transfer-agent">Transfer to</Label><AssigneeSelect id="transfer-agent" value={transferAssignee} onValueChange={(value) => { if (value) setTransferAssignee(value) }} /></div>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => { setConfirmation(null) }}>Cancel</Button><Button type="button" variant={confirmation === "close" ? "destructive" : "default"} onClick={confirmManagementAction}>{confirmation === "close" ? "Close conversation" : confirmation === "reopen" ? "Reopen conversation" : confirmation === "transfer" ? "Transfer conversation" : ""}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}
