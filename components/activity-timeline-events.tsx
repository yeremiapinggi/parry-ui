import { useId, type ReactNode } from "react"
import { cn } from "cn"
import {
  ArrowRightLeftIcon,
  CopyIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CirclePlusIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  PencilIcon,
  Settings2Icon,
  UserRoundCogIcon,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  activityTypeLabels,
  type ActivityEvent,
  type ActivityType,
} from "@/lib/activity-timeline-data"

type ActivityEventIconProps = { type: ActivityType; className?: string }

const eventIcons: Record<ActivityType, LucideIcon> = {
  "record-created": CirclePlusIcon,
  "field-updated": PencilIcon,
  "status-changed": ArrowRightLeftIcon,
  assigned: UserRoundCogIcon,
  "comment-added": MessageSquareTextIcon,
  "file-attached": FileTextIcon,
  "activity-completed": CheckCircle2Icon,
  "system-event": Settings2Icon,
}

const eventIconTones: Record<ActivityType, string> = {
  "record-created": "bg-info-soft text-info",
  "field-updated": "bg-muted text-muted-foreground",
  "status-changed": "bg-warning-soft text-warning",
  assigned: "bg-info-soft text-info",
  "comment-added": "bg-muted text-foreground",
  "file-attached": "bg-muted text-muted-foreground",
  "activity-completed": "bg-success-soft text-success",
  "system-event": "bg-muted text-muted-foreground",
}

export function ActivityEventIcon({ type, className }: ActivityEventIconProps) {
  const Icon = eventIcons[type]
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full border border-background ring-1 ring-border", eventIconTones[type], className)} aria-hidden="true">
      <Icon className="size-4" />
    </span>
  )
}

export function ActivityActorLabel({ actor, compact = false }: { actor: ActivityEvent["actor"]; compact?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {actor.kind === "system" ? (
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <Settings2Icon className="size-3" aria-hidden="true" />
        </span>
      ) : (
        <Avatar aria-hidden="true" size="sm" className="size-5">
          <AvatarFallback className="text-[9px]">{actor.initials}</AvatarFallback>
        </Avatar>
      )}
      <span className="truncate">{actor.name}</span>
      {!compact && actor.kind === "person" && <span className="hidden text-muted-foreground sm:inline">· {actor.role}</span>}
    </span>
  )
}

export function ChangeComparison({ changes }: { changes: NonNullable<ActivityEvent["changes"]> }) {
  if (changes.length === 0) return null

  return (
    <div className="flex flex-col gap-2" aria-label="Changed fields">
      {changes.map((change) => (
        <div key={`${change.field}-${change.previousValue}-${change.newValue}`} className="grid gap-2 rounded-md border bg-background px-3 py-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <span className="text-xs font-medium text-muted-foreground">{change.field}</span>
          <span className="min-w-0 break-words text-sm text-muted-foreground"><span className="mr-1 text-[10px] uppercase tracking-wide">Previous</span>{change.previousValue || "—"}</span>
          <ArrowRightLeftIcon className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
          <span className="min-w-0 break-words text-sm font-medium text-foreground"><span className="mr-1 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">Updated</span>{change.newValue || "—"}</span>
        </div>
      ))}
    </div>
  )
}

export function EventDetails({ event, onCopy }: { event: ActivityEvent; onCopy: (event: ActivityEvent) => void }) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg bg-muted/40 p-3 sm:p-4">
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-0.5"><dt className="text-xs text-muted-foreground">Actor</dt><dd><ActivityActorLabel actor={event.actor} compact /></dd></div>
        <div className="flex flex-col gap-0.5"><dt className="text-xs text-muted-foreground">Activity type</dt><dd className="font-medium">{activityTypeLabels[event.type]}</dd></div>
        <div className="flex flex-col gap-0.5"><dt className="text-xs text-muted-foreground">Related entity</dt><dd className="break-words font-medium">{event.entity}</dd></div>
        <div className="flex flex-col gap-0.5 sm:col-span-3"><dt className="text-xs text-muted-foreground">Event timestamp</dt><dd><time dateTime={event.occurredAt}>{new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurredAt))}</time></dd></div>
      </dl>
      {event.changes && event.changes.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Changed fields">
          <h4 className="text-xs font-medium text-muted-foreground">Changed fields</h4>
          <ChangeComparison changes={event.changes} />
        </section>
      )}
      {event.note && (
        <section className="flex flex-col gap-1" aria-label="Additional notes">
          <h4 className="text-xs font-medium text-muted-foreground">Additional notes</h4>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{event.note}</p>
        </section>
      )}
      <div className="flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={() => onCopy(event)}>
          <CopyIcon data-icon="inline-start" aria-hidden="true" />
          Copy event details
        </Button>
      </div>
    </div>
  )
}

export function TimelineEvent({
  event,
  expanded,
  compact = false,
  onToggle,
  onCopy,
}: {
  event: ActivityEvent
  expanded: boolean
  compact?: boolean
  onToggle: (eventId: string) => void
  onCopy: (event: ActivityEvent) => void
}) {
  const detailsId = `activity-details-${useId().replace(/:/g, "")}`
  const occurredAt = new Date(event.occurredAt)
  const timestamp = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(occurredAt)

  return (
    <li className="relative flex gap-3 pb-3 before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:bg-border last:pb-0 last:before:hidden">
      <div className="relative z-10"><ActivityEventIcon type={event.type} /></div>
      <div className="min-w-0 flex-1 border-b border-border/70 pb-3 last:border-0 last:pb-0">
        <button
          type="button"
          className="group flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-expanded={expanded}
          aria-controls={expanded ? detailsId : undefined}
          onClick={() => onToggle(event.id)}
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium leading-snug text-foreground">{event.title}</span>
              <Badge variant="outline" className="hidden h-5 px-1.5 text-[10px] font-normal sm:inline-flex">{activityTypeLabels[event.type]}</Badge>
            </span>
            {!compact && <span className="text-sm leading-relaxed text-muted-foreground">{event.description}</span>}
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <ActivityActorLabel actor={event.actor} compact />
              <span aria-hidden="true">·</span>
              <time dateTime={event.occurredAt} title={new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }).format(occurredAt)}>{timestamp}</time>
            </span>
          </span>
          <ChevronDownIcon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        {expanded && (
          <div id={detailsId}>
            <p className="sr-only">{event.description}</p>
            <EventDetails event={event} onCopy={onCopy} />
          </div>
        )}
      </div>
    </li>
  )
}

export function TimelineGroup({
  label,
  events,
  expandedEventIds,
  compact = false,
  onToggleEvent,
  onCopyEvent,
}: {
  label: string
  events: ActivityEvent[]
  expandedEventIds: Set<string>
  compact?: boolean
  onToggleEvent: (eventId: string) => void
  onCopyEvent: (event: ActivityEvent) => void
}) {
  const groupHeadingId = `timeline-group-${useId().replace(/:/g, "")}`
  return (
    <section aria-labelledby={groupHeadingId} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 id={groupHeadingId} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">{events.length}</span>
      </div>
      <ol className="flex flex-col" aria-label={`${label} activity events`}>
        {events.map((event) => (
          <TimelineEvent
            key={event.id}
            event={event}
            expanded={expandedEventIds.has(event.id)}
            compact={compact}
            onToggle={onToggleEvent}
            onCopy={onCopyEvent}
          />
        ))}
      </ol>
    </section>
  )
}

export function TimelineContainer({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <div role="region" aria-label="Chronological activity timeline" className={`flex flex-col ${compact ? "gap-4" : "gap-5"}`}>{children}</div>
}
