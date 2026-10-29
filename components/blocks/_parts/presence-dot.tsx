import { cn } from "cn"

import type { Presence } from "@/components/blocks/_data/team"

export const presenceMeta: Record<Presence, { label: string; dot: string }> = {
  available: { label: "Available", dot: "bg-success" },
  busy: { label: "Busy", dot: "bg-warning" },
  break: { label: "Break", dot: "bg-info" },
  offline: { label: "Offline", dot: "bg-muted-foreground" },
}

// Dot-only presence; the DS Status is a bordered pill with a visible label, too heavy for rows.
export function PresenceDot({ presence, className }: { presence: Presence; className?: string }) {
  return (
    <span className={cn("inline-block size-2 shrink-0 rounded-full", presenceMeta[presence].dot, className)}>
      <span className="sr-only">{presenceMeta[presence].label}</span>
    </span>
  )
}
