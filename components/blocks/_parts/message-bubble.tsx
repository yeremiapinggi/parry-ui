import type { ThreadItem } from "@/components/blocks/_data/tickets"
import { Separator } from "@/components/ui/separator"

// One thread entry: day separator, centred system event, inbound (muted, left) or outbound (primary, right).
export function MessageBubble({ item }: { item: ThreadItem }) {
  switch (item.kind) {
    case "day":
      return (
        <li className="flex items-center gap-3 py-2 text-xs font-medium text-muted-foreground">
          <Separator className="flex-1" />
          {item.label}
          <Separator className="flex-1" />
        </li>
      )
    case "system":
      return (
        <li className="self-center rounded-full bg-muted px-3 py-1 text-center text-xs text-muted-foreground">
          {item.body} · <span className="tabular-nums">{item.time}</span>
        </li>
      )
    case "in":
      return (
        <li className="flex max-w-[75%] flex-col items-start gap-1 self-start">
          <p className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">{item.body}</p>
          <span className="px-1 text-xs text-muted-foreground tabular-nums">{item.time}</span>
        </li>
      )
    case "out":
      return (
        <li className="flex max-w-[75%] flex-col items-end gap-1 self-end">
          <p className="rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{item.body}</p>
          <span className="px-1 text-xs text-muted-foreground">
            {item.agent} · <span className="tabular-nums">{item.time}</span>
          </span>
        </li>
      )
  }
}
