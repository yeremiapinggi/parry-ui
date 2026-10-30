import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { cn } from "cn"

// One quote: symbol, price and percent change, colored by direction.
function Ticker({
  symbol,
  price,
  change,
  currency = "USD",
  locale = "en-US",
  icon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  symbol: string
  price: number
  // Percent, e.g. 1.25 for +1.25%.
  change: number
  currency?: string
  locale?: string
  icon?: React.ReactNode
}) {
  const up = change >= 0
  const Trend = up ? TrendingUpIcon : TrendingDownIcon

  return (
    <div data-slot="ticker" className={cn("inline-flex items-center gap-2 text-sm tabular-nums", className)} {...props}>
      {icon}
      <span className="font-semibold">{symbol}</span>
      <span>{new Intl.NumberFormat(locale, { style: "currency", currency }).format(price)}</span>
      <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-success" : "text-destructive")}>
        <Trend className="size-3.5" aria-hidden />
        {up ? "+" : "−"}
        {Math.abs(change).toFixed(2)}%
      </span>
    </div>
  )
}

export { Ticker }
