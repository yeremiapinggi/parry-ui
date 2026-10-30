"use client"

import { useState } from "react"
import { CalendarIcon, CircleDotIcon, InboxIcon, LockIcon, SmileIcon, UserIcon, WaypointsIcon } from "lucide-react"

import { cn } from "cn"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { team } from "@/components/blocks/_data/team"
import { ViewToolbar, type ActiveFilter, type FilterField, type SortOption } from "@/components/blocks/_parts/view-toolbar"
import { channelMeta } from "@/components/blocks/channel-meta"
import { TicketRow } from "@/components/blocks/_parts/ticket-row"
import { BulkActions, TicketActionMenuItems } from "@/components/blocks/ticket-inbox-01/components/ticket-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const stateLabels: Record<Ticket["state"], string> = {
  replied: "Replied",
  unreplied: "Unreplied",
  pending: "Pending",
  "out-sla": "Out SLA",
}

const fields: FilterField[] = [
  { id: "date", label: "Date range", icon: CalendarIcon, options: ["Today", "Last 7 days", "Last 30 days"] },
  { id: "state", label: "Status", icon: CircleDotIcon, options: Object.values(stateLabels) },
  { id: "assignee", label: "Assignee", icon: UserIcon, options: team.map((a) => a.name) },
  { id: "sentiment", label: "Sentiment", icon: SmileIcon, options: ["Positive", "Neutral", "Negative"] },
  { id: "channel", label: "Channel type", icon: WaypointsIcon, options: Object.values(channelMeta).map((c) => c.label) },
  { id: "lock", label: "Lock", icon: LockIcon, options: ["Unlocked", "Locked"] },
]

const sortOptions: SortOption[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "sla", label: "SLA risk first" },
  { id: "replies", label: "Most replies" },
]

// Sample tickets carry relative times; anything in days ("1d") is older than today.
const matches = (t: Ticket, { id, value }: ActiveFilter) => {
  switch (id) {
    case "date":
      return value !== "Today" || !t.time.endsWith("d")
    case "state":
      return stateLabels[t.state] === value
    case "assignee":
      return t.assignee === value
    case "sentiment":
      return t.sentiment === value.toLowerCase()
    case "channel":
      return channelMeta[t.channel].label === value
    case "lock":
      return (value === "Locked") === Boolean(t.lockedBy)
    default:
      return true
  }
}

const slaRank: Record<Ticket["state"], number> = { "out-sla": 0, unreplied: 1, pending: 2, replied: 3 }
const sorters: Record<string, (a: Ticket, b: Ticket) => number> = {
  newest: () => 0,
  sla: (a, b) => slaRank[a.state] - slaRank[b.state],
  replies: (a, b) => b.replies - a.replies,
}

export function TicketList({
  title,
  leading,
  trailing,
  tickets: all,
  selectedId,
  onSelect,
  onOpen,
  className,
}: {
  title: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  tickets: Ticket[]
  selectedId?: number
  onSelect: (id: number) => void
  onOpen: (id: number) => void
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<ActiveFilter[]>([])
  const [sort, setSort] = useState(sortOptions[0].id)
  const [checked, setChecked] = useState<number[]>([])
  const q = query.trim().toLowerCase().replace("#", "")
  const found = all.filter(
    (t) => (!q || t.customer.toLowerCase().includes(q) || String(t.id).includes(q)) && filters.every((f) => matches(t, f))
  )
  // Data is newest first, so "oldest" is a reverse; the rest are stable sorts on top of that order.
  const tickets = sort === "oldest" ? [...found].reverse() : [...found].sort(sorters[sort])
  const narrowed = Boolean(q) || filters.length > 0
  const shownChecked = checked.filter((id) => tickets.some((t) => t.id === id))
  const allChecked = tickets.length > 0 && shownChecked.length === tickets.length

  // ↑/↓ move the highlight between rows (focus follows); Enter or click opens the ticket.
  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    const rows = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-ticket-row]")]
    const from = rows.indexOf(document.activeElement as HTMLButtonElement)
    const index = from === -1 ? tickets.findIndex((t) => t.id === selectedId) : from
    const next = Math.min(Math.max(index + (e.key === "ArrowDown" ? 1 : -1), 0), tickets.length - 1)
    if (next === index) return
    e.preventDefault()
    rows[next]?.focus()
    onSelect(tickets[next].id)
  }

  return (
    <section aria-label={`${title} tickets`} className={cn("flex min-h-0 min-w-0 flex-col gap-3", className)}>
      <ViewToolbar
        leading={
          <>
            {leading}
            <h2 className="truncate text-sm text-muted-foreground">
              Tickets in <span className="font-medium text-foreground">{title}</span>
            </h2>
          </>
        }
        trailing={trailing}
        fields={fields}
        filters={filters}
        onFiltersChange={setFilters}
        sortOptions={sortOptions}
        sort={sort}
        onSortChange={setSort}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search customer or #ticket"
      />

      {/* Grows with its rows up to the space left in the window; past that the rows scroll inside the card. */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-muted/50 text-card-foreground">
        <div className="flex min-h-11 flex-wrap items-center gap-2 px-4 py-1.5">
          <Checkbox
            id="select-all-tickets"
            checked={allChecked ? true : shownChecked.length > 0 ? "indeterminate" : false}
            disabled={tickets.length === 0}
            onCheckedChange={() => setChecked(allChecked ? [] : tickets.map((t) => t.id))}
          />
          {shownChecked.length === 0 ? (
            <Label htmlFor="select-all-tickets" className="gap-2 text-sm font-medium">
              Select All <span className="font-normal text-muted-foreground tabular-nums">Shown {tickets.length}</span>
            </Label>
          ) : (
            <>
              <Label htmlFor="select-all-tickets" className="text-sm font-medium tabular-nums">
                {shownChecked.length} selected
              </Label>
              <div role="toolbar" aria-label="Bulk actions" className="ml-auto flex flex-wrap gap-1">
                <BulkActions />
              </div>
            </>
          )}
        </div>

        {tickets.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{narrowed ? "No matching tickets" : `No tickets in ${title}`}</EmptyTitle>
              <EmptyDescription>
                {narrowed ? "Try another search or remove a filter." : "Tickets in this view will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="min-h-0 overflow-hidden [&_[data-slot=scroll-area-viewport]>div]:block!">
            <ul onKeyDown={onKeyDown} className="flex flex-col gap-2 px-2 pb-2">
              {tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  active={t.id === selectedId}
                  checked={checked.includes(t.id)}
                  onCheckedChange={(v) => setChecked((ids) => (v ? [...ids, t.id] : ids.filter((id) => id !== t.id)))}
                  onSelect={() => {
                    onSelect(t.id)
                    onOpen(t.id)
                  }}
                  menu={<TicketActionMenuItems />}
                />
              ))}
            </ul>
          </ScrollArea>
        )}

        <div className="flex items-center justify-between gap-3 border-t bg-card px-4 py-2.5">
          <p className="text-sm text-muted-foreground tabular-nums">
            {tickets.length ? `1–${tickets.length}` : "0"} of {tickets.length}
          </p>
          {/* shortcut: one static page of sample data; wire real paging when a block needs more rows */}
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" aria-disabled="true" tabIndex={-1} className="pointer-events-none opacity-50" text="" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" aria-disabled="true" tabIndex={-1} className="pointer-events-none opacity-50" text="" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  )
}
