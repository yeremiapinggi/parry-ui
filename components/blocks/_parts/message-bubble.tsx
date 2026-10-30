import { CheckCheckIcon, CheckIcon, ShieldAlertIcon, StickyNoteIcon } from "lucide-react"

import { cn } from "cn"

import type { Delivery, ThreadItem } from "@/components/blocks/_data/tickets"
import { clock, fullTime, relativeTime } from "@/components/blocks/_parts/time"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Relative time; the full timestamp shows on hover.
export function Stamp({ at, className }: { at: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={at} className={cn("tabular-nums", className)}>
          {relativeTime(at)}
        </time>
      </TooltipTrigger>
      <TooltipContent>{fullTime(at)}</TooltipContent>
    </Tooltip>
  )
}

const deliveryMeta: Record<Delivery, { label: string; icon: typeof CheckIcon; tone: string }> = {
  sent: { label: "Sent", icon: CheckIcon, tone: "text-muted-foreground" },
  delivered: { label: "Delivered", icon: CheckCheckIcon, tone: "text-muted-foreground" },
  read: { label: "Read", icon: CheckCheckIcon, tone: "text-info" },
}

/**
 * One timeline entry. `groupStart` / `groupEnd` mark the first and last of consecutive messages from the same sender:
 * the avatar and meta line only show on the last one, and spacing tightens inside a group.
 */
export function MessageBubble({
  item,
  initials,
  groupStart = true,
  groupEnd = true,
}: {
  item: ThreadItem
  initials: string
  groupStart?: boolean
  groupEnd?: boolean
}) {
  switch (item.kind) {
    case "system":
      return (
        <li className="self-center py-1 text-center text-xs text-muted-foreground">
          {item.body} · <span className="tabular-nums">{clock(item.at)}</span>
        </li>
      )
    case "note":
    case "escalation": {
      const note = item.kind === "note"
      const Icon = note ? StickyNoteIcon : ShieldAlertIcon
      return (
        <li
          className={cn(
            "mx-auto flex w-full max-w-xl flex-col gap-1 rounded-lg border px-3 py-2 text-sm",
            note ? "border-warning/40 bg-warning-soft" : "border-info/40 bg-info-soft"
          )}
        >
          <div className={cn("flex flex-wrap items-center gap-x-1.5 text-xs font-medium", note ? "text-warning" : "text-info")}>
            <Icon aria-hidden="true" className="size-3.5" />
            {note ? "Internal note" : `Escalated to ${item.to}`}
            <span className="font-normal text-muted-foreground">
              · {item.agent} · <Stamp at={item.at} />
            </span>
            {note && <span className="ml-auto font-normal text-muted-foreground">Only visible to agents</span>}
          </div>
          <p className="whitespace-pre-wrap text-foreground">{item.body}</p>
        </li>
      )
    }
    case "in":
      return (
        <li className={cn("flex max-w-[75%] items-end gap-2 self-start", !groupStart && "-mt-2")}>
          {groupEnd ? (
            <Avatar size="sm" className="mb-5">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <span aria-hidden="true" className="w-6 shrink-0" />
          )}
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className={cn("rounded-2xl border bg-card px-3 py-2 text-sm text-card-foreground", groupEnd ? "rounded-bl-sm" : "")}>{item.body}</p>
            {groupEnd && (
              <span className="px-1 text-xs text-muted-foreground">
                <Stamp at={item.at} />
              </span>
            )}
          </div>
        </li>
      )
    case "out": {
      const d = deliveryMeta[item.delivery]
      return (
        <li className={cn("flex max-w-[75%] flex-col items-end gap-1 self-end", !groupStart && "-mt-2")}>
          <p className={cn("rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground", groupEnd && "rounded-br-sm")}>{item.body}</p>
          {groupEnd && (
            <span className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              {item.agent} · <Stamp at={item.at} />
              <d.icon aria-label={d.label} className={cn("size-3.5", d.tone)} />
            </span>
          )}
        </li>
      )
    }
  }
}
