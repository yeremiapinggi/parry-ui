"use client"

import { useState } from "react"
import { InboxIcon } from "lucide-react"

import { cn } from "cn"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { FilterChips, type FilterChip } from "@/components/blocks/_parts/filter-chips"
import { TicketRow } from "@/components/blocks/_parts/ticket-row"
import { BulkActions, TicketActionMenuItems } from "@/components/blocks/ticket-inbox-01/components/ticket-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const filters: FilterChip[] = [
  { id: "date", label: "Date range", value: "Today" },
  { id: "assignee", label: "Assignee", value: "Anyone" },
  { id: "sort", label: "Sort", value: "Newest" },
  { id: "sentiment", label: "Sentiment", value: "All" },
  { id: "channel", label: "Channel type", value: "All" },
  { id: "lock", label: "Lock", value: "Unlocked" },
]

export function TicketList({
  title,
  tickets,
  selectedId,
  onSelect,
  className,
}: {
  title: string
  tickets: Ticket[]
  selectedId?: number
  onSelect: (id: number) => void
  className?: string
}) {
  const [mode, setMode] = useState("conversation")
  const [checked, setChecked] = useState<number[]>([])
  const shownChecked = checked.filter((id) => tickets.some((t) => t.id === id))
  const allChecked = tickets.length > 0 && shownChecked.length === tickets.length

  // ↑/↓ move the selection between rows and keep focus on the row that was selected.
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
    <section aria-label={`${title} tickets`} className={cn("flex min-h-0 flex-col border-r bg-card text-card-foreground", className)}>
      <header className="flex flex-col gap-2 border-b px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate font-heading text-base font-semibold">{title}</h2>
          <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={mode} onValueChange={(v) => v && setMode(v)} aria-label="List mode">
            <ToggleGroupItem value="conversation">Conversation</ToggleGroupItem>
            <ToggleGroupItem value="ticket">Ticket</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <FilterChips filters={filters} />
      </header>

      <div className="flex min-h-10 flex-wrap items-center gap-2 border-b px-3 py-1.5">
        <Checkbox
          id="select-all-tickets"
          checked={allChecked ? true : shownChecked.length > 0 ? "indeterminate" : false}
          disabled={tickets.length === 0}
          onCheckedChange={() => setChecked(allChecked ? [] : tickets.map((t) => t.id))}
        />
        {shownChecked.length === 0 ? (
          <Label htmlFor="select-all-tickets" className="text-sm font-normal text-muted-foreground">
            Select all · <span className="tabular-nums">{tickets.length}</span> shown
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
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon />
            </EmptyMedia>
            <EmptyTitle>No tickets in {title}</EmptyTitle>
            <EmptyDescription>Tickets that match this view and your filters will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block!">
          <ul onKeyDown={onKeyDown}>
            {tickets.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                active={t.id === selectedId}
                checked={checked.includes(t.id)}
                onCheckedChange={(v) => setChecked((ids) => (v ? [...ids, t.id] : ids.filter((id) => id !== t.id)))}
                onSelect={() => onSelect(t.id)}
                menu={<TicketActionMenuItems />}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </section>
  )
}
