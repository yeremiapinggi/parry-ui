"use client"

import { ClockIcon, EllipsisIcon, MessageSquareIcon } from "lucide-react"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { monthDay } from "@/components/blocks/_parts/time"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const stateBadge = (t: Ticket) => {
  switch (t.state) {
    case "replied":
      return <Badge variant="secondary">Replied</Badge>
    case "unreplied":
      return <Badge>Unreplied</Badge>
    case "pending":
      return (
        <Badge variant="outline">
          <ClockIcon />
          Pending
        </Badge>
      )
    case "out-sla":
      return (
        <Badge variant="destructive">
          <ClockIcon />
          {t.slaOverdue}
          <span className="sr-only">over SLA</span>
        </Badge>
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
      className="group relative flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground shadow hover:border-ring/50 data-[active=true]:border-primary data-[active=true]:ring-1 data-[active=true]:ring-primary"
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

      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="outline">
          {t.priority}
          <span className="sr-only">priority</span>
        </Badge>
        {stateBadge(t)}
        <Badge variant="outline" className="max-w-48">
          <ChannelIcon channel={t.channel} className="size-3.5 [&_svg]:size-2.5" />
          <span className="truncate">{t.account}</span>
        </Badge>
        {t.category && (
          <Badge variant="outline">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {t.category}
          </Badge>
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
