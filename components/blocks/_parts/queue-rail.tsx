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

// In-page queue navigation for the inbox (views, channels, team), composed from Button and Badge.
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
    <nav aria-label="Ticket queues" className={cn("flex flex-col gap-5", className)}>
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
          <span className="text-xs tabular-nums" aria-label={`${online} of ${team.length} online`}>
            {online}/{team.length}
          </span>
        }
      >
        {team.map((a) => (
          <li key={a.id} className="flex h-8 items-center gap-2 px-2 text-sm" title={a.name}>
            <PresenceDot presence={a.presence} />
            <span className="flex-1 truncate">{a.name}</span>
            <span className="text-xs tabular-nums" aria-label={`${a.load} open tickets`}>
              {a.load}
            </span>
          </li>
        ))}
      </RailGroup>
    </nav>
  )
}

const railHover = "text-foreground hover:bg-accent hover:text-accent-foreground"

function RailIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden="true" className="size-4 shrink-0" />
}

function RailGroup({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-0.5">
      <div className="flex h-7 items-center justify-between px-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
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
      <Button
        variant="ghost"
        size="sm"
        aria-current={active ? "page" : undefined}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "relative h-8 w-full justify-start gap-2 px-2 font-normal",
          railHover,
          active && "bg-card font-medium text-foreground shadow-xs ring-1 ring-border hover:bg-card"
        )}
      >
        {icon}
        <span className="flex-1 truncate text-left">
          {label}
          {hint && <span className="ml-1.5 text-xs">· {hint}</span>}
        </span>
        <Badge variant={active ? "default" : "secondary"} className="h-5 min-w-6 px-1.5 tabular-nums">
          {count}
        </Badge>
      </Button>
    </li>
  )
}
