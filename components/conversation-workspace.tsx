"use client"

import Image from "next/image"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react"
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
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
type WorkspaceDetailsTab = "customer-info" | "ticket-info"
type WorkspaceSystemEvent = { id: string; date: string; time: string; timestamp: number; text: string }

const statusTone: Record<ConversationStatus, string> = {
  Open: "border-success/35 bg-success-soft text-success",
  "In Progress": "border-info/35 bg-info-soft text-info",
  Pending: "border-warning/35 bg-warning-soft text-warning",
  Closed: "border-border bg-secondary text-secondary-foreground",
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

function AssigneeSelect({ value, onValueChange, id, disabled = false, className = "h-9 w-full" }: { value: string | null; onValueChange: (value: string | null) => void; id: string; disabled?: boolean; className?: string }) {
  return <Select value={value ?? "unassigned"} onValueChange={(next) => onValueChange(next === "unassigned" ? null : next)} disabled={disabled}>
    <SelectTrigger id={id} className={className}><SelectValue /></SelectTrigger>
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
  query,
  status,
  scrollTop,
  onSelect,
  onQueryChange,
  onStatusChange,
  onScrollTopChange,
  showHeading = true,
}: {
  conversations: Conversation[]
  selectedId: string | null
  loading: boolean
  query: string
  status: ConversationStatus | "All"
  scrollTop: number
  onSelect: (id: string) => void
  onQueryChange: (value: string) => void
  onStatusChange: (value: ConversationStatus | "All") => void
  onScrollTopChange: (value: number) => void
  showHeading?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return conversations.filter((conversation) => {
      const matchesQuery = !normalized || [conversation.customer, conversation.id, conversation.preview, ...conversation.messages.map(({ body }) => body)].some((value) => value.toLocaleLowerCase().includes(normalized))
      return matchesQuery && (status === "All" || conversation.status === status)
    })
  }, [conversations, query, status])

  useLayoutEffect(() => {
    if (scrollRef.current && scrollRef.current.scrollTop !== scrollTop) scrollRef.current.scrollTop = scrollTop
  }, [scrollTop])

  return <section aria-label="Conversation list" className="flex min-h-0 min-w-0 flex-1 flex-col">
    <div className="flex flex-col gap-2.5 border-b px-3 py-3">
      {showHeading && <div className="flex min-w-0 flex-col gap-0.5"><h2 className="font-heading text-sm font-semibold">Inbox</h2><p className="text-xs text-muted-foreground">{conversations.length} conversations</p></div>}
      <div className="relative">
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search conversations" placeholder="Search conversations" value={query} onChange={(event) => onQueryChange(event.target.value)} className="h-9 pl-9" />
      </div>
      <ToggleGroup type="single" value={status} onValueChange={(value) => { if (value) onStatusChange(value as ConversationStatus | "All") }} variant="outline" size="sm" aria-label="Filter conversations by status" className="max-w-full flex-wrap justify-start">
        {(["All", ...conversationStatuses] as const).map((value) => <ToggleGroupItem key={value} value={value} className="h-7 px-2.5 text-xs">{value}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
    <div ref={scrollRef} onScroll={(event) => onScrollTopChange(event.currentTarget.scrollTop)} className="min-h-0 flex-1 overflow-y-auto">
      {loading ? <div aria-label="Loading conversations" className="flex flex-col gap-2 p-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex gap-3 rounded-lg p-3"><Skeleton className="size-9 shrink-0 rounded-full" /><div className="flex min-w-0 flex-1 flex-col gap-2"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div></div>)}</div> : filtered.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 text-center"><SearchIcon aria-hidden="true" className="size-5 text-muted-foreground" /><p className="text-sm font-medium">No conversations found</p><p className="text-xs leading-relaxed text-muted-foreground">Try a different search or status filter.</p></div> : <ul className="flex flex-col p-2">
        {filtered.map((conversation) => {
          const active = conversation.id === selectedId
          return <li key={conversation.id}>
            <button type="button" onClick={() => onSelect(conversation.id)} aria-current={active ? "true" : undefined} className={`flex w-full min-w-0 items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-accent text-accent-foreground" : "hover:bg-muted/70"}`}>
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
  systemEvents,
}: {
  conversation: Conversation
  messages: ConversationMessage[]
  systemEvents: WorkspaceSystemEvent[]
}) {
  if (messages.length === 0 && systemEvents.length === 0) return <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><MessageCircleMoreIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div><div className="flex flex-col gap-1"><p className="font-medium">No messages yet</p><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Start the conversation with a reply or add an internal note for your team.</p></div></div>
  const timeline = [
    ...messages.map((message, index) => {
      const date = message.date ?? "2026-10-27"
      const timestamp = Date.parse(`${date} ${message.time}`)
      return { kind: "message" as const, message, date, key: message.id ?? `${date}-${message.time}-${index}`, sortAt: Number.isNaN(timestamp) ? index : timestamp }
    }),
    ...systemEvents.map((event) => ({ kind: "event" as const, event, date: event.date, key: event.id, sortAt: event.timestamp })),
  ].sort((left, right) => left.sortAt - right.sortAt)

  return <div className="flex flex-col gap-4 px-4 py-4 @2xl:px-6 @2xl:py-5">
    {timeline.map((item, index) => {
      const previousDate = index > 0 ? timeline[index - 1].date : ""
      const showDate = item.date !== previousDate
      if (item.kind === "event") return <div key={item.key} className="flex flex-col gap-2">
        {showDate && <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-border/70" /><span className="text-[11px] text-muted-foreground">{dateLabel(item.date)}</span><span className="h-px flex-1 bg-border/70" /></div>}
        <div className="flex justify-center"><span className="rounded-full border bg-muted/50 px-3 py-1 text-[11px] text-muted-foreground">{item.event.text} · {item.event.time}</span></div>
      </div>
      const { message } = item
      const isNote = message.from === "note"
      const isAgent = message.from === "agent"
      const sender = isNote ? "Internal note" : isAgent ? "Support team" : conversation.customer
      return <div key={item.key} className="flex flex-col gap-2">
        {showDate && <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-border/70" /><span className="text-[11px] text-muted-foreground">{dateLabel(item.date)}</span><span className="h-px flex-1 bg-border/70" /></div>}
        <div className={`flex flex-col gap-1.5 ${isAgent ? "items-end" : "items-start"}`}>
          <span className="px-1 text-[11px] text-muted-foreground">{sender}{isNote ? " · Workspace only" : ""}</span>
          <div className={`max-w-[min(86%,34rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isNote ? "border border-warning/35 bg-warning-soft text-foreground" : isAgent ? "bg-primary/10 text-foreground" : "border bg-muted/50 text-card-foreground"}`}>
            {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
            {message.attachments?.length ? <div className="mt-2 flex flex-col gap-2">{message.attachments.map((attachment, attachmentIndex) => <AttachmentPreview key={`${attachment.name}-${attachmentIndex}`} attachment={attachment} />)}</div> : null}
          </div>
          <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">{message.time}{isAgent && message.delivery === "sent" && <CheckCheckIcon aria-label="Sent" className="size-3.5 text-primary" />}{isAgent && message.delivery === "failed" && <CircleHelpIcon aria-label="Failed to send" className="size-3.5 text-destructive" />}</span>
        </div>
      </div>
    })}
  </div>
}

function CustomerDetailsSection({
  id,
  title,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
}: {
  id: string
  title: string
  defaultOpen?: boolean
  open: boolean | undefined
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return <details id={id} open={open ?? defaultOpen} onToggle={(event) => onOpenChange(event.currentTarget.open)} className="group border-b border-border/70 last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{title}</span><ChevronDownIcon aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-open:rotate-180" /></summary>
    <div className="pb-3 text-xs leading-relaxed">{children}</div>
  </details>
}

function CustomerDetails({
  conversation,
  conversations,
  events,
  readOnly,
  activeTab,
  onActiveTabChange,
  openSections,
  onSectionChange,
  onAssigneeChange,
  onPriorityChange,
  onStatusChange,
  onTransfer,
}: {
  conversation: Conversation
  conversations: Conversation[]
  events: WorkspaceSystemEvent[]
  readOnly: boolean
  activeTab: WorkspaceDetailsTab
  onActiveTabChange: (tab: WorkspaceDetailsTab) => void
  openSections: Record<string, boolean>
  onSectionChange: (section: string, open: boolean) => void
  onAssigneeChange: (value: string | null) => void
  onPriorityChange: (value: ConversationPriority) => void
  onStatusChange: (value: ConversationStatus) => void
  onTransfer: () => void
}) {
  const tags = conversation.tags?.length ? conversation.tags : ["Customer", conversation.channel]
  const phone = conversation.phone ?? "+1 (555) 014-0284"
  const relatedConversations = conversations.filter((item) => item.email === conversation.email && item.id !== conversation.id)
  const section = (key: string, title: string, defaultOpen: boolean, children: ReactNode) => <CustomerDetailsSection id={`${conversation.id}-${key}`} title={title} defaultOpen={defaultOpen} open={openSections[key]} onOpenChange={(open) => onSectionChange(key, open)}>{children}</CustomerDetailsSection>

  return <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as WorkspaceDetailsTab)} className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
    <TabsList aria-label="Customer and ticket details" className="mx-0 mt-0 h-12 w-full justify-stretch">
      <TabsTrigger value="customer-info" className="h-full px-3 text-xs">Customer Info</TabsTrigger>
      <TabsTrigger value="ticket-info" className="h-full px-3 text-xs">Ticket Info</TabsTrigger>
    </TabsList>
    <TabsContent value="customer-info" className="m-0 min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
      <div className="flex flex-col items-center gap-1.5 border-b border-border/70 px-2 pb-4 pt-2 text-center">
        <Avatar aria-label={conversation.customer} className="size-14 shrink-0"><AvatarFallback className="bg-muted text-base font-semibold text-foreground">{conversation.initials}</AvatarFallback></Avatar>
        <h3 className="font-heading text-sm font-semibold">{conversation.customer}</h3>
        <p className="text-xs text-muted-foreground">{conversation.company}</p>
        <div className="mt-1 flex items-center gap-2">
          <Button asChild variant="outline" size="icon-sm" className="size-8" aria-label={`Email ${conversation.customer}`}><a href={`mailto:${conversation.email}`}><AtSignIcon /></a></Button>
          <Button asChild variant="outline" size="icon-sm" className="size-8" aria-label={`Call ${conversation.customer}`}><a href={`tel:${phone.replace(/[^\d+]/g, "")}`}><PhoneIcon /></a></Button>
          <Button asChild variant="outline" size="icon-sm" className="size-8" aria-label={`Message ${conversation.customer} on WhatsApp`}><a href={`https://wa.me/${phone.replace(/\D/g, "")}`}><MessageCircleMoreIcon /></a></Button>
        </div>
      </div>
      {section("contact", "Contact information", true, <dl className="flex flex-col gap-2.5">
        <div className="flex min-w-0 items-start gap-2"><AtSignIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><dt className="text-[11px] text-muted-foreground">Email</dt><dd className="break-all">{conversation.email}</dd></div></div>
        <div className="flex min-w-0 items-start gap-2"><PhoneIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><dt className="text-[11px] text-muted-foreground">Phone</dt><dd>{phone}</dd></div></div>
        <div className="flex min-w-0 items-start gap-2"><UsersRoundIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0"><dt className="text-[11px] text-muted-foreground">Company</dt><dd>{conversation.company}</dd></div></div>
      </dl>)}
      {section("tags", "Tags", true, <div className="flex flex-wrap gap-1.5">{tags.map((tag) => <Badge key={tag} variant="secondary" className="h-6 px-2 text-[11px] font-normal">{tag}</Badge>)}</div>)}
      {section("attributes", "Customer attributes", false, <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2"><dt className="text-muted-foreground">Company</dt><dd className="text-right">{conversation.company}</dd><dt className="text-muted-foreground">Preferred channel</dt><dd className="text-right">{conversation.channel}</dd><dt className="text-muted-foreground">Open conversations</dt><dd className="text-right">{conversations.filter((item) => item.email === conversation.email && item.status !== "Closed").length}</dd></dl>)}
      {section("recent", "Recent conversations", false, relatedConversations.length ? <ul className="flex flex-col gap-3">{relatedConversations.map((item) => <li key={item.id} className="flex min-w-0 items-start gap-2"><ChannelIcon channel={item.channel} className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="truncate">{item.preview}</span><span className="truncate font-mono text-[11px] text-muted-foreground">{item.id} · {item.lastMessage}</span></span><Badge variant="outline" className={`${statusTone[item.status]} h-5 shrink-0 px-1.5 text-[10px]`}>{item.status}</Badge></li>)}</ul> : <p className="text-muted-foreground">No earlier conversations for this customer in the demo.</p>)}
    </TabsContent>
    <TabsContent value="ticket-info" className="m-0 min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
      {section("ticket", "Conversation metadata", true, <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2"><dt className="text-muted-foreground">ID</dt><dd className="text-right font-mono">{conversation.id}</dd><dt className="text-muted-foreground">Channel</dt><dd className="text-right">{conversation.channel}</dd><dt className="text-muted-foreground">Category</dt><dd className="text-right">{conversation.category ?? "General support"}</dd><dt className="text-muted-foreground">SLA</dt><dd className="text-right">{conversation.sla}</dd><dt className="self-center text-muted-foreground">Status</dt><dd className="flex justify-end"><Select value={conversation.status} onValueChange={(value) => onStatusChange(value as ConversationStatus)}><SelectTrigger aria-label="Ticket status" className="h-7 w-28 border-transparent bg-muted/50 px-2 text-[11px] shadow-none"><SelectValue /></SelectTrigger><SelectContent data-parry-theme><SelectGroup>{conversationStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectGroup></SelectContent></Select></dd></dl>)}
      {section("assignment", "Assignee & priority", true, <div className="flex flex-col gap-3"><div className="flex flex-col gap-1.5"><Label htmlFor={`assignee-${conversation.id}`} className="text-[11px] text-muted-foreground">Assignee</Label><AssigneeSelect id={`assignee-${conversation.id}`} value={conversation.assignee} onValueChange={onAssigneeChange} disabled={readOnly} className="h-8 w-full text-xs" /></div><div className="flex flex-col gap-1.5"><Label htmlFor={`priority-${conversation.id}`} className="text-[11px] text-muted-foreground">Priority</Label><PrioritySelect id={`priority-${conversation.id}`} value={conversation.priority} onValueChange={onPriorityChange} disabled={readOnly} /></div></div>)}
      {section("activity", "Activity", false, <div className="flex flex-col gap-2.5">{events.length ? events.slice(-4).reverse().map((event) => <div key={event.id} className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" /><span>{event.text}<span className="block text-[11px] text-muted-foreground">{event.date} · {event.time}</span></span></div>) : <p className="text-muted-foreground">Latest customer message via {conversation.channel} · {conversation.lastMessage}</p>}</div>)}
      <Button type="button" variant="outline" size="sm" className="mt-3 h-8 w-full text-xs" onClick={onTransfer} disabled={readOnly}><ArrowRightLeftIcon data-icon="inline-start" />Transfer conversation</Button>
    </TabsContent>
  </Tabs>
}

function ConversationHeader({
  conversation,
  canReply,
  listCollapsed,
  detailsCollapsed,
  onStatusChange,
  onAssignToMe,
  onAssign,
  onPriorityChange,
  onBookmark,
  onTransfer,
  onToggleList,
  onOpenList,
  onToggleDetails,
  onOpenDetails,
  onBack,
}: {
  conversation: Conversation
  canReply: boolean
  listCollapsed: boolean
  detailsCollapsed: boolean
  onStatusChange: (status: ConversationStatus) => void
  onAssignToMe: () => void
  onAssign: (name: string | null) => void
  onPriorityChange: (priority: ConversationPriority) => void
  onBookmark: () => void
  onTransfer: () => void
  onToggleList: () => void
  onOpenList: () => void
  onToggleDetails: () => void
  onOpenDetails: () => void
  onBack?: () => void
}) {
  const isClosed = conversation.status === "Closed"
  const assignmentLabel = conversation.assignee ? `Assigned to ${conversation.assignee}` : "Unassigned"
  return <header className="flex h-14 shrink-0 min-w-0 items-center gap-1 border-b px-2 @2xl:gap-1.5 @2xl:px-2.5 @7xl:gap-2 @7xl:px-3">
    {onBack && <Button type="button" variant="ghost" size="icon-lg" aria-label="Back to conversation list" onClick={onBack} className="shrink-0 @3xl:hidden"><ArrowLeftIcon /></Button>}
    <Button type="button" variant="ghost" size="icon-lg" aria-label="Open conversation list" onClick={onOpenList} className="hidden shrink-0 @3xl:flex @5xl:hidden"><MessagesSquareIcon /></Button>
    <Button type="button" variant="ghost" size="icon-lg" aria-label={listCollapsed ? "Expand conversation list" : "Collapse conversation list"} onClick={onToggleList} className="hidden shrink-0 @5xl:flex">{listCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}</Button>
    <Avatar aria-hidden="true" className="size-8 shrink-0"><AvatarFallback className="bg-muted text-xs font-medium text-foreground">{conversation.initials}</AvatarFallback></Avatar>
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2"><h2 className="min-w-0 truncate font-heading text-sm font-semibold">{conversation.customer}</h2><Badge variant="outline" className={`${statusTone[conversation.status]} h-5 shrink-0 px-1.5 text-[10px]`}>{conversation.status}</Badge></div>
      <div className="flex min-w-0 items-center gap-0.5 text-[10px] text-muted-foreground @2xl:text-[11px] @7xl:gap-1"><ChannelIcon channel={conversation.channel} className="size-3 shrink-0" /><span className="shrink-0">{conversation.channel}</span><span aria-hidden="true" className="hidden @7xl:inline">·</span><span className="hidden min-w-0 truncate font-mono @7xl:inline">{conversation.id}</span></div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" aria-label={assignmentLabel} title={assignmentLabel} className="h-9 max-w-44 shrink-0 gap-1.5 border-border bg-muted/40 px-2 text-[11px] @2xl:max-w-48 @7xl:max-w-56" disabled={!canReply}><UserRoundIcon data-icon="inline-start" /><span className="sr-only min-w-0 truncate @2xl:not-sr-only">{assignmentLabel}</span><ChevronDownIcon data-icon="inline-end" className="hidden size-3 @2xl:inline" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent data-parry-theme align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onAssignToMe} disabled={!canReply}><UserRoundIcon data-icon="inline-start" />Assign to Me</DropdownMenuItem>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}><UsersRoundIcon data-icon="inline-start" />Change Assignee</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup><DropdownMenuItem disabled={!canReply} onSelect={() => onAssign(null)}>Unassign</DropdownMenuItem>{conversationAssignees.map((name) => <DropdownMenuItem key={name} disabled={!canReply} onSelect={() => onAssign(name)}>{name}{name === conversation.assignee && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button type="button" variant="outline" size="sm" aria-label={isClosed ? "Reopen Conversation" : "Close Conversation"} onClick={() => onStatusChange(isClosed ? "Open" : "Closed")} className="h-9 shrink-0 border-primary/40 bg-primary/5 px-2 text-[11px] text-primary hover:bg-primary/10 @2xl:px-2.5"><span className="hidden @2xl:inline">{isClosed ? "Reopen Conversation" : "Close Conversation"}</span><span className="@2xl:hidden">{isClosed ? "Reopen" : "Close"}</span></Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-lg" aria-label="Conversation actions" className="shrink-0"><MoreHorizontalIcon /></Button></DropdownMenuTrigger>
      <DropdownMenuContent data-parry-theme align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}>Change priority</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup>{conversationPriorities.map((priority) => <DropdownMenuItem key={priority} disabled={!canReply} onSelect={() => onPriorityChange(priority)}>{priority}{priority === conversation.priority && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
          <DropdownMenuSub><DropdownMenuSubTrigger disabled={!canReply}>Change status</DropdownMenuSubTrigger><DropdownMenuSubContent data-parry-theme><DropdownMenuGroup>{conversationStatuses.map((status) => <DropdownMenuItem key={status} disabled={!canReply} onSelect={() => onStatusChange(status)}>{status}{status === conversation.status && <CheckIcon className="ml-auto size-4" />}</DropdownMenuItem>)}</DropdownMenuGroup></DropdownMenuSubContent></DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onBookmark} disabled={!canReply}><BookmarkIcon data-icon="inline-start" />{conversation.bookmarked ? "Remove bookmark" : "Bookmark conversation"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={onTransfer} disabled={!canReply}><ArrowRightLeftIcon data-icon="inline-start" />Transfer conversation</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button type="button" variant="ghost" size="icon-lg" aria-label={detailsCollapsed ? "Expand customer details" : "Collapse customer details"} onClick={onToggleDetails} className="hidden shrink-0 @5xl:flex">{detailsCollapsed ? <PanelRightOpenIcon /> : <PanelRightCloseIcon />}</Button>
    <Button type="button" variant="ghost" size="icon-lg" aria-label="Open customer details" className="shrink-0 @5xl:hidden" onClick={onOpenDetails}><UserRoundIcon /></Button>
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
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [listDrawerOpen, setListDrawerOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | "All">("All")
  const [listScrollTop, setListScrollTop] = useState(0)
  const [detailsTabs, setDetailsTabs] = useState<Record<string, WorkspaceDetailsTab>>({})
  const [detailsSections, setDetailsSections] = useState<Record<string, Record<string, boolean>>>({})
  const [systemEvents, setSystemEvents] = useState<Record<string, WorkspaceSystemEvent[]>>({})
  const [messageMode, setMessageMode] = useState<MessageMode>("reply")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [attachmentsByConversation, setAttachmentsByConversation] = useState<Record<string, ConversationAttachment[]>>({})
  const [sendingByConversation, setSendingByConversation] = useState<Record<string, boolean>>({})
  const [sendFailed, setSendFailed] = useState<Record<string, boolean>>({})
  const [confirmation, setConfirmation] = useState<ConfirmationAction>(null)
  const [transferAssignee, setTransferAssignee] = useState<string>(conversationAssignees[0])
  const [messageSent, setMessageSent] = useState<Record<string, boolean>>({})
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const threadScrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedConversation = conversations.find(({ id }) => id === selectedId) ?? null
  const activeMessages = selectedConversation ? demoState === "empty-thread" ? [] : selectedConversation.messages : []
  const currentDraft = selectedId ? drafts[selectedId] ?? "" : ""
  const currentAttachments = selectedId ? attachmentsByConversation[selectedId] ?? [] : []
  const isSending = selectedId ? Boolean(sendingByConversation[selectedId]) : false
  const isClosed = selectedConversation?.status === "Closed"
  const activeSystemEvents = selectedId ? systemEvents[selectedId] ?? [] : []
  const activeDetailsTab = selectedId ? detailsTabs[selectedId] ?? "customer-info" : "customer-info"
  const activeDetailsSections = selectedId ? detailsSections[selectedId] ?? {} : {}

  useEffect(() => {
    const thread = threadScrollRef.current
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" })
  }, [selectedId, activeMessages.length, activeSystemEvents.length])

  useEffect(() => {
    if (selectedConversation && (selectedConversation.unreadCount ?? 0) > 0) {
      setSharedConversations((current) => current.map((conversation) => conversation.id === selectedConversation.id ? { ...conversation, unreadCount: 0 } : conversation))
    }
  }, [selectedConversation])

  function updateConversation(id: string, patch: Partial<Conversation>) {
    setSharedConversations((current) => current.map((conversation) => conversation.id === id ? { ...conversation, ...patch } : conversation))
  }

  function recordSystemEvent(conversationId: string, text: string) {
    const timestamp = Date.now()
    const date = new Date(timestamp)
    const event: WorkspaceSystemEvent = {
      id: `${conversationId}-event-${timestamp}`,
      date: date.toISOString().slice(0, 10),
      time: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      timestamp,
      text,
    }
    setSystemEvents((current) => ({ ...current, [conversationId]: [...(current[conversationId] ?? []), event] }))
  }

  function openConversation(id: string) {
    setSelectedId(id)
    setMobileView("thread")
    setListDrawerOpen(false)
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
    recordSystemEvent(selectedConversation.id, `Status changed to ${status}`)
    toast.success(`Conversation moved to ${status}`)
  }

  function confirmManagementAction() {
    if (!selectedConversation) return
    if (confirmation === "close") {
      updateConversation(selectedConversation.id, { status: "Closed" })
      recordSystemEvent(selectedConversation.id, "Conversation closed")
      toast.success("Conversation closed")
    } else if (confirmation === "reopen") {
      updateConversation(selectedConversation.id, { status: "Open" })
      recordSystemEvent(selectedConversation.id, "Conversation reopened")
      toast.success("Conversation reopened")
    } else if (confirmation === "transfer") {
      updateConversation(selectedConversation.id, { assignee: transferAssignee })
      recordSystemEvent(selectedConversation.id, `Conversation transferred to ${transferAssignee}`)
      toast.success(`Conversation transferred to ${transferAssignee}`)
    }
    setConfirmation(null)
  }

  function assignToMe() {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { assignee: "Naomi Reed" })
    recordSystemEvent(selectedConversation.id, "Assigned to Naomi Reed")
    toast.success("Conversation assigned to you")
  }

  function updateAssignment(value: string | null) {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { assignee: value })
    recordSystemEvent(selectedConversation.id, value ? `Assigned to ${value}` : "Conversation unassigned")
    toast.success(value ? `Assigned to ${value}` : "Conversation unassigned")
  }

  function updatePriority(value: ConversationPriority) {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    updateConversation(selectedConversation.id, { priority: value })
    recordSystemEvent(selectedConversation.id, `Priority changed to ${value}`)
    toast.success(`Priority changed to ${value}`)
  }

  function toggleBookmark() {
    if (!selectedConversation || selectedConversation.status === "Closed") return
    const nextValue = !selectedConversation.bookmarked
    updateConversation(selectedConversation.id, { bookmarked: nextValue })
    recordSystemEvent(selectedConversation.id, nextValue ? "Conversation bookmarked" : "Bookmark removed")
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
      if (messageMode === "reply" && (selectedConversation.status === "Open" || selectedConversation.status === "Pending")) recordSystemEvent(conversationId, "Status changed to In Progress after reply")
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

  function startTransfer(fromDetailsDrawer = false) {
    if (!selectedConversation) return
    if (fromDetailsDrawer) setShowDetails(false)
    setTransferAssignee(selectedConversation.assignee ?? conversationAssignees[0])
    setConfirmation("transfer")
  }

  const customerDetailsContent = selectedConversation ? <CustomerDetails
    conversation={selectedConversation}
    conversations={conversations}
    events={activeSystemEvents}
    readOnly={selectedConversation.status === "Closed"}
    activeTab={activeDetailsTab}
    onActiveTabChange={(tab) => { if (selectedId) setDetailsTabs((current) => ({ ...current, [selectedId]: tab })) }}
    openSections={activeDetailsSections}
    onSectionChange={(section, open) => { if (selectedId) setDetailsSections((current) => ({ ...current, [selectedId]: { ...(current[selectedId] ?? {}), [section]: open } })) }}
    onAssigneeChange={updateAssignment}
    onPriorityChange={updatePriority}
    onStatusChange={changeStatus}
    onTransfer={() => startTransfer(true)}
  /> : null

  return <div data-parry-theme className={`template-preview-container flex ${embedded ? "h-[calc(80dvh-8rem)] min-h-[440px]" : "h-[min(76vh,900px)] min-h-[620px]"} min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm`}>
    <div className="flex min-h-0 flex-1">
      <div className={`${mobileView === "list" ? "flex" : "hidden"} w-full shrink-0 flex-col border-r @3xl:hidden ${leftCollapsed ? "@5xl:hidden" : "@5xl:flex @5xl:w-[260px] @7xl:w-[280px]"}`}>
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3"><div className="flex min-w-0 flex-col gap-0.5"><span className="truncate font-heading text-sm font-semibold">Conversations</span><span className="text-[11px] text-muted-foreground">{conversations.length} conversations</span></div>{onReturnToTable && <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0 text-xs" onClick={onReturnToTable}><ArrowLeftIcon data-icon="inline-start" />Table</Button>}</div>
        <ConversationList conversations={conversations} selectedId={selectedId} loading={demoState === "loading"} query={query} status={statusFilter} scrollTop={listScrollTop} onSelect={openConversation} onQueryChange={setQuery} onStatusChange={setStatusFilter} onScrollTopChange={setListScrollTop} showHeading={false} />
      </div>
      <main className={`${mobileView === "thread" ? "flex" : "hidden @3xl:flex"} min-w-0 flex-1 flex-col`} aria-label="Conversation thread">
        {selectedConversation ? <>
          <ConversationHeader
            conversation={selectedConversation}
            canReply={!isClosed}
            listCollapsed={leftCollapsed}
            detailsCollapsed={rightCollapsed}
            onStatusChange={changeStatus}
            onAssignToMe={assignToMe}
            onAssign={updateAssignment}
            onPriorityChange={updatePriority}
            onBookmark={toggleBookmark}
            onTransfer={() => startTransfer()}
            onToggleList={() => setLeftCollapsed((current) => !current)}
            onOpenList={() => setListDrawerOpen(true)}
            onToggleDetails={() => setRightCollapsed((current) => !current)}
            onOpenDetails={() => setShowDetails(true)}
            onBack={() => setMobileView("list")}
          />
          <div ref={threadScrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/10" aria-label="Message timeline">
            <MessageTimeline conversation={selectedConversation} messages={activeMessages} systemEvents={activeSystemEvents} />
          </div>
          <section aria-label="Message composer" className="shrink-0 px-3 pb-3 pt-2 @2xl:px-4 @2xl:pb-4">
            {isClosed ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm"><div className="flex flex-col gap-0.5"><span className="text-sm font-medium">This conversation is closed</span><span className="text-xs text-muted-foreground">Reopen it to send a message or internal note.</span></div><Button type="button" variant="outline" size="sm" onClick={() => setConfirmation("reopen")}>Reopen conversation</Button></div> : <div className="flex flex-col gap-1.5">
              <div className={`flex flex-col gap-1.5 rounded-2xl border p-2.5 shadow-md ${messageMode === "note" ? "border-warning/40 bg-warning-soft/30" : "bg-card"}`}>
                <div className="flex items-center justify-between gap-2">
                  <ToggleGroup type="single" value={messageMode} onValueChange={(value) => { if (value) setMessageMode(value as MessageMode) }} variant="outline" size="sm" aria-label="Message mode">
                    <ToggleGroupItem value="reply" className="h-7 px-2.5 text-xs"><MessageCircleMoreIcon data-icon="inline-start" />Reply</ToggleGroupItem>
                    <ToggleGroupItem value="note" className="h-7 px-2.5 text-xs"><FileIcon data-icon="inline-start" />Internal note</ToggleGroupItem>
                  </ToggleGroup>
                  <span className="hidden text-[10px] text-muted-foreground @2xl:inline">Enter to send · Shift+Enter for a new line</span>
                </div>
                {messageMode === "note" && <div role="status" className="rounded-md border border-warning/35 bg-warning-soft px-2.5 py-1.5 text-[11px] text-foreground">Internal notes are visible only in this workspace demo.</div>}
                {currentAttachments.length > 0 && <ul aria-label="Selected attachments" className="flex flex-wrap gap-2">{currentAttachments.map((attachment, index) => <li key={`${attachment.name}-${index}`} className="flex max-w-full items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs"><span className="truncate">{attachment.name}</span><span className="shrink-0 text-muted-foreground">{attachment.sizeLabel}</span><Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${attachment.name}`} onClick={() => removeAttachment(index)}><XIcon /></Button></li>)}</ul>}
                <Textarea ref={composerRef} aria-label={messageMode === "note" ? "Write an internal note" : "Write a message"} placeholder={messageMode === "note" ? "Add a note for your team…" : "Write a reply…"} value={currentDraft} onChange={(event) => handleDraftChange(event.target.value)} onKeyDown={handleComposerKeyDown} disabled={isSending || demoState === "loading"} rows={2} className="max-h-32 min-h-14 resize-y border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0" />
                {sendFailed[selectedConversation.id] && <p role="alert" className="px-1 text-xs text-destructive">Could not send. Your draft is still available to edit and retry.</p>}
                <div className="flex items-center justify-between gap-2 border-t pt-1.5">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <input ref={fileInputRef} className="sr-only" id={`attachment-${selectedConversation.id}`} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,.doc,.docx" onChange={handleAttachmentChange} disabled={isSending} />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Attach files" onClick={() => fileInputRef.current?.click()} disabled={isSending}><PaperclipIcon /></Button>
                    <span className="hidden truncate text-[10px] text-muted-foreground @2xl:inline">Images, PDF, DOC or TXT · max 5 MB each</span>
                  </div>
                  <Button type="button" size="sm" className="h-8 shrink-0" onClick={sendMessage} disabled={isSending || demoState === "loading" || (!currentDraft.trim() && currentAttachments.length === 0)}>{isSending ? "Sending…" : messageSent[selectedConversation.id] ? <><CheckIcon data-icon="inline-start" />Sent</> : <><SendIcon data-icon="inline-start" />{messageMode === "note" ? "Add note" : "Send"}</>}</Button>
                </div>
              </div>
              <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground"><span>Fictional demo · messages are not delivered</span><span className="hidden @2xl:inline">Drafts stay with each conversation</span></div>
            </div>}
          </section>
        </> : <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-muted"><MessagesSquareIcon aria-hidden="true" className="size-5 text-muted-foreground" /></div><div className="flex flex-col gap-1"><h2 className="font-heading text-base font-semibold">No conversation selected</h2><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Choose a conversation from the inbox to read its messages and customer details.</p></div></div>}
      </main>
      {selectedConversation && !rightCollapsed && <aside aria-label="Customer details" className="hidden w-[250px] shrink-0 flex-col border-l @7xl:w-[300px] @5xl:flex"><div className="flex h-14 shrink-0 items-center justify-between border-b px-3"><h2 className="font-heading text-sm font-semibold">Customer details</h2><Badge variant="outline" className={`${priorityTone[selectedConversation.priority]} h-5 px-1.5 text-[10px]`}>{selectedConversation.priority}</Badge></div>{customerDetailsContent}</aside>}
    </div>
    <Dialog open={listDrawerOpen} onOpenChange={setListDrawerOpen}>
      <DialogContent data-parry-theme aria-describedby="workspace-list-description" showCloseButton={false} className="left-0 right-auto top-0 flex h-dvh w-[min(22rem,88vw)] max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-l-none rounded-r-xl p-0 md:flex lg:hidden">
        <DialogHeader className="sr-only"><DialogTitle>Conversation list</DialogTitle><DialogDescription id="workspace-list-description">Search and select a conversation.</DialogDescription></DialogHeader>
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3"><div className="flex min-w-0 flex-col gap-0.5"><h2 className="font-heading text-sm font-semibold">Conversations</h2><span className="text-[11px] text-muted-foreground">{conversations.length} conversations</span></div><Button type="button" variant="ghost" size="icon-lg" aria-label="Close conversation list" onClick={() => setListDrawerOpen(false)}><XIcon /></Button></div>
        <ConversationList conversations={conversations} selectedId={selectedId} loading={demoState === "loading"} query={query} status={statusFilter} scrollTop={listScrollTop} onSelect={openConversation} onQueryChange={setQuery} onStatusChange={setStatusFilter} onScrollTopChange={setListScrollTop} showHeading={false} />
      </DialogContent>
    </Dialog>
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent data-parry-theme aria-describedby="workspace-customer-details-description" showCloseButton={false} className="left-auto right-0 top-0 flex h-dvh w-[min(24rem,100vw)] max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-l-xl rounded-r-none p-0 sm:w-96 lg:hidden">
        <DialogHeader className="sr-only"><DialogTitle>Customer details</DialogTitle><DialogDescription id="workspace-customer-details-description">Customer profile and ticket details for the selected conversation.</DialogDescription></DialogHeader>
        {selectedConversation && <><div className="flex h-14 shrink-0 items-center justify-between border-b px-3"><div className="flex items-center gap-2"><h2 className="font-heading text-sm font-semibold">Customer details</h2><Badge variant="outline" className={`${priorityTone[selectedConversation.priority]} h-5 px-1.5 text-[10px]`}>{selectedConversation.priority}</Badge></div><Button type="button" variant="ghost" size="icon-lg" aria-label="Close customer details" onClick={() => setShowDetails(false)}><XIcon /></Button></div>{customerDetailsContent}</>}
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
