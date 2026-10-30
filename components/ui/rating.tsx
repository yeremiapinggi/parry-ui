"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { cn } from "cn"

const sizes = { sm: "size-4", default: "size-5", lg: "size-6" }

function Rating({
  value,
  onValueChange,
  max = 5,
  readOnly = false,
  size = "default",
  className,
  "aria-label": ariaLabel = "Rating",
}: {
  value: number
  onValueChange?: (value: number) => void
  max?: number
  readOnly?: boolean
  size?: keyof typeof sizes
  className?: string
  "aria-label"?: string
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const shown = hover ?? value
  const star = (i: number) => (
    <StarIcon className={cn(sizes[size], i <= shown ? "fill-warning text-warning" : "text-muted-foreground/40")} />
  )

  if (readOnly) {
    return (
      <span data-slot="rating" role="img" aria-label={`${ariaLabel}: ${value} out of ${max}`} className={cn("inline-flex gap-0.5", className)}>
        {Array.from({ length: max }, (_, i) => <React.Fragment key={i}>{star(i + 1)}</React.Fragment>)}
      </span>
    )
  }

  return (
    <div data-slot="rating" role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex gap-0.5", className)} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} out of ${max}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onValueChange?.(n)}
          className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {star(n)}
        </button>
      ))}
    </div>
  )
}

export { Rating }
