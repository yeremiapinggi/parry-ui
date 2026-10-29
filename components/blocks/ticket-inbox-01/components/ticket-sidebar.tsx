"use client"

import { useState } from "react"
import {
  ArrowUpRightIcon,
  Building2Icon,
  CakeIcon,
  ChevronDownIcon,
  CircleDotIcon,
  GitMergeIcon,
  IdCardIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  PlusIcon,
  ShieldAlertIcon,
  UserRoundXIcon,
  XIcon,
} from "lucide-react"

import { cn } from "cn"

import { team } from "@/components/blocks/_data/team"
import type { Sentiment, ThreadItem, Ticket, TicketStatus } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { Stamp } from "@/components/blocks/_parts/message-bubble"
import { age, byTime, clock, monthDayTime, relativeTime, shortDateTime } from "@/components/blocks/_parts/time"
import { channelMeta } from "@/components/blocks/channel-meta"
import { sentimentMeta, shortcuts, statusMeta } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timeline, TimelineItem } from "@/components/ui/timeline"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const customFields = [
  { id: "caller-case", label: "Caller case", options: ["Customer", "Dealer", "KTB"], value: "Customer" },
  { id: "warranty", label: "Warranty", options: ["Active", "Expired"], value: "Active" },
  { id: "sub-1", label: "Sub category 1", options: ["After sales", "Sales"], value: "After sales" },
  { id: "sub-2", label: "Sub category 2", options: ["Service", "Spare part", "Warranty claim"] },
  { id: "sub-3", label: "Sub category 3", options: ["AC", "Engine", "Body"] },
]

// One label/value grid for every section, so labels line up down the whole sidebar.
const rowGrid = "grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-3"

function Row({ label, htmlFor, labelId, children }: { label: string; htmlFor?: string; labelId?: string; children: React.ReactNode }) {
  return (
    <div className={cn(rowGrid, "min-h-8")}>
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="text-xs font-normal text-muted-foreground">
          {label}
        </Label>
      ) : (
        <span id={labelId} className="text-xs text-muted-foreground">
          {label}
        </span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Field({ id, label, options, value }: { id: string; label: string; options: string[]; value?: string }) {
  return (
    <Row label={label} htmlFor={id}>
      <Select defaultValue={value}>
        <SelectTrigger id={id} size="sm" className="h-8 w-full">
          <SelectValue placeholder="Empty" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
}

// Menu triggers styled like the Select fields next to them.
const fieldTrigger = "h-8 w-full justify-between gap-2 px-2.5 font-normal"

const Section = ({ value, title, count, children }: { value: string; title: string; count?: number; children: React.ReactNode }) => (
  <AccordionItem value={value} className="border-b px-4 last:border-b-0">
    <AccordionTrigger className="py-3 hover:no-underline">
      <span className="flex items-center gap-2 font-semibold">
        {title}
        {count !== undefined && (
          <Badge variant="secondary" className="h-5 px-1.5 tabular-nums">
            {count}
          </Badge>
        )}
      </span>
    </AccordionTrigger>
    <AccordionContent className="flex flex-col gap-2 pb-4">{children}</AccordionContent>
  </AccordionItem>
)

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

function AssigneeMenu({
  assignee,
  onAssign,
  open,
  onOpenChange,
}: {
  assignee: string | null
  onAssign: (agent: string | null) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={fieldTrigger}
              aria-label={assignee ? `Assignee: ${assignee}, reassign` : "Unassigned, assign"}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Avatar size="sm" className="size-5">
                  <AvatarFallback className="text-[0.625rem]">{assignee ? initialsOf(assignee) : "?"}</AvatarFallback>
                </Avatar>
                <span className="truncate">{assignee ?? "Unassigned"}</span>
              </span>
              <ChevronDownIcon className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Reassign <Kbd>{shortcuts.assign}</Kbd>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Assign to agent</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={assignee ?? ""} onValueChange={(v) => onAssign(v)}>
          {team.map((a) => (
            <DropdownMenuRadioItem key={a.id} value={a.name} disabled={a.presence === "offline"}>
              {a.name}
              {a.presence === "offline" && <span className="ml-auto text-xs text-muted-foreground">Offline</span>}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!assignee} onSelect={() => onAssign(null)}>
          <UserRoundXIcon />
          Release assignment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// One status control for the whole lifecycle (Open, Pending, Closed, Spam, Other).
function StatusMenu({ status, onChange }: { status: TicketStatus; onChange: (s: TicketStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={fieldTrigger} aria-label={`Status: ${statusMeta[status].label}, change`}>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-2 rounded-full", statusMeta[status].dot)} />
            {statusMeta[status].label}
          </span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(v) => onChange(v as TicketStatus)}>
          {(Object.keys(statusMeta) as TicketStatus[]).map((s) => (
            <DropdownMenuRadioItem key={s} value={s}>
              <span aria-hidden="true" className={cn("size-2 rounded-full", statusMeta[s].dot)} />
              {statusMeta[s].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const contactFieldTypes: { id: string; label: string; icon: typeof MailIcon }[] = [
  { id: "email", label: "Email", icon: MailIcon },
  { id: "phone", label: "Phone", icon: PhoneIcon },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircleIcon },
  { id: "company", label: "Company", icon: Building2Icon },
  { id: "address", label: "Address", icon: MapPinIcon },
  { id: "birthday", label: "Birthday", icon: CakeIcon },
  { id: "customer-id", label: "Customer ID", icon: IdCardIcon },
]

// Icon · value · type label; rows the agent added get a remove button.
function ContactRow({
  icon,
  type,
  onRemove,
  children,
}: {
  icon: React.ReactNode
  type: string
  onRemove?: () => void
  children: React.ReactNode
}) {
  return (
    <li className="flex min-h-8 items-center gap-2.5 text-sm">
      <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="sr-only">{type}: </span>
        {children}
      </span>
      <span aria-hidden="true" className="shrink-0 text-xs text-muted-foreground">
        {type}
      </span>
      {onRemove && (
        <Button variant="ghost" size="icon-xs" aria-label={`Remove ${type}`} className="-mr-1 text-muted-foreground" onClick={onRemove}>
          <XIcon />
        </Button>
      )}
    </li>
  )
}

/**
 * Channel identities, email and phone, plus contact data the agent adds during the session (local state only).
 * Identities that repeat the email or phone are skipped so each value shows once.
 */
function ContactInfo({ contact: c }: { contact: Ticket["contact"] }) {
  const [extra, setExtra] = useState<{ type: string; value: string }[]>([])
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState(contactFieldTypes[3].id)
  const [value, setValue] = useState("")
  const identities = c.identities.filter((id) => id.handle !== c.email && id.handle !== c.phone)
  const meta = (id: string) => contactFieldTypes.find((f) => f.id === id)!

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setExtra((x) => [...x, { type, value: value.trim() }])
    setValue("")
    setAdding(false)
  }

  return (
    <>
      <ul aria-label="Contact information" className="flex flex-col">
        {identities.map((id) => (
          <ContactRow
            key={id.handle}
            icon={<ChannelIcon channel={id.channel} className="size-4 [&_svg]:size-2.5" />}
            type={channelMeta[id.channel].label}
          >
            {id.handle}
          </ContactRow>
        ))}
        {c.email && (
          <ContactRow icon={<MailIcon className="size-4" />} type="Email">
            <a href={`mailto:${c.email}`} className="text-link hover:underline">
              {c.email}
            </a>
          </ContactRow>
        )}
        {c.phone && (
          <ContactRow icon={<PhoneIcon className="size-4" />} type="Phone">
            <span className="tabular-nums">{c.phone}</span>
          </ContactRow>
        )}
        {extra.map((f, i) => {
          const M = meta(f.type)
          return (
            <ContactRow
              key={i}
              icon={<M.icon className="size-4" />}
              type={M.label}
              onRemove={() => setExtra((x) => x.filter((_, j) => j !== i))}
            >
              {f.value}
            </ContactRow>
          )
        })}
      </ul>

      <Row label="Tags">
        <div className="flex flex-wrap items-center gap-1">
          {c.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Button variant="ghost" size="icon-xs" aria-label="Add tag" className="text-muted-foreground">
            <PlusIcon />
          </Button>
        </div>
      </Row>

      {adding ? (
        <form onSubmit={save} aria-label="Add contact information" className="flex flex-col gap-2 rounded-lg border bg-background p-2">
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger size="sm" aria-label="Field type" className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contactFieldTypes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <f.icon />
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              autoFocus
              aria-label={`${meta(type).label} value`}
              placeholder={meta(type).label}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => (setAdding(false), setValue(""))}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!value.trim()}>
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setAdding(true)}>
            <PlusIcon />
            Add contact info
          </Button>
          <Button variant="ghost" size="xs" className="text-muted-foreground">
            <GitMergeIcon />
            Search &amp; Merge
          </Button>
        </div>
      )}
    </>
  )
}

// Activity log = lifecycle events from the thread (system events and escalations), newest first.
const activityOf = (thread: ThreadItem[]) =>
  thread.filter((i) => i.kind === "system" || i.kind === "escalation").sort((a, b) => byTime(b, a))

export function TicketSidebar({
  ticket: t,
  status,
  onStatusChange,
  assignee,
  onAssign,
  assignOpen,
  onAssignOpenChange,
  thread,
  sentiment,
  onSentimentChange,
  onAddNote,
  className,
}: {
  ticket: Ticket
  status: TicketStatus
  onStatusChange: (s: TicketStatus) => void
  assignee: string | null
  onAssign: (agent: string | null) => void
  assignOpen: boolean
  onAssignOpenChange: (open: boolean) => void
  thread: ThreadItem[]
  sentiment: Sentiment
  onSentimentChange: (s: Sentiment) => void
  onAddNote: () => void
  className?: string
}) {
  const notes = thread.filter((i) => i.kind === "note").sort((a, b) => byTime(b, a))
  const activity = activityOf(thread)
  const c = t.contact
  const facts: [string, React.ReactNode][] = [
    [
      "Created",
      <time key="c" dateTime={t.createdAt} title={shortDateTime(t.createdAt)} className="tabular-nums">
        {monthDayTime(t.createdAt)}
      </time>,
    ],
    [
      "Age",
      <span key="a" className="tabular-nums">
        {age(t.createdAt)}
      </span>,
    ],
    [
      "SLA",
      status === "closed" ? (
        <span key="sla" className="text-muted-foreground">
          Stopped
        </span>
      ) : t.state === "out-sla" ? (
        <span key="sla" className="font-medium text-destructive">
          Out · {t.slaOverdue}
        </span>
      ) : (
        <span key="sla" className="font-medium text-success">
          Within
        </span>
      ),
    ],
  ]

  return (
    <ScrollArea className={cn("bg-card text-card-foreground [&_[data-slot=scroll-area-viewport]>div]:block!", className)}>
      {/* Customer stays pinned while the sections scroll under it. */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card px-4 py-3">
        <Avatar size="lg">
          <AvatarFallback>{t.initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate font-heading font-semibold">{t.customer}</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ChannelIcon channel={t.channel} className="size-3.5 [&_svg]:size-2.5" />
            {channelMeta[t.channel].typeLabel} · {t.history.length + 1} {t.history.length ? "tickets" : "ticket"}
          </p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["info", "contact", "notes"]}>
        <Section value="info" title="Ticket information">
          <Row label="Status">
            <StatusMenu status={status} onChange={onStatusChange} />
          </Row>
          <Row label="Assignee">
            <AssigneeMenu assignee={assignee} onAssign={onAssign} open={assignOpen} onOpenChange={onAssignOpenChange} />
          </Row>
          <Field id="priority" label="Priority" options={["Low", "Medium", "High", "Urgent"]} value={t.priority} />
          <Field
            id="category"
            label="Category"
            options={["Complaint", "Inquiry", "Request", "Warranty claim", "Billing"]}
            value={t.category}
          />
          <Row label="Sentiment" labelId="sentiment-label">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={sentiment}
              onValueChange={(v) => v && onSentimentChange(v as Sentiment)}
              aria-labelledby="sentiment-label"
              className="w-full"
            >
              {(Object.keys(sentimentMeta) as Sentiment[]).map((s) => {
                const M = sentimentMeta[s]
                return (
                  <ToggleGroupItem key={s} value={s} aria-label={M.label} title={M.label} className="h-8 flex-1">
                    <M.icon className={M.tone} />
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </Row>
          <Row label="Group">
            <span className="text-sm">{t.group}</span>
          </Row>
          {/* Read-only timing facts as compact tiles under the editable fields. */}
          <dl className="mt-1 grid grid-cols-[1.5fr_1fr_1fr] gap-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-col gap-0.5 rounded-lg border bg-background px-2.5 py-2">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="truncate text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section value="contact" title="Contact">
          <ContactInfo contact={c} />
        </Section>

        <Section value="custom-fields" title="Custom fields" count={customFields.length}>
          {customFields.map((f) => (
            <Field key={f.id} {...f} />
          ))}
        </Section>

        <Section value="notes" title="Internal notes" count={notes.length}>
          {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet. Notes stay visible to agents only.</p>}
          <ul className="flex flex-col gap-2">
            {notes.map((n, i) => (
              <li key={i} className="rounded-lg border border-warning/40 bg-warning-soft px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.kind === "note" && n.agent} · <Stamp at={n.at} />
                </p>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="xs" className="self-start text-muted-foreground" onClick={onAddNote}>
            <PlusIcon />
            Add internal note
          </Button>
        </Section>

        <Section value="history" title="Customer history" count={t.history.length}>
          {t.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous tickets from this customer.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {t.history.map((h) => (
                <li key={h.id}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full flex-col items-start gap-0.5 px-2 py-1.5 text-left font-normal whitespace-normal"
                  >
                    <span className="flex w-full items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">#{h.id}</span>
                      <span className="flex-1 truncate text-sm">{h.subject}</span>
                      <ArrowUpRightIcon className="size-3.5 text-muted-foreground" />
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusMeta[h.status].dot)} />
                      {statusMeta[h.status].label} · {shortDateTime(h.at)}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section value="activity" title="Activity log" count={activity.length}>
          <Timeline>
            {activity.map((a, i) => (
              <TimelineItem
                key={i}
                icon={a.kind === "escalation" ? <ShieldAlertIcon /> : <CircleDotIcon />}
                title={a.kind === "escalation" ? `Escalated to ${a.to}` : a.body}
                time={
                  <time dateTime={a.at} title={relativeTime(a.at)}>
                    {clock(a.at)}
                  </time>
                }
              >
                {a.kind === "escalation" ? `by ${a.agent}` : undefined}
              </TimelineItem>
            ))}
          </Timeline>
        </Section>
      </Accordion>
    </ScrollArea>
  )
}
