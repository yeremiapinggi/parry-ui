"use client"

import { ClockIcon, EllipsisVerticalIcon, MessageSquareIcon } from "lucide-react"

import type { Ticket } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { channelMeta } from "@/components/blocks/channel-meta"
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
      return <Badge variant="destructive">Out SLA · {t.slaOverdue}</Badge>
  }
}

// Whole row selects the ticket (stretched button); checkbox and kebab sit above it.
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
    <li data-active={active} className="relative flex gap-2.5 border-b px-3 py-2.5 hover:bg-muted/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
      {active && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
      <Checkbox
        className="relative z-10 mt-0.5"
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        aria-label={`Select ticket #${t.id} from ${t.customer}`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <button
            type="button"
            data-ticket-row
            aria-current={active ? "true" : undefined}
            onClick={onSelect}
            className="truncate text-left text-sm font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
          >
            {t.customer}
          </button>
          <span className="font-mono text-xs text-muted-foreground">#{t.id}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{t.time}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{t.preview}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <Badge variant="outline">
            <ChannelIcon channel={t.channel} className="size-3.5 [&_svg]:size-2.5" />
            {channelMeta[t.channel].typeLabel}
          </Badge>
          <Badge variant="outline" className="max-w-48 truncate">
            {t.account}
          </Badge>
          {stateBadge(t)}
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums" aria-label={`${t.replies} replies`}>
            <MessageSquareIcon aria-hidden="true" className="size-3.5" />
            {t.replies}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-xs" className="relative z-10 -mr-1" aria-label={`Actions for ticket #${t.id}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
