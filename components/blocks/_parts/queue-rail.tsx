"use client"

import {
  AlarmClockIcon,
  BookmarkIcon,
  CircleCheckIcon,
  CirclePauseIcon,
  InboxIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  PlusIcon,
  ShieldAlertIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "cn"

import { channels } from "@/components/blocks/_data/channels"
import { team, teamName } from "@/components/blocks/_data/team"
import { views, type ViewId } from "@/components/blocks/_data/tickets"
import { ChannelIcon } from "@/components/blocks/_parts/channel-icon"
import { PresenceDot } from "@/components/blocks/_parts/presence-dot"
import { channelMeta, type ChannelId } from "@/components/blocks/channel-meta"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type QueueKey = `view:${ViewId}` | `channel:${ChannelId}`

const viewIcons: Record<ViewId, LucideIcon> = {
  my: UserIcon,
  unreplied: MessageCircleIcon,
  progress: LoaderCircleIcon,
  pending: CirclePauseIcon,
  escalated: ShieldAlertIcon,
  "out-sla": AlarmClockIcon,
  bookmark: BookmarkIcon,
  closed: CircleCheckIcon,
  all: InboxIcon,
}

// Composed stand-in for a Sidebar primitive (the DS has none). Narrower than 10rem (a container query) it collapses to icons with tooltips.
export function QueueRail({
  selected,
  onSelect,
  counts,
  className,
}: {
  selected: QueueKey
  onSelect: (key: QueueKey) => void
  counts: Record<QueueKey, number>
  className?: string
}) {
  const online = team.filter((a) => a.presence !== "offline").length
  return (
    <nav aria-label="Ticket queues" className={cn("@container flex min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground", className)}>
      <ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block!">
        <div className="flex flex-col gap-4 p-2">
          <RailGroup title="Views">
            {views.map((v) => (
              <RailItem
                key={v.id}
                icon={<RailIcon icon={viewIcons[v.id]} />}
                label={v.label}
                count={counts[`view:${v.id}`]}
                active={selected === `view:${v.id}`}
                onClick={() => onSelect(`view:${v.id}`)}
              />
            ))}
          </RailGroup>

          <RailGroup
            title="Channels"
            action={
              <Button variant="ghost" size="icon-xs" aria-label="Add channel" className={railHover}>
                <PlusIcon />
              </Button>
            }
          >
            {channels.map((c) => (
              <RailItem
                key={c.id}
                icon={<ChannelIcon channel={c.id} muted={!c.connected} />}
                label={channelMeta[c.id].label}
                hint={c.connected ? undefined : "Disconnected"}
                count={counts[`channel:${c.id}`]}
                active={selected === `channel:${c.id}`}
                disabled={!c.connected}
                onClick={() => onSelect(`channel:${c.id}`)}
              />
            ))}
          </RailGroup>

          <RailGroup
            title={`Team ${teamName}`}
            action={
              <span className="text-xs tabular-nums @max-[10rem]:hidden" aria-label={`${online} of ${team.length} online`}>
                {online}/{team.length}
              </span>
            }
          >
            {team.map((a) => (
              <li key={a.id} className="flex h-8 items-center gap-2 px-2 text-sm @max-[10rem]:justify-center" title={a.name}>
                <PresenceDot presence={a.presence} />
                <span className="flex-1 truncate @max-[10rem]:sr-only">{a.name}</span>
                <span className="text-xs tabular-nums @max-[10rem]:hidden" aria-label={`${a.load} open tickets`}>
                  {a.load}
                </span>
              </li>
            ))}
          </RailGroup>
        </div>
      </ScrollArea>
    </nav>
  )
}

const railHover = "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring"

function RailIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" className="size-4 shrink-0" />
}

function RailGroup({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-0.5">
      <div className="flex h-7 items-center justify-between px-2 @max-[10rem]:justify-center">
        <h3 className="text-xs font-semibold tracking-wide uppercase @max-[10rem]:sr-only">{title}</h3>
        {action}
      </div>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </section>
  )
}

function RailItem({
  icon,
  label,
  hint,
  count,
  active,
  disabled,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  count: number
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-current={active ? "page" : undefined}
            disabled={disabled}
            onClick={onClick}
            className={cn(
              "h-8 w-full justify-start gap-2 px-2 font-normal @max-[10rem]:justify-center",
              railHover,
              active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            )}
          >
            {icon}
            <span className="flex-1 truncate text-left @max-[10rem]:sr-only">
              {label}
              {hint && <span className="ml-1.5 text-xs">· {hint}</span>}
            </span>
            <Badge variant="secondary" className="h-5 min-w-6 px-1.5 tabular-nums @max-[10rem]:hidden">
              {count}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="lg:hidden">
          {label} · {count}
        </TooltipContent>
      </Tooltip>
    </li>
  )
}
