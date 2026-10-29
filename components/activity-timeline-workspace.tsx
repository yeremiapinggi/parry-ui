"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ActivityIcon,
  AlertCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Clock3Icon,
  ExpandIcon,
  HistoryIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ActivityCommentComposer, TimelineFilters, type TimelineFilterState } from "@/components/activity-timeline-controls"
import { ActivityActorLabel, TimelineContainer, TimelineGroup } from "@/components/activity-timeline-events"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  ACTIVITY_DEMO_REFERENCE_TIME,
  activityActors,
  createHistoricalActivityEvents,
  createInitialActivityEvents,
  type ActivityEvent,
  type TimelineVariant,
} from "@/lib/activity-timeline-data"

export type ActivityTimelineWorkspaceProps = {
  defaultVariant?: TimelineVariant
  showVariantSelector?: boolean
  showDemoStates?: boolean
}

type PreviewState = "live" | "loading" | "error" | "empty"
type ActivityGroup = { label: string; events: ActivityEvent[] }

const initialFilters: TimelineFilterState = {
  search: "",
  types: [],
  actorId: "all",
  dateRange: "30d",
  sort: "newest",
}

function getVisibleLimit(variant: TimelineVariant) {
  if (variant === "embedded") return 4
  if (variant === "compact") return 6
  return Number.MAX_SAFE_INTEGER
}

function getActivityGroups(events: ActivityEvent[], sort: TimelineFilterState["sort"], referenceTime: number): ActivityGroup[] {
  const today = new Date(referenceTime)
  const yesterday = new Date(referenceTime)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const todayKey = today.toISOString().slice(0, 10)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)
  const groups = new Map<string, ActivityEvent[]>()

  for (const event of events) {
    const eventKey = event.occurredAt.slice(0, 10)
    const label = eventKey === todayKey ? "Today" : eventKey === yesterdayKey ? "Yesterday" : "Earlier"
    groups.set(label, [...(groups.get(label) ?? []), event])
  }

  const groupOrder = sort === "newest" ? ["Today", "Yesterday", "Earlier"] : ["Earlier", "Yesterday", "Today"]
  return groupOrder.filter((label) => groups.has(label)).map((label) => ({ label, events: groups.get(label) ?? [] }))
}

function ActivityTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading activity" aria-busy="true">
      <span className="sr-only">Loading activity history</span>
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          {[0, 1, 2].map((event) => (
            <div key={event} className="flex gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function createEventId() {
  return globalThis.crypto?.randomUUID?.() ?? `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ActivityTimelineWorkspace({
  defaultVariant = "full",
  showVariantSelector = true,
  showDemoStates = true,
}: ActivityTimelineWorkspaceProps) {
  const [referenceTime, setReferenceTime] = useState(ACTIVITY_DEMO_REFERENCE_TIME)
  const [events, setEvents] = useState<ActivityEvent[]>(() => createInitialActivityEvents(ACTIVITY_DEMO_REFERENCE_TIME))
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(() => new Set())
  const [filters, setFilters] = useState<TimelineFilterState>(initialFilters)
  const [variant, setVariant] = useState<TimelineVariant>(defaultVariant)
  const [visibleLimit, setVisibleLimit] = useState(() => getVisibleLimit(defaultVariant))
  const [previewState, setPreviewState] = useState<PreviewState>("live")
  const [embeddedHeaderVisible, setEmbeddedHeaderVisible] = useState(true)
  const [commentDraft, setCommentDraft] = useState("")
  const [historyLoaded, setHistoryLoaded] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = Date.now()
      setReferenceTime(now)
      setEvents(createInitialActivityEvents(now))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const filteredEvents = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const lowerBound = new Date(referenceTime)
    if (filters.dateRange === "today") lowerBound.setUTCHours(0, 0, 0, 0)
    if (filters.dateRange === "7d") lowerBound.setUTCDate(lowerBound.getUTCDate() - 7)
    if (filters.dateRange === "30d") lowerBound.setUTCDate(lowerBound.getUTCDate() - 30)

    return events
      .filter((event) => {
        if (filters.types.length > 0 && !filters.types.includes(event.type)) return false
        if (filters.actorId !== "all" && event.actor.id !== filters.actorId) return false
        if (filters.dateRange !== "all" && new Date(event.occurredAt) < lowerBound) return false
        if (query) {
          const searchable = [
            event.title,
            event.description,
            event.entity,
            event.actor.name,
            event.note ?? "",
            ...(event.changes ?? []).flatMap((change) => [change.field, change.previousValue, change.newValue]),
          ].join(" ").toLowerCase()
          if (!searchable.includes(query)) return false
        }
        return true
      })
      .sort((left, right) => filters.sort === "newest"
        ? new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
        : new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())
  }, [events, filters, referenceTime])

  const visibleEvents = filteredEvents.slice(0, visibleLimit)
  const groups = getActivityGroups(visibleEvents, filters.sort, referenceTime)
  const allVisibleExpanded = visibleEvents.length > 0 && visibleEvents.every(({ id }) => expandedEventIds.has(id))
  const filtersActive = filters.search.trim().length > 0 || filters.types.length > 0 || filters.actorId !== "all" || filters.dateRange !== "30d" || filters.sort !== "newest"
  const initialActor = activityActors.find(({ id }) => id === "alex-morgan") ?? activityActors[0]

  function resetFilters() {
    setFilters(initialFilters)
  }

  function changeVariant(nextVariant: TimelineVariant) {
    setVariant(nextVariant)
    setVisibleLimit(getVisibleLimit(nextVariant))
  }

  function toggleEvent(eventId: string) {
    setExpandedEventIds((current) => {
      const next = new Set(current)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return next
    })
  }

  function toggleAllEvents() {
    setExpandedEventIds((current) => {
      const next = new Set(current)
      if (allVisibleExpanded) visibleEvents.forEach(({ id }) => next.delete(id))
      else visibleEvents.forEach(({ id }) => next.add(id))
      return next
    })
  }

  async function copyEvent(event: ActivityEvent) {
    const changes = event.changes?.map(({ field, previousValue, newValue }) => `${field}: ${previousValue || "—"} → ${newValue || "—"}`).join("\n")
    const details = [
      event.title,
      event.description,
      `Actor: ${event.actor.name}`,
      `Type: ${event.type}`,
      `Related entity: ${event.entity}`,
      `Timestamp: ${new Date(event.occurredAt).toLocaleString()}`,
      changes ? `Changes:\n${changes}` : "",
      event.note ? `Notes: ${event.note}` : "",
    ].filter(Boolean).join("\n")

    try {
      await navigator.clipboard.writeText(details)
      toast.success("Event details copied")
    } catch {
      toast.error("Could not copy event details", { description: "Clipboard access is unavailable in this browser." })
    }
  }

  function addComment(value: string) {
    const createdAt = Date.now()
    const comment: ActivityEvent = {
      id: createEventId(),
      type: "comment-added",
      title: "Comment added to the renewal record",
      description: "A new note was added to the customer activity history.",
      actor: initialActor,
      entity: "Northstar Health · Enterprise renewal",
      occurredAt: new Date(createdAt).toISOString(),
      note: value,
    }
    setReferenceTime(createdAt)
    setEvents((current) => [comment, ...current])
    setExpandedEventIds((current) => new Set([...current, comment.id]))
    setFilters(initialFilters)
    setVisibleLimit(getVisibleLimit(variant))
    setPreviewState("live")
    setCommentDraft("")
    toast.success("Comment added to the timeline")
  }

  function showMoreActivity() {
    setVisibleLimit((current) => Math.min(filteredEvents.length, current + 5))
  }

  function loadMoreHistory() {
    const olderEvents = createHistoricalActivityEvents(referenceTime)
    setEvents((current) => [...current, ...olderEvents])
    setHistoryLoaded(true)
    setVisibleLimit((current) => variant === "full" ? current : current + 5)
    toast.success("Historical activities loaded")
  }

  const showEmbeddedHeader = variant !== "embedded" || embeddedHeaderVisible
  const displayState = previewState !== "live"

  return (
    <div className="flex w-full flex-col gap-3" data-variant={variant}>
      {(showVariantSelector || showDemoStates || variant === "embedded") && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 rounded-lg border bg-muted/30 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-end gap-3">
            {showVariantSelector && (
              <Field className="w-36 gap-1">
                <FieldLabel htmlFor="activity-variant" className="text-xs text-muted-foreground">Display variant</FieldLabel>
                <Select value={variant} onValueChange={(value) => changeVariant(value as TimelineVariant)}>
                  <SelectTrigger id="activity-variant" size="sm" aria-label="Select timeline display variant"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="full">Full timeline</SelectItem>
                      <SelectItem value="compact">Compact timeline</SelectItem>
                      <SelectItem value="embedded">Embedded timeline</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
            {showDemoStates && (
              <Field className="w-36 gap-1">
                <FieldLabel htmlFor="activity-demo-state" className="text-xs text-muted-foreground">Preview state</FieldLabel>
                <Select value={previewState} onValueChange={(value) => setPreviewState(value as PreviewState)}>
                  <SelectTrigger id="activity-demo-state" size="sm" aria-label="Select timeline preview state"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="live">Live timeline</SelectItem>
                      <SelectItem value="loading">Loading</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="empty">Empty timeline</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>
          {variant === "embedded" && (
            <Field orientation="horizontal" className="w-auto items-center gap-2">
              <Switch id="embedded-activity-header" checked={embeddedHeaderVisible} onCheckedChange={setEmbeddedHeaderVisible} size="sm" />
              <FieldLabel htmlFor="embedded-activity-header" className="text-xs text-muted-foreground">Show header</FieldLabel>
            </Field>
          )}
        </div>
      )}

      <section className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card ${variant === "compact" ? "text-sm" : ""}`} aria-label="Customer activity timeline">
        {showEmbeddedHeader && (
          <header className={`flex flex-wrap items-start justify-between gap-3 border-b px-4 ${variant === "compact" ? "py-3" : "py-4 sm:px-5"}`}>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-base font-semibold tracking-tight">Customer activity</h2>
                <Badge variant="secondary" className="font-normal">Northstar Health</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Enterprise renewal · Account history</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ActivityIcon className="size-4" aria-hidden="true" />
              <span>{events.length} activities</span>
            </div>
          </header>
        )}

        <div className={`flex flex-col gap-4 ${variant === "compact" ? "p-3" : "p-4 sm:p-5"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <Clock3Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{visibleEvents.length} of {filteredEvents.length} matching activities</span>
              {historyLoaded && <Badge variant="outline" className="h-5 text-[10px] font-normal">All history loaded</Badge>}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={toggleAllEvents} disabled={visibleEvents.length === 0}>
              {allVisibleExpanded ? <ChevronUpIcon data-icon="inline-start" /> : <ExpandIcon data-icon="inline-start" />}
              {allVisibleExpanded ? "Collapse all" : "Expand all"}
            </Button>
          </div>

          <TimelineFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

          {previewState === "loading" ? (
            <ActivityTimelineSkeleton />
          ) : previewState === "error" ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden="true" />
              <div className="flex min-w-0 flex-col gap-1">
                <AlertTitle>Activity history is unavailable</AlertTitle>
                <AlertDescription>We couldn&apos;t load the latest activity. Your filters and comments are still safe in this local preview.</AlertDescription>
                <Button type="button" size="sm" variant="outline" className="mt-2 w-fit" onClick={() => setPreviewState("live")}>Try again</Button>
              </div>
            </Alert>
          ) : previewState === "empty" || events.length === 0 ? (
            <Empty className="min-h-52 border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><ActivityIcon aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>No activity yet</EmptyTitle>
                <EmptyDescription>Actions and updates for this record will appear here as they happen.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="outline" size="sm" onClick={() => setPreviewState("live")}>Restore demo activity</Button>
              </EmptyContent>
            </Empty>
          ) : filteredEvents.length === 0 ? (
            <Empty className="min-h-52 border">
              <EmptyHeader>
                <EmptyMedia variant="icon"><ActivityIcon aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>No matching activities</EmptyTitle>
                <EmptyDescription>Try another search or adjust the selected filters.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>Reset filters</Button>
              </EmptyContent>
            </Empty>
          ) : (
            <TimelineContainer compact={variant === "compact"}>
              {groups.map((group) => (
                <TimelineGroup
                  key={group.label}
                  label={group.label}
                  events={group.events}
                  expandedEventIds={expandedEventIds}
                  compact={variant === "compact"}
                  onToggleEvent={toggleEvent}
                  onCopyEvent={copyEvent}
                />
              ))}
            </TimelineContainer>
          )}

          {previewState === "live" && filteredEvents.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <span className="text-xs text-muted-foreground">{filtersActive ? "Filters apply to the entire activity history." : "Chronological history is grouped by day."}</span>
              {visibleLimit < filteredEvents.length ? (
                <Button type="button" variant="outline" size="sm" onClick={showMoreActivity}>
                  <ChevronDownIcon data-icon="inline-start" />
                  Show more activity
                </Button>
              ) : !historyLoaded ? (
                <Button type="button" variant="outline" size="sm" onClick={loadMoreHistory}>
                  <HistoryIcon data-icon="inline-start" />
                  Load more history
                </Button>
              ) : (
                <Badge variant="secondary" className="font-normal"><CheckIcon data-icon="inline-start" />All events loaded</Badge>
              )}
            </div>
          )}
        </div>

        {previewState === "live" && (
          <div className="border-t bg-muted/20 px-4 py-4 sm:px-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <ActivityActorLabel actor={initialActor} compact />
              <span>Share a note with everyone following this record.</span>
            </div>
            <ActivityCommentComposer value={commentDraft} onChange={setCommentDraft} onSubmit={addComment} />
          </div>
        )}
        {displayState && <p className="sr-only" role="status">Preview state: {previewState}</p>}
      </section>
    </div>
  )
}
