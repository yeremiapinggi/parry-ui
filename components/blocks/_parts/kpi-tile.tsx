import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "cn"

import { Stat } from "@/components/ui/stat"

export type KpiTrend = { change: number; goodWhen: "up" | "down"; label?: string }

// Compact Stat: uppercase muted label, mono tabular value. `hint` expands the abbreviation for screen readers and on hover.
// Stat's own delta treats "up" as good, so trends render here: the arrow follows the change, the colour follows goodWhen.
export function KpiTile({ label, value, hint, trend, className }: { label: string; value: string; hint?: string; trend?: KpiTrend; className?: string }) {
  const good = trend && (trend.change >= 0) === (trend.goodWhen === "up")
  const Arrow = trend && trend.change < 0 ? ArrowDownRightIcon : ArrowUpRightIcon
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
    >
      {trend && (
        <span className="flex items-center gap-1 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-success" : "text-destructive")}>
            <Arrow aria-hidden="true" className="size-3.5" />
            <span className="sr-only">{trend.change < 0 ? "down" : "up"}</span>
            {Math.abs(trend.change)}%
          </span>
          <span className="text-muted-foreground">{trend.label ?? "vs yesterday"}</span>
        </span>
      )}
    </Stat>
  )
}
