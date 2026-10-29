import * as React from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "cn"

// KPI tile: label, big value, optional change vs. previous period, icon and a slot (e.g. a Sparkline) below.
function Stat({
  label,
  value,
  delta,
  deltaLabel = "vs last period",
  icon,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  // Percent change; positive is shown as good. Flip the sign for metrics where down is good.
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div data-slot="stat" className={cn("flex flex-col gap-2 rounded-xl border bg-card p-4 text-card-foreground", className)} {...props}>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        {icon && <span className="[&_svg]:size-4">{icon}</span>}
      </div>
      <div className="font-heading text-2xl font-semibold tabular-nums">{value}</div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", delta >= 0 ? "text-success" : "text-destructive")}>
            {delta >= 0 ? <ArrowUpRightIcon className="size-3.5" /> : <ArrowDownRightIcon className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">{deltaLabel}</span>
        </div>
      )}
      {children}
    </div>
  )
}

export { Stat }
