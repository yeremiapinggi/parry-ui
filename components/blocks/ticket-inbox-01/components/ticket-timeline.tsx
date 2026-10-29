"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { ArrowDownIcon } from "lucide-react"

import { cn } from "cn"

import type { ThreadItem } from "@/components/blocks/_data/tickets"
import { MessageBubble } from "@/components/blocks/_parts/message-bubble"
import { byTime, dayKey, dayLabel } from "@/components/blocks/_parts/time"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type Filter = "all" | "conversation" | "escalation" | "note"

const filters: { id: Filter; label: string; match: (i: ThreadItem) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "conversation", label: "Conversation", match: (i) => i.kind === "in" || i.kind === "out" },
  { id: "escalation", label: "Escalation", match: (i) => i.kind === "escalation" },
  { id: "note", label: "Notes", match: (i) => i.kind === "note" },
]

const GROUP_GAP_MS = 5 * 60 * 1000

// Consecutive in/out messages from the same sender within five minutes on the same day form one group.
const sameGroup = (a: ThreadItem | undefined, b: ThreadItem | undefined) =>
  !!a &&
  !!b &&
  a.kind === b.kind &&
  (a.kind === "in" || (a.kind === "out" && b.kind === "out" && a.agent === b.agent)) &&
  dayKey(a.at) === dayKey(b.at) &&
  Math.abs(new Date(b.at).getTime() - new Date(a.at).getTime()) < GROUP_GAP_MS

export function TicketTimeline({ thread, initials, className }: { thread: ThreadItem[]; initials: string; className?: string }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [atLatest, setAtLatest] = useState(true)
  const end = useRef<HTMLLIElement>(null)
  const items = [...thread].sort(byTime).filter(filters.find((f) => f.id === filter)!.match)

  // Show "Jump to latest" once the newest message scrolls out of view.
  useEffect(() => {
    const el = end.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setAtLatest(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Stay pinned to the newest message when one is added or the filter changes.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [thread.length, filter])

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      <div className="flex items-center border-b px-4 py-2">
        <ToggleGroup type="single" size="sm" spacing={1} value={filter} onValueChange={(v) => v && setFilter(v as Filter)} aria-label="Filter timeline">
          {filters.map((f) => (
            <ToggleGroupItem key={f.id} value={f.id} className="gap-1.5 px-2.5 text-muted-foreground data-[state=on]:text-foreground">
              {f.label}
              <span className="text-xs tabular-nums">{thread.filter(f.match).length}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block!">
        <ol aria-label="Ticket timeline" className="flex flex-col gap-3 px-4 py-4 md:px-6">
          {items.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">Nothing here yet.</li>}
          {items.map((item, i) => {
            const prev = items[i - 1]
            const newDay = !prev || dayKey(prev.at) !== dayKey(item.at)
            return (
              <Fragment key={`${item.at}-${i}`}>
                {newDay && (
                  <li role="separator" aria-label={dayLabel(item.at)} className="flex items-center gap-3 py-1 text-xs font-medium text-muted-foreground">
                    <Separator className="flex-1" />
                    {dayLabel(item.at)}
                    <Separator className="flex-1" />
                  </li>
                )}
                <MessageBubble
                  item={item}
                  initials={initials}
                  groupStart={newDay || !sameGroup(prev, item)}
                  groupEnd={!sameGroup(item, items[i + 1])}
                />
              </Fragment>
            )
          })}
          <li ref={end} aria-hidden="true" className="h-px" />
        </ol>
      </ScrollArea>

      {!atLatest && (
        <Button
          size="sm"
          variant="outline"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          onClick={() => end.current?.scrollIntoView({ block: "end", behavior: "smooth" })}
        >
          <ArrowDownIcon />
          Jump to latest
        </Button>
      )}
    </div>
  )
}
