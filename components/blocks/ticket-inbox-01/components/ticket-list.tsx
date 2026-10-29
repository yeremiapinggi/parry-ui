"use client"

import { useState } from "react"
import { InboxIcon, SearchIcon } from "lucide-react"

import { cn } from "cn"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { FilterChips, type FilterChip } from "@/components/blocks/_parts/filter-chips"
import { TicketRow } from "@/components/blocks/_parts/ticket-row"
import { BulkActions, TicketActionMenuItems } from "@/components/blocks/ticket-inbox-01/components/ticket-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  leading,
  tickets: all,
  selectedId,
  onSelect,
  onOpen,
  className,
}: {
  title: string
  leading?: React.ReactNode
  tickets: Ticket[]
  selectedId?: number
  onSelect: (id: number) => void
  onOpen: (id: number) => void
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [checked, setChecked] = useState<number[]>([])
  const q = query.trim().toLowerCase()
  const tickets = q ? all.filter((t) => t.customer.toLowerCase().includes(q) || String(t.id).includes(q.replace("#", ""))) : all
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
    <section aria-label={`${title} tickets`} className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          {leading}
          <h2 className="truncate text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{all.length}</span> tickets in{" "}
            <span className="font-medium text-foreground">{title}</span>
          </h2>
        </div>
        <InputGroup className="h-9 w-full bg-card sm:w-72">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search tickets by customer or number" placeholder="Search by customer or #ticket" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <FilterChips filters={filters} />

      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
        <div className="flex min-h-11 flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-1.5">
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
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{q ? "No matching tickets" : `No tickets in ${title}`}</EmptyTitle>
              <EmptyDescription>
                {q ? "Try another customer name or ticket number." : "Tickets that match this view and your filters will show up here."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul onKeyDown={onKeyDown} className="[&>li:last-child]:border-b-0">
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
        )}

        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
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
