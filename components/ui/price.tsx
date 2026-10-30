import * as React from "react"

import { cn } from "cn"

// Formats an amount with Intl; pass originalAmount to show the struck-through price and discount.
function Price({
  amount,
  originalAmount,
  currency = "USD",
  locale = "en-US",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  amount: number
  originalAmount?: number
  currency?: string
  locale?: string
}) {
  const format = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "IDR" ? 0 : 2 })
  const discount = originalAmount && originalAmount > amount ? Math.round((1 - amount / originalAmount) * 100) : 0

  return (
    <span data-slot="price" className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular-nums", className)} {...props}>
      <span className="font-semibold">{format.format(amount)}</span>
      {discount > 0 && (
        <>
          <s className="text-sm text-muted-foreground">
            <span className="sr-only">Was </span>
            {format.format(originalAmount!)}
          </s>
          <span className="rounded-full bg-success-soft px-1.5 text-xs font-medium text-success">−{discount}%</span>
        </>
      )}
    </span>
  )
}

export { Price }
