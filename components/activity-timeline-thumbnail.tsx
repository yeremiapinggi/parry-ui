"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { ActivityEventIcon } from "@/components/activity-timeline-events"
import { Badge } from "@/components/ui/badge"
import { createInitialActivityEvents } from "@/lib/activity-timeline-data"

export function ActivityTimelineThumbnail() {
  const events = useMemo(() => createInitialActivityEvents().slice(0, 3), [])
  const [expandedId, setExpandedId] = useState<string | null>(events[0]?.id ?? null)

  return (
    <div className="flex h-full flex-col bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 border-b pb-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-xs font-semibold">Customer activity</span>
          <span className="truncate text-[10px] text-muted-foreground">Northstar Health · Renewal</span>
        </div>
        <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[9px] font-normal">Today</Badge>
      </div>
      <ol className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        {events.map((event) => {
          const expanded = expandedId === event.id
          return (
            <li key={event.id} className="relative flex gap-2 before:absolute before:top-7 before:bottom-0 before:left-3 before:w-px before:bg-border last:before:hidden">
              <ActivityEventIcon type={event.type} className="size-6" />
              <div className="min-w-0 flex-1 border-b border-border/70 pb-2 last:border-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : event.id)}
                  className="flex w-full items-start justify-between gap-1 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[10px] font-medium leading-tight">{event.title}</span>
                    <span className="truncate text-[9px] text-muted-foreground">{event.actor.name} · {new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit" }).format(new Date(event.occurredAt))}</span>
                  </span>
                  <ChevronDownIcon className={`size-3 shrink-0 text-muted-foreground ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {expanded && <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-muted-foreground">{event.description}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
