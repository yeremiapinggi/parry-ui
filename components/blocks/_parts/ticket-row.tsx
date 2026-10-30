"use client"

import { ClockIcon, EllipsisIcon, FlagIcon, MessageSquareIcon, TagIcon } from "lucide-react"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { monthDay } from "@/components/blocks/_parts/time"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pill, PillIndicator } from "@/components/ui/pill"

// State reads from the indicator colour; pending and out-SLA add a clock since both are about waiting time.
const statePill = (t: Ticket) => {
  switch (t.state) {
    case "replied":
      return (
        <Pill>
          <PillIndicator variant="success" />
          Replied
        </Pill>
      )
    case "unreplied":
      return (
        <Pill>
          <PillIndicator variant="info" />
          Unreplied
        </Pill>
      )
    case "pending":
      return (
        <Pill>
          <ClockIcon className="text-warning" />
          Pending
        </Pill>
      )
    case "out-sla":
      return (
        <Pill className="text-destructive">
          <ClockIcon />
          {t.slaOverdue}
          <span className="sr-only">over SLA</span>
        </Pill>
      )
  }
}

// Card: the title is a stretched button that selects the ticket; checkbox and the hover "more" menu sit above it.
export function TicketRow({
  ticket: t,
  active,
  checked,
  onCheckedChange,
  onSelect,
  menu,
}: {
  ticket: Ticket
  active: boolean
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onSelect: () => void
  menu: React.ReactNode
}) {
  return (
    <li
      data-active={active}
      className="group relative flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 text-card-foreground shadow-xs hover:border-ring/50 data-[active=true]:border-ring/50"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          className="relative z-10"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          aria-label={`Select ticket #${t.id} from ${t.customer}`}
        />
        <span className="font-mono">#{t.id}</span>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>{t.initials}</AvatarFallback>
        </Avatar>
        <span className="truncate font-medium text-foreground">{t.customer}</span>
        <span className="ml-auto shrink-0 tabular-nums">{t.time}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          data-ticket-row
          aria-current={active ? "true" : undefined}
          onClick={onSelect}
          className="min-w-0 truncate text-left text-sm font-medium outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
        >
          {t.preview}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Pill>
          <FlagIcon className="text-muted-foreground" />
          {t.priority}
          <span className="sr-only">priority</span>
        </Pill>
        {statePill(t)}
        <Pill className="max-w-48">
          <ChannelIcon channel={t.channel} className="size-3.5" />
          <span className="truncate">{t.account}</span>
        </Pill>
        {t.category && (
          <Pill>
            <TagIcon className="text-muted-foreground" />
            {t.category}
          </Pill>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
        <span>Created {monthDay(t.createdAt)}</span>
        <span className="ml-auto inline-flex items-center gap-1" aria-label={`${t.replies} replies`}>
          <MessageSquareIcon aria-hidden="true" className="size-3.5" />
          {t.replies}
        </span>
      </div>

      {/* Shown on hover/focus over the time; always visible on touch screens, which have no hover. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-xs"
            className="absolute top-2.5 right-2.5 z-10 opacity-0 shadow-xs group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
            aria-label={`Actions for ticket #${t.id}`}
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
