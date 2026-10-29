"use client"

import { ArrowUpRightIcon, CircleDotIcon, GitMergeIcon, MailIcon, PhoneIcon, PlusIcon, ShieldAlertIcon, StickyNoteIcon } from "lucide-react"

import { cn } from "cn"

import type { Sentiment, ThreadItem, Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { Stamp } from "@/components/blocks/_parts/message-bubble"
import { byTime, clock, relativeTime, shortDateTime } from "@/components/blocks/_parts/time"
import { channelMeta } from "@/components/blocks/channel-meta"
import { sentimentMeta, statusMeta } from "@/components/blocks/ticket-inbox-01/components/ticket-meta"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timeline, TimelineItem } from "@/components/ui/timeline"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const customFields = [
  { id: "caller-case", label: "Caller case", options: ["Customer", "Dealer", "KTB"], value: "Customer" },
  { id: "warranty", label: "Warranty", options: ["Active", "Expired"], value: "Active" },
  { id: "sub-1", label: "Sub category 1", options: ["After sales", "Sales"], value: "After sales" },
  { id: "sub-2", label: "Sub category 2", options: ["Service", "Spare part", "Warranty claim"] },
  { id: "sub-3", label: "Sub category 3", options: ["AC", "Engine", "Body"] },
]

function Field({ id, label, options, value }: { id: string; label: string; options: string[]; value?: string }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <Select defaultValue={value}>
        <SelectTrigger id={id} size="sm" className="w-full">
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
    </div>
  )
}

const Section = ({ value, title, count, children }: { value: string; title: string; count?: number; children: React.ReactNode }) => (
  <AccordionItem value={value} className="border-b px-4">
    <AccordionTrigger className="py-3 hover:no-underline">
      <span className="flex items-center gap-2">
        {title}
        {count !== undefined && (
          <Badge variant="secondary" className="h-5 px-1.5 tabular-nums">
            {count}
          </Badge>
        )}
      </span>
    </AccordionTrigger>
    <AccordionContent className="flex flex-col gap-3 pb-4">{children}</AccordionContent>
  </AccordionItem>
)

// Activity log = lifecycle events from the thread (system events and escalations), newest first.
const activityOf = (thread: ThreadItem[]) =>
  thread.filter((i) => i.kind === "system" || i.kind === "escalation").sort((a, b) => byTime(b, a))

export function TicketSidebar({
  ticket: t,
  thread,
  sentiment,
  onSentimentChange,
  onAddNote,
  className,
}: {
  ticket: Ticket
  thread: ThreadItem[]
  sentiment: Sentiment
  onSentimentChange: (s: Sentiment) => void
  onAddNote: () => void
  className?: string
}) {
  const notes = thread.filter((i) => i.kind === "note").sort((a, b) => byTime(b, a))
  const activity = activityOf(thread)
  const c = t.contact

  return (
    <ScrollArea className={cn("bg-card text-card-foreground [&_[data-slot=scroll-area-viewport]>div]:block!", className)}>
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <Avatar size="lg">
          <AvatarFallback>{t.initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate font-heading font-semibold">{t.customer}</h3>
          <p className="text-xs text-muted-foreground">
            {t.history.length + 1} tickets · via {channelMeta[t.channel].typeLabel}
          </p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["contact", "details", "notes"]}>
        <Section value="contact" title="Contact">
          <ul aria-label="Channel identities" className="flex flex-col gap-1.5 text-sm">
            {c.identities.map((id) => (
              <li key={id.handle} className="flex items-center gap-2">
                <ChannelIcon channel={id.channel} />
                <span className="sr-only">{channelMeta[id.channel].label}:</span>
                <span className="truncate">{id.handle}</span>
              </li>
            ))}
            {c.email && (
              <li className="flex items-center gap-2">
                <MailIcon aria-label="Email" className="size-4 text-muted-foreground" />
                <a href={`mailto:${c.email}`} className="truncate text-link hover:underline">
                  {c.email}
                </a>
              </li>
            )}
            {c.phone && (
              <li className="flex items-center gap-2">
                <PhoneIcon aria-label="Phone" className="size-4 text-muted-foreground" />
                <span className="tabular-nums">{c.phone}</span>
              </li>
            )}
          </ul>
          <div className="flex flex-wrap items-center gap-1.5">
            {c.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Button variant="ghost" size="xs" className="text-muted-foreground">
              <PlusIcon />
              Tag
            </Button>
          </div>
          <Button variant="outline" size="sm" className="self-start">
            <GitMergeIcon />
            Search &amp; Merge
          </Button>
        </Section>

        <Section value="details" title="Ticket details">
          <Field id="category" label="Category" options={["Complaint", "Inquiry", "Request", "Warranty claim", "Billing"]} value={t.category} />
          <Field id="priority" label="Priority" options={["Low", "Medium", "High", "Urgent"]} value={t.priority} />
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2">
            <span id="sentiment-label" className="text-xs text-muted-foreground">
              Sentiment
            </span>
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
                  <ToggleGroupItem key={s} value={s} aria-label={M.label} title={M.label} className="flex-1">
                    <M.icon className={M.tone} />
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>
          <p className="pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Custom fields</p>
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
          <Button variant="outline" size="sm" className="self-start" onClick={onAddNote}>
            <StickyNoteIcon />
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
                  <Button variant="ghost" className="h-auto w-full flex-col items-start gap-0.5 px-2 py-1.5 text-left font-normal whitespace-normal">
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
