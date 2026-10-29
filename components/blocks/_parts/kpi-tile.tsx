import { cn } from "cn"

import { Stat } from "@/components/ui/stat"

// Compact Stat: uppercase muted label, mono tabular value. `hint` expands the abbreviation for screen readers and on hover.
export function KpiTile({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <Stat
      className={cn("gap-1 p-3", className)}
      title={hint}
      label={
        <span className="text-xs font-medium tracking-wide uppercase">
          {label}
          {hint && <span className="sr-only"> ({hint})</span>}
        </span>
      }
      value={<span className="font-mono text-xl">{value}</span>}
    />
  )
}
